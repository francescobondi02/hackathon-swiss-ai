# Project Structure

This document explains the organization of the Customer Intelligence System.

## 🏗️ Directory Structure

```
hackathon-swiss-ai/
├── .env.example              # Environment variables template
├── .gitignore               # Git ignore rules
├── README.md                # Main documentation
├── config.env               # System configuration
├── manage.py                # CLI management interface
├── demo.py                  # System demonstration script
├── deploy.py                # Deployment script
├──
├── src/                     # Source code (organized modules)
│   ├── ingestion/          # Data ingestion pipeline
│   │   ├── __init__.py
│   │   ├── ingest_from_json.py    # Main ingestion script
│   │   └── ingest_payload.py      # Payload processing
│   ├── analysis/           # Data analysis modules
│   │   ├── __init__.py
│   │   ├── analyse_json.py        # JSON data analysis
│   │   └── analyse_transcription.py
│   └── utils/              # Utility functions
│       └── __init__.py
│
├── tests/                   # Test suite
│   ├── __init__.py
│   ├── integration/        # End-to-end tests
│   │   ├── __init__.py
│   │   ├── test_ingestion_system.py
│   │   └── test_user_ingestion.py
│   ├── unit/              # Unit tests
│   │   ├── apertus_example.py
│   │   └── gemini_example.py
│   ├── fixtures/          # Test data files
│   │   ├── test_auth_methods.json
│   │   ├── test_sync_conversation.json
│   │   └── test_update_conversation.json
│   └── data/              # Test datasets
│
├── scripts/               # Legacy/utility scripts
│   ├── test_ingest.py     # Original ingestion script
│   ├── analyse_json.py    # JSON analysis utility
│   ├── analyse_transcription.py
│   └── ingest_payload.py  # Payload processing utility
│
├── prompts/               # AI prompt templates
│   ├── template.json      # Conversation processing template
│   └── summary.json       # Summary generation template
│
├── db/                    # Database setup
│   └── init/
│       └── 01-schema.sql  # Database schema
│
├── data/                  # Data files (gitignored)
│   ├── test/             # Test conversations
│   ├── train/            # Training data
│   └── validation/       # Validation data
│
└── fact_keys_catalog.md   # Documentation of fact keys
```

## 📁 Module Organization

### Source Code (`src/`)

- **ingestion/**: Core pipeline for processing conversation JSON files
- **analysis/**: Data analysis and reporting modules
- **utils/**: Shared utility functions and helpers

### Tests (`tests/`)

- **integration/**: End-to-end system tests with real database
- **unit/**: Isolated component tests
- **fixtures/**: Realistic test data for consistent testing
- **data/**: Additional test datasets

### Scripts (`scripts/`)

- Legacy scripts maintained for backward compatibility
- Utility scripts for one-off operations

## 🚀 Entry Points

- `manage.py`: Main CLI interface for all operations
- `demo.py`: Complete system demonstration
- `deploy.py`: Automated deployment and setup
- `src/ingestion/ingest_from_json.py`: Direct ingestion script

## 🔧 Configuration

- `.env`: Environment variables (not in git)
- `.env.example`: Environment template (in git)
- `config.env`: System configuration (in git)
- `prompts/`: AI processing templates

## 📊 Data Flow

1. **Input**: Conversation JSON files in `data/` directories
2. **Processing**: Ingestion pipeline extracts facts and identifies users
3. **Storage**: PostgreSQL database with event-sourcing architecture
4. **Output**: User profiles and analytics through CLI/API

## 🧪 Testing Strategy

- Integration tests validate complete workflows
- Unit tests cover individual components
- Fixtures provide consistent test data
- Test database separate from production
