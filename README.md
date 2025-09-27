# Customer Intelligence System

AI-powered customer profile management system that processes call transcripts and builds comprehensive customer insights with approval workflows.

## 🚀 Features

- **AI Transcript Analysis**: Gemini AI extracts structured data from call transcripts
- **Approval Workflow**: Manual review process for sensitive data changes
- **Event Sourcing**: Complete audit trail of all customer profile changes
- **Real-time Frontend**: React interface for managing customer profiles and approvals
- **User Identification**: Smart user matching across multiple data points

## 🏗️ Quick Start

### 1. Start the System

```bash
# Start database
docker-compose up -d

# Start backend API (Terminal 1)
python api.py

# Start frontend (Terminal 2)
cd frontend-react && npm run dev
```

### 2. Access the Application

- **Frontend**: http://localhost:5173 (React app)
- **Backend API**: http://localhost:8000 (FastAPI)
- **API Docs**: http://localhost:8000/docs
- **Database**: http://localhost:8080 (pgAdmin)

## � How It Works

1. **Transcript Processing**: Call transcripts are sent to `/process-transcript` endpoint
2. **AI Analysis**: Gemini AI extracts structured customer facts from conversations
3. **Change Detection**: System compares new facts with existing customer profile
4. **Approval Queue**: Detected changes are queued for manual review in `pending_user_upgrades`
5. **Manual Review**: Staff approve/reject changes through frontend interface
6. **Profile Update**: Approved changes are applied to customer profiles

## � Key API Endpoints

```bash
# Process a call transcript
curl -X POST http://localhost:8000/process-transcript \
  -H "Content-Type: application/json" \
  -d '{"transcript": "Customer call text...", "caller_info": {...}}'

# Get user profile by name
curl http://localhost:8000/users/John%20Doe

# Get pending approvals (coming soon)
curl http://localhost:8000/pending-upgrades

# Review pending changes (coming soon)
curl -X POST http://localhost:8000/review-upgrade \
  -d '{"upgrade_id": "uuid", "status": "approved", "reviewer": "admin"}'
```

## �️ Database Schema

### Core Tables

- `users` - Customer identities and contact info
- `calls` - Call metadata and transcripts
- `user_fact_events` - Historical fact changes (event sourcing)
- `user_profile_current` - Current customer profile state
- `pending_user_upgrades` - Changes awaiting approval
- `user_upgrade_history` - Complete audit trail

### Approval Workflow

- Changes detected from transcripts create pending upgrades
- Manual review process ensures data quality
- Complete audit trail of all decisions
- Automatic application of approved changes

## 💻 Tech Stack

**Backend**: FastAPI + PostgreSQL + Google Gemini AI  
**Frontend**: React + Vite  
**Infrastructure**: Docker + Docker Compose  
**Database**: PostgreSQL with event sourcing patterns

## 📁 Project Structure

```
hackathon-swiss-ai/
├── api.py                    # Main FastAPI application
├── db/init/01-schema.sql     # Database schema with approval workflow
├── frontend-react/           # React frontend application
│   ├── src/components/       # UI components
│   └── src/services/         # API integration
├── docker-compose.yml        # Database infrastructure
└── prompts/template.json     # AI analysis template
```

---

**Built for Hackathon Swiss AI 2025** 🇨🇭
