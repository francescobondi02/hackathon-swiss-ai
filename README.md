# Customer Intelligence System

A sophisticated event-sourcing system for building comprehensive customer profiles from conversation data.

## 🚀 Features

- **Event-sourcing Architecture**: Complete historical tracking of all customer interactions
- **Multi-method User Authentication**: Identifies users by email, phone, address, name, and date-of-birth with intelligent fuzzy matching
- **Automated Fact Extraction**: Extracts structured facts from conversation JSON data
- **Profile Evolution**: Tracks how customer profiles change over time
- **Table Synchronization**: Maintains consistency between operational tables and profile facts
- **Comprehensive Testing**: Integration and unit tests with realistic test fixtures

## 🏗️ Architecture

```
src/
├── ingestion/          # Core ingestion pipeline
│   ├── ingest_from_json.py    # Main ingestion script
│   └── ingest_payload.py      # Payload processing utilities
├── analysis/           # Data analysis modules
│   └── analyse_json.py        # JSON data analysis
└── utils/              # Utility functions

tests/
├── integration/        # End-to-end testing
│   ├── test_ingestion_system.py    # Full system tests
│   └── test_user_ingestion.py      # User creation tests
├── unit/              # Unit tests
├── fixtures/          # Test data
│   ├── test_auth_methods.json      # Authentication test data
│   ├── test_sync_conversation.json # Profile sync test data
│   └── test_update_conversation.json # Profile update test data
└── data/              # Test datasets
```

## 🗄️ Database Schema

### Core Tables

- **users**: Primary user information (email, phone, address)
- **calls**: Call metadata and transcripts
- **user_fact_events**: Event-sourced fact changes with full history
- **user_profile_current**: Optimized current state of user profiles

### Event Sourcing

All profile changes are tracked in `user_fact_events` with:

- Complete audit trail
- Temporal queries
- Profile reconstruction at any point in time

## 🚀 Quick Start

### 1. Prerequisites

```bash
# Install Python packages in TUM environment
conda activate TUM
pip install fastapi uvicorn psycopg2 python-dotenv google-generativeai requests
```

### 2. Start Database

```bash
# Start PostgreSQL + pgAdmin containers
docker-compose up -d

# Verify containers are running
docker ps
```

### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Add your Gemini API key to .env
echo "GEMINI_API_KEY=your_actual_api_key_here" >> .env
```

### 4. Start API Server

```bash
# Start the FastAPI backend
./start_api.sh

# Or manually:
python -m uvicorn backend_api:app --host 0.0.0.0 --port 8000 --reload
```

### 5. Test the System

```bash
# Run comprehensive API tests
python test_api.py
```

## 📚 API Endpoints

### Core Endpoints:

- `POST /analyze-transcript` - Process call transcript with AI analysis
- `GET /user/{user_ref}/profile` - Get current user knowledge profile
- `GET /user/{user_ref}/calls` - Get user's call history
- `GET /health` - System health check
- `GET /docs` - Interactive API documentation

### Example Request:

```json
{
  "transcript": "Customer call transcript...",
  "user_external_ref": "client_001",
  "language": "it-CH",
  "channel": "phone"
}
```

### Example Response:

```json
{
  "success": true,
  "message": "Transcript analyzed successfully. 12 facts extracted.",
  "call_id": "550e8400-e29b-41d4-a716-446655440000",
  "analysis": {...},
  "facts_extracted": 12,
  "user_profile_updated": true
}
```

## 🗄️ Database Schema

### Core Tables:

- `users` - Customer identities
- `calls` - Call metadata and timing
- `call_transcripts` - Raw transcript text
- `call_payloads` - AI analysis JSON results
- `user_fact_events` - Time-series fact observations
- `user_profile_current` - Current user knowledge state

### Event Sourcing Features:

- Historical fact tracking with timestamps
- Confidence scoring for AI-extracted information
- Source path attribution for data lineage
- Automatic profile updates from new call data

## 🧠 AI Analysis Capabilities

### Extracted Information:

- **Authentication**: Identity verification, addresses, contact info
- **Sentiment Analysis**: Emotions, confidence levels, trust indicators
- **Financial Insights**: Investment preferences, risk profiles, goals
- **Action Items**: Follow-up tasks, technical support needs
- **Compliance**: KYC updates, security concerns
- **Meetings**: Scheduled appointments, purposes
- **Feedback**: Customer satisfaction and suggestions

### Knowledge Categories (15+ fact types):

- Contact preferences and personal details
- Investment and financial goals
- Sentiment and trust levels
- Pending actions and support needs
- Compliance and security updates
- Meeting schedules and purposes
- Customer feedback and satisfaction

## 🔄 System Workflow

1. **Transcript Input**: Customer call transcript submitted via API
2. **AI Analysis**: Gemini processes transcript using structured template
3. **Data Storage**: Call data and analysis stored in PostgreSQL
4. **Fact Extraction**: 15+ types of customer facts identified and stored
5. **Profile Update**: User knowledge profile updated with new information
6. **Knowledge Evolution**: Historical tracking of changing customer information

## 🧪 Testing & Validation

### Database Reactivity Test:

```bash
# Demonstrates knowledge evolution from call data
./test_db_reactivity_clean.sh
```

### Comprehensive JSON Test:

```bash
# Shows full template processing (15 facts across 9 categories)
./test_comprehensive_json_insertion.sh
```

### API Integration Test:

```bash
# Complete transcript processing workflow
python test_api.py
```

## 🌐 Access Points

- **API Server**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Database Admin**: http://localhost:8080 (pgAdmin)
  - Email: `admin@hackathon.com`
  - Password: `admin123`

## 📊 Key Features

### ✅ Implemented:

- Complete FastAPI backend with transcript processing
- Google Gemini AI integration for intelligent analysis
- PostgreSQL database with event-sourcing architecture
- Docker containerization for easy deployment
- Comprehensive fact extraction (15+ categories)
- User profile evolution tracking
- Full API documentation with Swagger/OpenAPI
- Complete test suite with realistic scenarios

### 🎯 System Benefits:

- **Scalable**: Event-sourcing handles growing customer data
- **Intelligent**: AI extracts nuanced insights from conversations
- **Traceable**: Full audit trail of customer knowledge evolution
- **Flexible**: JSON-based analysis easily extended for new fact types
- **Production-Ready**: Containerized with proper error handling

## 🛠️ Development Files

### Core Application:

- `backend_api.py` - FastAPI application with all endpoints
- `gemini_example.py` - Gemini AI integration example
- `template.json` - Structured template for AI analysis

### Database & Infrastructure:

- `docker-compose.yml` - Multi-container database setup
- `create_db_schema.sql` - Complete database schema
- `insert_test_users.sql` - Test user data

### Testing & Scripts:

- `test_api.py` - Comprehensive API testing suite
- `start_api.sh` - Easy API server startup
- `test_db_reactivity_clean.sh` - Database reactivity demonstration
- `test_comprehensive_json_insertion.sh` - Full JSON processing test

## 🎉 Success Metrics

The system successfully demonstrates:

- ✅ **AI Integration**: Gemini correctly processes and structures transcript data
- ✅ **Database Reactivity**: Knowledge profiles evolve with new call information
- ✅ **Comprehensive Analysis**: 15+ fact categories extracted from transcripts
- ✅ **Production Architecture**: Scalable event-sourcing with proper API design
- ✅ **Full Testing**: Complete validation of all system components

## 📞 Example Use Cases

1. **Customer Service**: Automatically update customer profiles during support calls
2. **Compliance Tracking**: Monitor KYC updates and regulatory requirements
3. **Relationship Management**: Track customer sentiment and satisfaction over time
4. **Risk Assessment**: Analyze investment preferences and risk tolerance changes
5. **Operational Efficiency**: Automatic action item generation and follow-up tracking

---

**Built for Hackathon Swiss AI 2024** 🇨🇭