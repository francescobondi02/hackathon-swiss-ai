#!/usr/bin/env python3
import sys, json, os
from datetime import datetime, timezone
from dateutil import parser as dtparser
import psycopg2
import psycopg2.extras as extras

# --- Config via ENV ---
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_NAME = os.getenv("DB_NAME", "hackathon_db")
DB_USER = os.getenv("DB_USER", "hackathon_user")
DB_PASS = os.getenv("DB_PASS", "hackathon_pass")

PLACEHOLDERS = {
    "adresse",
    "drachen",
    "n/a",
    "unknown",
    "null",
    "redacted",
    "<placeholder>",
    "<dob_placeholder>",
    "<address_placeholder>",
}


# ---------- Tiny utils ----------
def is_placeholder(v):
    if v is None:
        return True
    s = str(v).strip().lower()
    return s in PLACEHOLDERS or (s.startswith("<") and s.endswith(">"))


def get(d, *path):
    cur = d
    for p in path:
        if not isinstance(cur, dict) or p not in cur:
            return None
        cur = cur[p]
    return cur


def to_bool(v):
    if v is None:
        return None
    if isinstance(v, bool):
        return v
    s = str(v).strip().lower()
    if s in ("yes", "true", "y", "1"):
        return True
    if s in ("no", "false", "n", "0"):
        return False
    return None


def parse_obs(observed_at):
    if observed_at:
        try:
            dt = dtparser.parse(observed_at)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            else:
                dt = dt.astimezone(timezone.utc)
            return dt
        except Exception:
            pass
    return datetime.now(timezone.utc)


def table_exists(cur, name):
    cur.execute(
        """select 1
                   from information_schema.tables
                   where table_schema='public' and table_name=%s""",
        (name,),
    )
    return cur.fetchone() is not None


# ---------- DB helpers ----------
def identify_and_ensure_user(cur, payload):
    """Identify user through multiple authentication methods, prioritizing existing users"""

    # Extract all potential identifiers from payload
    email = get(payload, "interaction_context", "contact_preferences", "email")
    phone = get(payload, "interaction_context", "contact_preferences", "phone_number")
    address = get(payload, "authentication", "identity_verification", "address")
    dob = get(payload, "authentication", "identity_verification", "date_of_birth")
    other_details = get(
        payload, "authentication", "identity_verification", "other_details"
    )
    client_name = get(payload, "conversation_metadata", "participants", "client")

    print(f"🔍 Searching for user with:")
    if client_name and not is_placeholder(client_name):
        print(f"   👤 Name: {client_name}")
    if email and not is_placeholder(email):
        print(f"   📧 Email: {email}")
    if phone and not is_placeholder(phone):
        print(f"   📞 Phone: {phone}")
    if address and not is_placeholder(address):
        print(f"   📍 Address: {address}")

    # Method 1: Try to find existing user by name first (most reliable for this case)
    if client_name and not is_placeholder(client_name):
        cur.execute(
            """SELECT user_id, email FROM users 
               WHERE metadata->>'name' = %s OR 
                     metadata->>'client_name' = %s OR
                     LOWER(metadata->>'name') = LOWER(%s)""",
            (client_name, client_name, client_name),
        )
        result = cur.fetchone()
        if result:
            print(f"✅ Found existing user by name: {client_name} -> {result[1]}")
            return result[0]

    # Method 2: Try to find existing user by email
    if email and not is_placeholder(email):
        cur.execute("SELECT user_id FROM users WHERE email = %s", (email,))
        result = cur.fetchone()
        if result:
            print(f"✅ Found existing user by email: {email}")
            return result[0]

    # Method 3: Try to find existing user by phone
    if phone and not is_placeholder(phone):
        cur.execute("SELECT user_id FROM users WHERE phone_number = %s", (phone,))
        result = cur.fetchone()
        if result:
            print(f"✅ Found existing user by phone: {phone}")
            return result[0]

    # Method 4: Try to find existing user by similar address (fuzzy matching)
    if address and not is_placeholder(address):
        # Try exact match first
        cur.execute("SELECT user_id FROM users WHERE postal_address = %s", (address,))
        result = cur.fetchone()
        if result:
            print(f"✅ Found existing user by exact address: {address}")
            return result[0]

        # Try fuzzy address matching (remove CAP, normalize spaces)
        address_clean = address.replace(",", "").replace("  ", " ").strip().lower()
        cur.execute(
            """SELECT user_id, postal_address FROM users 
               WHERE LOWER(REPLACE(REPLACE(postal_address, ',', ''), '  ', ' ')) LIKE %s""",
            (f"%{address_clean}%",),
        )
        result = cur.fetchone()
        if result:
            print(
                f"✅ Found existing user by similar address: {address} -> {result[1]}"
            )
            return result[0]

    # If no existing user found, raise an error instead of creating a new one
    print("❌ No existing user found!")
    print("Available identifiers:")
    print(f"  - Name: {client_name}")
    print(f"  - Email: {email}")
    print(f"  - Phone: {phone}")
    print(f"  - Address: {address}")
    print(f"  - DOB: {dob}")

    raise ValueError(
        f"No existing user found for client: {client_name}. Please ensure the user exists in the database first."
    )


def ensure_user_by_email(cur, email):
    """Find or create user by email"""
    cur.execute(
        """
        insert into users (email, postal_address, phone_number, metadata)
        values (%s, 'N/A', 'N/A', jsonb_build_object('auth_method', 'email', 'created_at', now()::text))
        on conflict (email) do update set email=excluded.email
        returning user_id
    """,
        (email,),
    )
    return cur.fetchone()[0]


def ensure_user_by_phone(cur, phone):
    """Find or create user by phone number"""
    # First try to find existing user with this phone number
    cur.execute(
        """
        select user_id from users where phone_number = %s
        limit 1
    """,
        (phone,),
    )
    result = cur.fetchone()
    if result:
        return result[0]

    # Create new user with phone-based email
    phone_clean = "".join(c for c in phone if c.isdigit())
    email = f"phone_{phone_clean}@placeholder.local"
    cur.execute(
        """
        insert into users (email, postal_address, phone_number, metadata)
        values (%s, 'N/A', %s, jsonb_build_object('auth_method', 'phone', 'created_at', now()::text))
        on conflict (email) do update set phone_number = excluded.phone_number
        returning user_id
    """,
        (email, phone),
    )
    return cur.fetchone()[0]


def ensure_user_by_address(cur, address):
    """Find or create user by address"""
    # First try to find existing user with this address
    cur.execute(
        """
        select user_id from users where postal_address = %s
        limit 1
    """,
        (address,),
    )
    result = cur.fetchone()
    if result:
        return result[0]

    # Create new user with address-based identifier
    address_hash = str(hash(address))[-8:]  # Last 8 chars of hash
    email = f"address_{address_hash}@placeholder.local"
    cur.execute(
        """
        insert into users (email, postal_address, phone_number, metadata)
        values (%s, %s, 'N/A', jsonb_build_object('auth_method', 'address', 'created_at', now()::text))
        on conflict (email) do update set postal_address = excluded.postal_address
        returning user_id
    """,
        (email, address),
    )
    return cur.fetchone()[0]


def ensure_user_by_identity(cur, dob, other_details):
    """Find or create user by date of birth + other details"""
    # Try to find existing user with matching identity in metadata
    cur.execute(
        """
        select user_id from users
        where metadata->>'dob' = %s and metadata->>'other_details' = %s
        limit 1
    """,
        (dob, other_details),
    )
    result = cur.fetchone()
    if result:
        return result[0]

    # Create new user with identity-based identifier
    identity_hash = str(hash(f"{dob}_{other_details}"))[-8:]
    email = f"identity_{identity_hash}@placeholder.local"
    cur.execute(
        """
        insert into users (email, postal_address, phone_number, metadata)
        values (%s, 'N/A', 'N/A', jsonb_build_object('auth_method', 'identity', 'dob', %s, 'other_details', %s, 'created_at', now()::text))
        on conflict (email) do update set metadata = excluded.metadata
        returning user_id
    """,
        (email, dob, other_details),
    )
    return cur.fetchone()[0]


def ensure_user_by_name(cur, client_name):
    """Find or create user by client name (fallback method)"""
    # Try to find existing user with this name in metadata
    cur.execute(
        """
        select user_id from users
        where metadata->>'name' = %s or metadata->>'client_name' = %s
        limit 1
    """,
        (client_name, client_name),
    )
    result = cur.fetchone()
    if result:
        return result[0]

    # Create new user with name-based identifier
    name_clean = "".join(c.lower() for c in client_name if c.isalnum())
    email = f"name_{name_clean}@placeholder.local"
    cur.execute(
        """
        insert into users (email, postal_address, phone_number, metadata)
        values (%s, 'N/A', 'N/A', jsonb_build_object('auth_method', 'name', 'name', %s, 'created_at', now()::text))
        on conflict (email) do update set metadata = excluded.metadata
        returning user_id
    """,
        (email, client_name),
    )
    return cur.fetchone()[0]


def create_call_if_possible(cur, user_id, lang, channel):
    if not table_exists(cur, "calls"):
        return None
    cur.execute(
        """
        insert into calls (user_id, language, channel, created_at)
        values (%s, %s, %s, now())
        returning call_id
    """,
        (user_id, lang, channel or "phone"),
    )
    return cur.fetchone()[0]


def insert_event(cur, user_id, call_id, observed_at, fact_key, fact_value, source_path):
    obs = parse_obs(observed_at)
    cur.execute(
        """
        insert into user_fact_events
          (user_id, call_id, observed_at, fact_key, fact_value, source_path)
        values (%s, %s, %s, %s, %s::jsonb, %s)
        on conflict (user_id, fact_key, observed_at, source_path) do nothing
        returning event_id
    """,
        (user_id, call_id, obs, fact_key, json.dumps(fact_value), source_path),
    )
    row = cur.fetchone()
    return bool(row)  # True se inserito, False se già presente


def refresh_user_profile(cur, user_id):
    """Refresh user_profile_current table for a specific user"""
    cur.execute(
        """
        -- Delete existing profile for this user
        delete from user_profile_current where user_id = %s;
        
        -- Insert latest facts for this user
        insert into user_profile_current (user_id, fact_key, fact_value, last_observed_at)
        select 
            user_id,
            fact_key,
            fact_value,
            observed_at as last_observed_at
        from (
            select 
                user_id,
                fact_key,
                fact_value,
                observed_at,
                row_number() over (partition by user_id, fact_key order by observed_at desc) as rn
            from user_fact_events
            where user_id = %s
        ) latest
        where rn = 1;
    """,
        (user_id, user_id),
    )


def sync_user_table_data(cur, user_id):
    """Synchronize main user data in users table with latest profile facts"""
    
    # Get latest values from profile for key fields
    cur.execute("""
        SELECT fact_key, fact_value 
        FROM user_profile_current 
        WHERE user_id = %s 
        AND fact_key IN ('contact.email', 'contact.phone', 'identity.address')
    """, (user_id,))
    
    facts = dict(cur.fetchall())
    updates = []
    params = []
    
    # Build dynamic update query based on available facts
    if 'contact.email' in facts and facts['contact.email'] and not is_placeholder(facts['contact.email']):
        updates.append("email = %s")
        params.append(facts['contact.email'])
        print(f"🔄 Updating email to: {facts['contact.email']}")
    
    if 'contact.phone' in facts and facts['contact.phone'] and not is_placeholder(facts['contact.phone']):
        updates.append("phone_number = %s")  
        params.append(facts['contact.phone'])
        print(f"🔄 Updating phone to: {facts['contact.phone']}")
        
    if 'identity.address' in facts and facts['identity.address'] and not is_placeholder(facts['identity.address']):
        updates.append("postal_address = %s")
        params.append(facts['identity.address'])
        print(f"🔄 Updating address to: {facts['identity.address']}")
    
    # Execute update if we have changes
    if updates:
        params.append(user_id)  # For WHERE clause
        query = f"""
            UPDATE users 
            SET {', '.join(updates)}
            WHERE user_id = %s
        """
        cur.execute(query, params)
        print(f"✅ Users table synchronized ({len(updates)} fields updated)")
    else:
        print("ℹ️  No main user data changes to sync")


# ---------- Extraction ----------
def extract_facts(payload):
    facts = []
    # timestamp base dal JSON (se presente)
    observed_base = get(payload, "conversation_metadata", "date")

    # 1) pref.language
    lang = get(payload, "conversation_metadata", "language")
    if lang and not is_placeholder(lang):
        facts.append(
            ("pref.language", lang, "$.conversation_metadata.language", observed_base)
        )

    # 2) pref.contact_channel
    chan = get(
        payload, "interaction_context", "contact_preferences", "preferred_channel"
    )
    if chan and not is_placeholder(chan):
        facts.append(
            (
                "pref.contact_channel",
                chan,
                "$.interaction_context.contact_preferences.preferred_channel",
                observed_base,
            )
        )

    # 3) Remove the combined contact object to avoid duplication
    # Keep only individual contact facts for better granular tracking

    # 4) individual contact facts for better tracking
    cp = get(payload, "interaction_context", "contact_preferences") or {}
    if isinstance(cp, dict):
        if cp.get("email") and not is_placeholder(cp.get("email")):
            facts.append(
                (
                    "contact.email",
                    cp["email"],
                    "$.interaction_context.contact_preferences.email",
                    observed_base,
                )
            )
        if cp.get("phone_number") and not is_placeholder(cp.get("phone_number")):
            facts.append(
                (
                    "contact.phone",
                    cp["phone_number"],
                    "$.interaction_context.contact_preferences.phone_number",
                    observed_base,
                )
            )
    idv = get(payload, "authentication", "identity_verification") or {}
    if isinstance(idv, dict):
        if idv.get("address") and not is_placeholder(idv.get("address")):
            facts.append(
                (
                    "identity.address",
                    idv["address"],
                    "$.authentication.identity_verification.address",
                    observed_base,
                )
            )
        if idv.get("date_of_birth") and not is_placeholder(idv.get("date_of_birth")):
            facts.append(
                (
                    "identity.dob",
                    idv["date_of_birth"],
                    "$.authentication.identity_verification.date_of_birth",
                    observed_base,
                )
            )
        if idv.get("other_details") and not is_placeholder(idv.get("other_details")):
            facts.append(
                (
                    "identity.other_details",
                    idv["other_details"],
                    "$.authentication.identity_verification.other_details",
                    observed_base,
                )
            )

    # 4b) individual contact facts for better tracking
    cp = get(payload, "interaction_context", "contact_preferences") or {}
    if isinstance(cp, dict):
        if cp.get("email") and not is_placeholder(cp.get("email")):
            facts.append(
                (
                    "contact.email",
                    cp["email"],
                    "$.interaction_context.contact_preferences.email",
                    observed_base,
                )
            )
        if cp.get("phone_number") and not is_placeholder(cp.get("phone_number")):
            facts.append(
                (
                    "contact.phone",
                    cp["phone_number"],
                    "$.interaction_context.contact_preferences.phone_number",
                    observed_base,
                )
            )

    # 6) meeting.follow_up_required
    fur = get(
        payload, "interaction_context", "meeting_arrangements", "follow_up_required"
    )
    fur_b = to_bool(fur)
    if fur_b is not None:
        facts.append(
            (
                "meeting.follow_up_required",
                fur_b,
                "$.interaction_context.meeting_arrangements.follow_up_required",
                observed_base,
            )
        )

    # 7) meeting.next (una riga per oggetto)
    nexts = (
        get(payload, "interaction_context", "meeting_arrangements", "next_meeting")
        or []
    )
    if isinstance(nexts, list):
        for i, m in enumerate(nexts):
            if isinstance(m, dict):
                item = {
                    "date": m.get("date"),
                    "time": m.get("time"),
                    "type": m.get("type"),
                    "purpose": m.get("purpose"),
                }
                facts.append(
                    (
                        "meeting.next",
                        item,
                        f"$.interaction_context.meeting_arrangements.next_meeting[{i}]",
                        item.get("date") or observed_base,
                    )
                )

    # 8) account (object)
    acct = get(payload, "financial_information", "accounts")
    if isinstance(acct, dict) and any(
        k in acct
        for k in (
            "balances",
            "overdraft_limit",
            "credit_card_limit",
            "recent_transactions",
        )
    ):
        facts.append(
            ("account", acct, "$.financial_information.accounts", observed_base)
        )

    # 9) invest (object)
    inv = get(payload, "financial_information", "investment_preferences")
    if isinstance(inv, dict) and any(
        k in inv for k in ("risk_profile", "products_discussed", "goals")
    ):
        facts.append(
            (
                "invest",
                inv,
                "$.financial_information.investment_preferences",
                observed_base,
            )
        )

    # 10) sentiment (object) map fields
    sent = get(payload, "client_sentiment")
    if isinstance(sent, dict):
        mapped = {
            "emotions": sent.get("expressed_emotions"),
            "confidence": sent.get("confidence_level"),
            "trust": sent.get("trust_in_bank"),
        }
        mapped = {
            k: v
            for k, v in mapped.items()
            if v not in (None, "") and not is_placeholder(v)
        }
        if mapped:
            facts.append(("sentiment", mapped, "$.client_sentiment", observed_base))

    # 11) feedback (object)
    fb = get(payload, "feedback_and_suggestions")
    if isinstance(fb, dict):
        mapped = {
            "client_feedback": fb.get("client_feedback"),
            "suggestions": fb.get("suggestions_for_services"),
        }
        mapped = {k: v for k, v in mapped.items() if v not in (None, "")}
        if mapped:
            facts.append(
                ("feedback", mapped, "$.feedback_and_suggestions", observed_base)
            )

    # 12) kyc (object)
    kyc = get(payload, "compliance_and_regulatory", "kyc_updates")
    if isinstance(kyc, dict) and kyc:
        facts.append(
            ("kyc", kyc, "$.compliance_and_regulatory.kyc_updates", observed_base)
        )

    # 13) security (object)
    sec = get(payload, "compliance_and_regulatory", "security_concerns")
    if isinstance(sec, dict) and sec:
        facts.append(
            (
                "security",
                sec,
                "$.compliance_and_regulatory.security_concerns",
                observed_base,
            )
        )

    return facts


# ---------- Main (read JSON from file) ----------
def main():
    import os

    # Read from specific file (allow parameter override)
    json_file = sys.argv[1] if len(sys.argv) > 1 else "results/gemini_output.json"
    if not os.path.exists(json_file):
        sys.stderr.write(f"Errore: file {json_file} non trovato\n")
        sys.exit(1)

    try:
        with open(json_file, "r", encoding="utf-8") as f:
            payload = json.load(f)
        print(f"📖 Reading from: {json_file}")
    except Exception as e:
        sys.stderr.write(f"Errore lettura file {json_file}: {e}\n")
        sys.exit(1)

    # Extract conversation metadata
    lang = get(payload, "conversation_metadata", "language")
    channel = (
        get(payload, "interaction_context", "contact_preferences", "preferred_channel")
        or "phone"
    )

    conn = psycopg2.connect(
        host=DB_HOST, port=DB_PORT, dbname=DB_NAME, user=DB_USER, password=DB_PASS
    )
    inserted = 0
    skipped = 0
    user_id = None

    try:
        with conn:
            with conn.cursor(cursor_factory=extras.DictCursor) as cur:
                # Identify user through multiple authentication methods
                try:
                    user_id = identify_and_ensure_user(cur, payload)
                    print(f"✅ User identified: {user_id}")
                except ValueError as e:
                    sys.stderr.write(f"Errore: {e}\n")
                    sys.exit(2)

                call_id = create_call_if_possible(cur, user_id, lang, channel)
                if call_id:
                    print(f"✅ Call created: {call_id}")

                facts = extract_facts(payload)
                print(f"📊 Extracted {len(facts)} facts from payload")

                for fact_key, fact_value, source_path, observed_at in facts:
                    ok = insert_event(
                        cur,
                        user_id,
                        call_id,
                        observed_at,
                        fact_key,
                        fact_value,
                        source_path,
                    )
                    inserted += 1 if ok else 0
                    skipped += 0 if ok else 1

                # Refresh user profile with latest facts
                if user_id and inserted > 0:
                    refresh_user_profile(cur, user_id)
                    print(f"🔄 User profile refreshed")
                    
                    # Synchronize main user data in users table
                    sync_user_table_data(cur, user_id)

    except Exception as e:
        sys.stderr.write(f"Database error: {e}\n")
        sys.exit(3)
    finally:
        conn.close()

    print(f"✅ Done. Facts inserted: {inserted}, skipped (duplicates): {skipped}")
    if user_id:
        print(f"👤 User ID: {user_id}")


if __name__ == "__main__":
    main()
