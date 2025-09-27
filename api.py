#!/usr/bin/env python3
"""
Customer Intelligence System - FastAPI Backend
Middleware for processing call transcripts and managing user profiles
"""

import os
import sys
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any

import uvicorn
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import psycopg2
from psycopg2.extras import RealDictCursor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
DB_CONFIG = {
    "host": os.getenv("DATABASE_HOST", "localhost"),
    "port": int(os.getenv("DATABASE_PORT", 5432)),
    "database": os.getenv("DATABASE_NAME", "hackathon_db"),
    "user": os.getenv("DATABASE_USER", "hackathon_user"),
    "password": os.getenv("DATABASE_PASSWORD", "hackathon_pass"),
}


# Database connection helper
def get_db_connection():
    """Get database connection"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        raise HTTPException(status_code=500, detail="Database connection failed")


# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent / "src"))

# Try to import our existing ingestion functions
try:
    from src.ingestion.ingest_from_json import (
        identify_and_ensure_user as _identify_user,
        extract_facts as _extract_facts,
        refresh_user_profile as _refresh_profile,
        sync_user_table_data as _sync_data,
    )

    logger.info("Successfully imported ingestion functions from src/")

    # Create wrapper functions that adapt to the expected signatures
    def identify_user_only(customer_info):
        """
        Identify existing user from customer info WITHOUT creating new users
        """
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            # Use the original _identify_user function that ONLY identifies existing users
            user_id = _identify_user(
                cursor,
                {
                    "interaction_context": {
                        "contact_preferences": {
                            "email": customer_info.get("email"),
                            "phone_number": customer_info.get("phone"),
                        }
                    },
                    "authentication": {
                        "identity_verification": {
                            "address": customer_info.get("address"),
                            "date_of_birth": customer_info.get("dob"),
                        }
                    },
                    "conversation_metadata": {
                        "participants": {"client": customer_info.get("name")}
                    },
                },
            )

            if not user_id:
                raise HTTPException(
                    status_code=404,
                    detail=f"No existing user found for client: {customer_info.get('name')}. Available info: {customer_info}",
                )

            return user_id

        except Exception as e:
            logger.error(f"Error in identify_user_only: {e}")
            raise HTTPException(
                status_code=500, detail=f"Failed to identify user: {str(e)}"
            )
        finally:
            cursor.close()
            conn.close()

    def identify_and_ensure_user(customer_info):
        """Wrapper for identify_and_ensure_user that handles database connection"""
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            logger.info(f"Attempting to identify user with info: {customer_info}")

            # If customer_info is empty or None, create a default user
            if not customer_info or not any(customer_info.values()):
                logger.warning("No customer info provided, creating default user")
                customer_info = {
                    "name": "Unknown Customer",
                    "email": f"unknown_{datetime.now().strftime('%Y%m%d_%H%M%S')}@example.com",
                }

            # Convert customer_info to expected payload format
            payload = {
                "interaction_context": {
                    "contact_preferences": {
                        "email": customer_info.get("email"),
                        "phone_number": customer_info.get("phone"),
                    }
                },
                "authentication": {
                    "identity_verification": {
                        "address": customer_info.get("address"),
                        "date_of_birth": customer_info.get("dob"),
                        "other_details": customer_info.get("other_details"),
                    }
                },
                "conversation_metadata": {
                    "participants": {"client": customer_info.get("name")}
                },
            }
            user_id = _identify_user(cursor, payload)
            conn.commit()
            return user_id
        except Exception as e:
            conn.rollback()
            logger.error(f"Error in identify_and_ensure_user: {e}")
            # If identification fails, try to create a new user with available info
            try:
                import uuid

                new_user_id = str(uuid.uuid4())
                name = customer_info.get("name", "Unknown Customer")
                email = customer_info.get(
                    "email", f"user_{new_user_id[:8]}@example.com"
                )

                cursor.execute(
                    """
                    INSERT INTO users (user_id, email, phone_number, postal_address, metadata)
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (email) DO UPDATE SET 
                        phone_number = COALESCE(EXCLUDED.phone_number, users.phone_number),
                        postal_address = COALESCE(EXCLUDED.postal_address, users.postal_address)
                    RETURNING user_id
                    """,
                    (
                        new_user_id,
                        email,
                        customer_info.get("phone"),
                        customer_info.get("address"),
                        json.dumps(
                            {
                                "name": name,
                                "created_by": "api",
                                "created_at": datetime.now().isoformat(),
                            }
                        ),
                    ),
                )

                result = cursor.fetchone()
                if result:
                    user_id = result[0]
                    conn.commit()
                    logger.info(f"Created new user: {user_id} with email: {email}")
                    return user_id
                else:
                    # Get existing user by email
                    cursor.execute(
                        "SELECT user_id FROM users WHERE email = %s", (email,)
                    )
                    result = cursor.fetchone()
                    if result:
                        user_id = result[0]
                        logger.info(f"Found existing user: {user_id}")
                        return user_id

            except Exception as create_error:
                conn.rollback()
                logger.error(f"Failed to create user: {create_error}")
                raise HTTPException(
                    status_code=500,
                    detail=f"No existing user found for client: {customer_info.get('name')}. Failed to create new user: {str(create_error)}",
                )

            raise HTTPException(
                status_code=404,
                detail=f"No existing user found for client: {customer_info.get('name')}. Please ensure the user exists in the database first.",
            )
        finally:
            cursor.close()
            conn.close()

    def extract_facts(gemini_response):
        """Wrapper for extract_facts"""
        return _extract_facts(gemini_response)

    def refresh_user_profile(user_id):
        """Wrapper for refresh_user_profile"""
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            _refresh_profile(cursor, user_id)
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()

    def sync_user_table_data(user_id):
        """Wrapper for sync_user_table_data"""
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            _sync_data(cursor, user_id)
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()

except ImportError:
    # Fallback to scripts if src imports fail
    sys.path.insert(0, str(Path(__file__).parent / "scripts"))
    try:
        from scripts.test_ingest import (
            identify_and_ensure_user,
            extract_facts,
            refresh_user_profile,
            sync_user_table_data,
        )

        logger.info("Successfully imported ingestion functions from scripts/")
    except ImportError:
        logger.warning("Could not import ingestion functions, using mock functions")

        # Mock functions as fallback
        def identify_and_ensure_user(contact_info):
            import uuid

            return str(uuid.uuid4())

        def extract_facts(data):
            return [{"key": "mock", "value": "data"}]

        def refresh_user_profile(user_id):
            pass

        def sync_user_table_data(user_id):
            pass


# Pydantic models for API
class CallTranscript(BaseModel):
    """Input model for call transcript processing"""

    transcript: str = Field(..., description="The call transcript text")
    user_id: Optional[str] = Field(
        default=None, description="Optional user ID if known"
    )
    caller_info: Optional[Dict[str, Any]] = Field(
        default={}, description="Known caller information"
    )
    call_metadata: Optional[Dict[str, Any]] = Field(
        default={}, description="Call metadata (duration, agent, etc.)"
    )


class SimpleTranscript(BaseModel):
    """Input model for simple transcript processing with just text"""

    text: str = Field(..., description="The transcript text to process")


class ProcessingResponse(BaseModel):
    """Response model for transcript processing"""

    success: bool
    message: str
    user_id: Optional[str] = None
    call_id: Optional[str] = None
    facts_extracted: Optional[int] = None
    processing_time: Optional[float] = None


class UserProfile(BaseModel):
    """User profile response model"""

    user_id: str
    email: Optional[str]
    phone: Optional[str]
    address: Optional[str]
    profile_facts: List[Dict[str, Any]]
    total_events: int
    last_updated: Optional[datetime]


class FactsResponse(BaseModel):
    """Response model for facts queries"""

    total_facts: int
    facts: List[Dict[str, Any]]


# Initialize FastAPI app
app = FastAPI(
    title="Customer Intelligence System API",
    description="Backend API for processing call transcripts and managing customer profiles",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Mock Gemini API call (replace with actual API integration)
def call_gemini_api_real(transcript: str, caller_info: Dict = None) -> Dict:
    """
    Real Gemini API call for transcript analysis using the same approach as gemini_example.py
    """
    from dotenv import load_dotenv

    load_dotenv()

    try:
        from google import genai

        # Initialize Gemini client
        client = genai.Client()

        # Load the JSON template
        template_path = Path(__file__).parent / "prompts" / "template.json"
        with open(template_path, "r", encoding="utf-8") as f:
            template = json.load(f)

        # Create prompt exactly like in gemini_example.py
        prompt = f"""You are a helpful assistant that has to analyze the following phone call transcription between a customer and a bank operator.

TRANSCRIPTION:
{transcript}

Your mission is to extract the most relevant and important information from this bank call transcription and structure it according to the JSON template provided below. Fill in the placeholders with actual information from the call, or leave them as placeholders if the information is not available.

Be careful with the following points:

Customer problems or requests

Solutions proposed by the operator and tasks to be done

Any follow-up actions needed

Additional constraints:

duration must always be filled with a reasonable estimated call length, inferred from the transcript.

The field next_meeting in meeting_arrangements must be:

Filled with the scheduled meeting date and time if one was agreed during the call.

Otherwise, filled with the dates/times when the client is available for future contact.

Follow this JSON structure exactly:

{json.dumps(template, indent=2, ensure_ascii=False)}

Return only valid JSON following this structure. Use English for any text fields. If some information is not available, leave null."""

        logger.info("Calling Gemini API for transcript analysis...")

        # Call Gemini API
        response = client.models.generate_content(
            model="gemini-2.5-flash", contents=prompt
        )

        logger.info("Received response from Gemini API")

        # Parse JSON response
        try:
            # Remove markdown code block wrapper if present
            response_text = response.text.strip()
            if response_text.startswith("```json"):
                # Remove opening ```json and closing ```
                response_text = response_text[7:]  # Remove ```json
                if response_text.endswith("```"):
                    response_text = response_text[:-3]  # Remove closing ```
                response_text = response_text.strip()

            gemini_json = json.loads(response_text)
            logger.info("Successfully parsed Gemini response as JSON")
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Gemini response as JSON: {e}")
            # If response is not valid JSON, wrap it
            gemini_json = {
                "raw_response": response.text,
                "error": f"Failed to parse Gemini response as JSON: {str(e)}",
            }

        # Save the clean JSON response with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = (
            Path(__file__).parent / "results" / f"gemini_output_{timestamp}.json"
        )
        output_file.parent.mkdir(exist_ok=True)

        # Save clean JSON if parsing was successful, otherwise save raw response
        if "error" not in gemini_json:
            with open(output_file, "w", encoding="utf-8") as f:
                json.dump(gemini_json, f, indent=2, ensure_ascii=False)
        else:
            with open(output_file, "w", encoding="utf-8") as f:
                f.write(response.text)

        logger.info(f"Gemini response saved to {output_file}")

        return gemini_json

    except ImportError:
        logger.warning("Google GenAI library not available, using mock response")
        return None
    except Exception as e:
        logger.error(f"Error calling Gemini API: {e}")
        return None


# Main function to call Gemini (tries real API first, falls back to mock)
def call_gemini_api(transcript: str, caller_info: Dict = None) -> Dict:
    """
    Call Gemini API with fallback to mock
    """
    # For now, use real API if available, otherwise mock
    try:
        return call_gemini_api_real(transcript, caller_info)
    except Exception as e:
        logger.warning(f"Real Gemini API failed, using mock: {e}")
        return None


# API Routes


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Customer Intelligence System API", "status": "running"}


@app.get("/health")
async def health_check():
    """Detailed health check"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.close()
        conn.close()

        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Health check failed: {str(e)}")


@app.post("/process-transcript", response_model=ProcessingResponse)
async def process_transcript(
    transcript_data: CallTranscript, background_tasks: BackgroundTasks
):
    """
    Process a call transcript through Gemini AI and update customer knowledge
    """
    start_time = datetime.now()

    try:
        logger.info(
            f"Processing transcript of length {len(transcript_data.transcript)} characters"
        )

        # Step 1: Call Gemini API to analyze transcript
        gemini_response = call_gemini_api(
            transcript_data.transcript, transcript_data.caller_info
        )

        # Step 2: Identify or create user from new Gemini response format
        # Extract customer info from the new template structure
        customer_info = {}

        logger.info(f"DEBUG: Gemini response keys: {list(gemini_response.keys())}")

        # Get client name from conversation metadata
        if (
            "conversation_metadata" in gemini_response
            and "participants" in gemini_response["conversation_metadata"]
        ):
            participants = gemini_response["conversation_metadata"]["participants"]
            logger.info(f"DEBUG: Participants found: {participants}")
            customer_info["name"] = participants.get("client")
            logger.info(f"DEBUG: Extracted name: {customer_info.get('name')}")

        # Get contact info from interaction context
        if (
            "interaction_context" in gemini_response
            and "contact_preferences" in gemini_response["interaction_context"]
        ):
            contact_prefs = gemini_response["interaction_context"][
                "contact_preferences"
            ]
            logger.info(f"DEBUG: Contact prefs found: {contact_prefs}")
            customer_info["email"] = contact_prefs.get("email")
            customer_info["phone"] = contact_prefs.get("phone_number")
            logger.info(
                f"DEBUG: Extracted email: {customer_info.get('email')}, phone: {customer_info.get('phone')}"
            )

        # Get identity info from authentication
        if (
            "authentication" in gemini_response
            and "identity_verification" in gemini_response["authentication"]
        ):
            identity = gemini_response["authentication"]["identity_verification"]
            logger.info(f"DEBUG: Identity verification found: {identity}")
            customer_info["address"] = identity.get("address")
            customer_info["dob"] = identity.get("date_of_birth")
            customer_info["other_details"] = identity.get("other_details")
            logger.info(
                f"DEBUG: Extracted address: {customer_info.get('address')}, dob: {customer_info.get('dob')}"
            )

        # Fallback: use caller_info from request if Gemini response doesn't have customer info
        if not any(customer_info.values()) and transcript_data.caller_info:
            customer_info = transcript_data.caller_info

        logger.info(f"Final extracted customer info: {customer_info}")

        # SEMPRE identifica l'utente dal JSON di Gemini, non dal user_id del test
        # Questo è il flusso corretto: Transcript → Gemini → JSON → Identifica utente → Aggiorna DB

        # Check if we have valid customer info (ignore null values)
        valid_customer_info = {
            k: v for k, v in customer_info.items() if v is not None and v != ""
        }

        if not valid_customer_info:
            logger.error("No valid customer information found in Gemini response")
            raise HTTPException(
                status_code=400,
                detail="Cannot identify user: no valid customer information found in transcript",
            )

        logger.info(f"Valid customer info for identification: {valid_customer_info}")
        user_id = identify_user_only(valid_customer_info)

        logger.info(f"Identified user_id: {user_id}")

        # Step 3: Extract facts from Gemini response
        facts = extract_facts(gemini_response)

        # Step 4: Create call record and process facts in SINGLE TRANSACTION
        call_id = None
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            # Create call record
            language = gemini_response.get("conversation_metadata", {}).get(
                "language", "Unknown"
            )
            channel = (
                gemini_response.get("interaction_context", {})
                .get("contact_preferences", {})
                .get("preferred_channel", "phone")
            )

            cursor.execute(
                """
                INSERT INTO calls (user_id, language, channel, created_at)
                VALUES (%s, %s, %s, NOW())
                RETURNING call_id
                """,
                (user_id, language, channel),
            )
            call_id = cursor.fetchone()[0]
            logger.info(f"Created call record with call_id: {call_id}")

            # Try optional inserts in separate savepoints
            # Insert call transcript (if table exists)
            cursor.execute("SAVEPOINT transcript_insert")
            try:
                cursor.execute(
                    """
                    INSERT INTO call_transcript (call_id, transcript_text, created_at)
                    VALUES (%s, %s, NOW())
                    """,
                    (call_id, transcript_data.transcript),
                )
                cursor.execute("RELEASE SAVEPOINT transcript_insert")
                logger.info(f"Inserted transcript for call_id: {call_id}")
            except Exception as transcript_error:
                cursor.execute("ROLLBACK TO SAVEPOINT transcript_insert")
                logger.warning(
                    f"Could not insert transcript (table might not exist): {transcript_error}"
                )

            # Insert call payload (if table exists)
            cursor.execute("SAVEPOINT payload_insert")
            try:
                cursor.execute(
                    """
                    INSERT INTO call_payload (call_id, payload, created_at)
                    VALUES (%s, %s, NOW())
                    """,
                    (call_id, json.dumps(gemini_response)),
                )
                cursor.execute("RELEASE SAVEPOINT payload_insert")
                logger.info(f"Inserted payload for call_id: {call_id}")
            except Exception as payload_error:
                cursor.execute("ROLLBACK TO SAVEPOINT payload_insert")
                logger.warning(
                    f"Could not insert payload (table might not exist): {payload_error}"
                )

            # Process facts and update user profile in SAME TRANSACTION
            if facts:
                # Insert facts into database
                for fact_key, fact_value, fact_path, observed_at in facts:
                    # Convert fact_value to proper JSON format
                    if isinstance(fact_value, str):
                        json_value = json.dumps(fact_value)
                    else:
                        json_value = json.dumps(fact_value)

                    # Use NOW() for timestamp instead of potentially invalid observed_at
                    # Insert into user_fact_events with call_id
                    cursor.execute(
                        """
                        INSERT INTO user_fact_events (user_id, call_id, fact_key, fact_value, observed_at)
                        VALUES (%s, %s, %s, %s, NOW())
                        """,
                        (user_id, call_id, fact_key, json_value),
                    )

                    # Update user_profile_current
                    cursor.execute(
                        """
                        INSERT INTO user_profile_current (user_id, fact_key, fact_value, last_observed_at)
                        VALUES (%s, %s, %s, NOW())
                        ON CONFLICT (user_id, fact_key) 
                        DO UPDATE SET 
                            fact_value = EXCLUDED.fact_value,
                            last_observed_at = NOW()
                        """,
                        (user_id, fact_key, json_value),
                    )

                logger.info(
                    f"Successfully inserted {len(facts)} facts into database for user {user_id} (call_id: {call_id})"
                )

            # Commit everything in one transaction
            conn.commit()
            logger.info(
                f"Successfully created call records and facts for call_id: {call_id}"
            )

        except Exception as e:
            conn.rollback()
            logger.error(f"Error in database operations: {e}")
            raise e
        finally:
            cursor.close()
            conn.close()

        # Step 5: Update user profile (run in background for better performance)
        background_tasks.add_task(refresh_user_profile, user_id)
        background_tasks.add_task(sync_user_table_data, user_id)

        processing_time = (datetime.now() - start_time).total_seconds()

        logger.info(
            f"Transcript processed successfully: {len(facts)} facts extracted for user {user_id}"
        )

        return ProcessingResponse(
            success=True,
            message="Transcript processed successfully",
            user_id=user_id,
            call_id=call_id,
            facts_extracted=len(facts),
            processing_time=processing_time,
        )

    except Exception as e:
        logger.error(f"Transcript processing failed: {e}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")


@app.post("/process-text", response_model=ProcessingResponse)
async def process_transcript_text(
    transcript_data: SimpleTranscript, background_tasks: BackgroundTasks
):
    """
    Process transcript text directly without file reading
    Similar to /process-transcript but accepts plain text input
    """
    start_time = datetime.now()

    try:
        logger.info(f"Processing text of length {len(transcript_data.text)} characters")

        # Step 1: Call Gemini API with the provided text
        gemini_response = call_gemini_api(transcript_data.text, {})

        # Step 2: Extract customer info from Gemini response
        customer_info = {}

        logger.info(f"DEBUG: Gemini response keys: {list(gemini_response.keys())}")

        # Get client name from conversation metadata
        if (
            "conversation_metadata" in gemini_response
            and "participants" in gemini_response["conversation_metadata"]
        ):
            participants = gemini_response["conversation_metadata"]["participants"]
            logger.info(f"DEBUG: Participants found: {participants}")
            customer_info["name"] = participants.get("client")
            logger.info(f"DEBUG: Extracted name: {customer_info.get('name')}")

        # Get contact info from interaction context
        if (
            "interaction_context" in gemini_response
            and "contact_preferences" in gemini_response["interaction_context"]
        ):
            contact_prefs = gemini_response["interaction_context"][
                "contact_preferences"
            ]
            logger.info(f"DEBUG: Contact prefs found: {contact_prefs}")
            customer_info["email"] = contact_prefs.get("email")
            customer_info["phone"] = contact_prefs.get("phone_number")
            logger.info(
                f"DEBUG: Extracted email: {customer_info.get('email')}, phone: {customer_info.get('phone')}"
            )

        # Get identity info from authentication
        if (
            "authentication" in gemini_response
            and "identity_verification" in gemini_response["authentication"]
        ):
            identity = gemini_response["authentication"]["identity_verification"]
            logger.info(f"DEBUG: Identity verification found: {identity}")
            customer_info["address"] = identity.get("address")
            customer_info["dob"] = identity.get("date_of_birth")
            customer_info["other_details"] = identity.get("other_details")
            logger.info(
                f"DEBUG: Extracted address: {customer_info.get('address')}, dob: {customer_info.get('dob')}"
            )

        logger.info(f"Final extracted customer info: {customer_info}")

        # Check if we have valid customer info (ignore null values)
        valid_customer_info = {
            k: v for k, v in customer_info.items() if v is not None and v != ""
        }

        if not valid_customer_info:
            logger.error("No valid customer information found in Gemini response")
            raise HTTPException(
                status_code=400,
                detail="Cannot identify user: no valid customer information found in text",
            )

        logger.info(f"Valid customer info for identification: {valid_customer_info}")
        user_id = identify_user_only(valid_customer_info)

        logger.info(f"Identified user_id: {user_id}")

        # Step 3: Extract facts from Gemini response
        facts = extract_facts(gemini_response)

        # Step 4: Create call record and process facts in SINGLE TRANSACTION
        call_id = None
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            # Create call record
            language = gemini_response.get("conversation_metadata", {}).get(
                "language", "Unknown"
            )
            channel = (
                gemini_response.get("interaction_context", {})
                .get("contact_preferences", {})
                .get("preferred_channel", "phone")
            )

            cursor.execute(
                """
                INSERT INTO calls (user_id, language, channel, created_at)
                VALUES (%s, %s, %s, NOW())
                RETURNING call_id
                """,
                (user_id, language, channel),
            )
            call_id = cursor.fetchone()[0]
            logger.info(f"Created call record with call_id: {call_id}")

            # Try optional inserts in separate savepoints
            # Insert call transcript
            cursor.execute("SAVEPOINT transcript_insert")
            try:
                cursor.execute(
                    """
                    INSERT INTO call_transcript (call_id, transcript_text, created_at)
                    VALUES (%s, %s, NOW())
                    """,
                    (call_id, transcript_data.text),
                )
                cursor.execute("RELEASE SAVEPOINT transcript_insert")
                logger.info(f"Inserted transcript for call_id: {call_id}")
            except Exception as transcript_error:
                cursor.execute("ROLLBACK TO SAVEPOINT transcript_insert")
                logger.warning(f"Could not insert transcript: {transcript_error}")

            # Insert call payload
            cursor.execute("SAVEPOINT payload_insert")
            try:
                cursor.execute(
                    """
                    INSERT INTO call_payload (call_id, payload, created_at)
                    VALUES (%s, %s, NOW())
                    """,
                    (call_id, json.dumps(gemini_response)),
                )
                cursor.execute("RELEASE SAVEPOINT payload_insert")
                logger.info(f"Inserted payload for call_id: {call_id}")
            except Exception as payload_error:
                cursor.execute("ROLLBACK TO SAVEPOINT payload_insert")
                logger.warning(f"Could not insert payload: {payload_error}")

            # Process facts and update user profile in SAME TRANSACTION
            if facts:
                # Insert facts into database
                for fact_key, fact_value, fact_path, observed_at in facts:
                    # Convert fact_value to proper JSON format
                    if isinstance(fact_value, str):
                        json_value = json.dumps(fact_value)
                    else:
                        json_value = json.dumps(fact_value)

                    # Insert into user_fact_events with call_id
                    cursor.execute(
                        """
                        INSERT INTO user_fact_events (user_id, call_id, fact_key, fact_value, observed_at)
                        VALUES (%s, %s, %s, %s, NOW())
                        """,
                        (user_id, call_id, fact_key, json_value),
                    )

                    # Update user_profile_current
                    cursor.execute(
                        """
                        INSERT INTO user_profile_current (user_id, fact_key, fact_value, last_observed_at)
                        VALUES (%s, %s, %s, NOW())
                        ON CONFLICT (user_id, fact_key) 
                        DO UPDATE SET 
                            fact_value = EXCLUDED.fact_value,
                            last_observed_at = NOW()
                        """,
                        (user_id, fact_key, json_value),
                    )

                logger.info(
                    f"Successfully inserted {len(facts)} facts into database for user {user_id} (call_id: {call_id})"
                )

            # Commit everything in one transaction
            conn.commit()
            logger.info(
                f"Successfully created call records and facts for call_id: {call_id}"
            )

        except Exception as e:
            conn.rollback()
            logger.error(f"Error in database operations: {e}")
            raise e
        finally:
            cursor.close()
            conn.close()

        # Step 5: Update user profile (run in background for better performance)
        background_tasks.add_task(refresh_user_profile, user_id)
        background_tasks.add_task(sync_user_table_data, user_id)

        processing_time = (datetime.now() - start_time).total_seconds()

        logger.info(
            f"Text processed successfully: {len(facts)} facts extracted for user {user_id}"
        )

        return ProcessingResponse(
            success=True,
            message="Text processed successfully",
            user_id=user_id,
            call_id=call_id,
            facts_extracted=len(facts),
            processing_time=processing_time,
        )

    except Exception as e:
        logger.error(f"Text processing failed: {e}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")


@app.get("/users/{name}")
async def get_user_by_name(name: str):
    """Get comprehensive user information by name (searches in name, email, phone, address)"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        # Enhanced search across multiple fields with JOIN to user_static for names
        cursor.execute(
            """
            SELECT 
                u.user_id, u.email, u.phone_number, u.postal_address, u.created_at, u.metadata,
                us.first_name, us.last_name, us.birth_date, us.birth_place, us.nationality, us.tax_id
            FROM users u
            LEFT JOIN user_static us ON u.user_id = us.user_id
            WHERE LOWER(u.email) LIKE LOWER(%s) 
               OR LOWER(u.metadata ->> 'name') LIKE LOWER(%s)
               OR LOWER(u.phone_number) LIKE LOWER(%s)
               OR LOWER(u.postal_address) LIKE LOWER(%s)
               OR LOWER(CONCAT(us.first_name, ' ', us.last_name)) LIKE LOWER(%s)
               OR LOWER(us.first_name) LIKE LOWER(%s)
               OR LOWER(us.last_name) LIKE LOWER(%s)
            LIMIT 1
            """,
            (
                f"%{name}%",
                f"%{name}%",
                f"%{name}%",
                f"%{name}%",
                f"%{name}%",
                f"%{name}%",
                f"%{name}%",
            ),
        )
        user_data = cursor.fetchone()

        if not user_data:
            cursor.close()
            conn.close()
            raise HTTPException(
                status_code=404, detail=f"User with name '{name}' not found"
            )

        # Get current profile facts
        cursor.execute(
            """
            SELECT fact_key, fact_value
            FROM user_fact_events 
            WHERE user_id = %s
            ORDER BY fact_key
            """,
            (user_data["user_id"],),
        )
        profile_facts = cursor.fetchall()

        cursor.close()
        conn.close()

        return {
            "user_id": user_data["user_id"],
            "email": user_data["email"],
            "phone_number": user_data["phone_number"],
            "postal_address": user_data["postal_address"],
            "first_name": user_data.get("first_name"),
            "last_name": user_data.get("last_name"),
            "birth_date": user_data.get("birth_date"),
            "birth_place": user_data.get("birth_place"),
            "tax_id": user_data.get("tax_id"),
            "nationality": user_data.get("nationality"),
            "created_at": user_data["created_at"],
            "metadata": user_data["metadata"],
            "profile_facts": [dict(fact) for fact in profile_facts],
        }

    except HTTPException:
        raise  # Re-raise HTTP exceptions (like 404)
    except Exception as e:
        logger.error(f"Failed to get user info for '{name}': {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to get user info: {str(e)}"
        )


@app.get("/latest-payload/{name}")
async def get_latest_payload(name: str):
    """Get the latest call payload for a user by name"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        # Find user_id by name (searches in name, email, phone, address)
        cursor.execute(
            """
            SELECT payload
            FROM call_payload
            WHERE call_id IN (
                SELECT c.call_id
                FROM calls c
                JOIN users u ON c.user_id = u.user_id
                LEFT JOIN user_static us ON u.user_id = us.user_id
                WHERE LOWER(u.email) LIKE LOWER(%s) 
                   OR LOWER(u.metadata ->> 'name') LIKE LOWER(%s)
                   OR LOWER(u.phone_number) LIKE LOWER(%s)
                   OR LOWER(u.postal_address) LIKE LOWER(%s)
                   OR LOWER(CONCAT(us.first_name, ' ', us.last_name)) LIKE LOWER(%s)
                   OR LOWER(us.first_name) LIKE LOWER(%s)
                   OR LOWER(us.last_name) LIKE LOWER(%s)
                ORDER BY c.created_at DESC
                LIMIT 1
            )
            ORDER BY created_at DESC
            LIMIT 1
            """,
            (name, name, name, name, name, name, name),
        )
        user_data = cursor.fetchone()

        if not user_data:
            cursor.close()
            conn.close()
            raise HTTPException(
                status_code=404, detail=f"User with name '{name}' not found"
            )
        user_id = user_data["user_id"]
        logger.info(f"Found user_id {user_id} for name '{name}'")
        return user_data
    except HTTPException:
        raise  # Re-raise HTTP exceptions (like 404)
    except Exception as e:
        logger.error(f"Failed to get user_id for '{name}': {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get user_id: {str(e)}")


# Development server
if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True, log_level="info")
