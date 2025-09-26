# Client Dashboard App

A comprehensive client management dashboard with draggable action items, client insights with approval workflow, and conversation transcripts with AI summary generation.

## Project Structure

```
/Users/franc/hackathon-swiss-ai/
├── backend/
│   ├── main.py                # FastAPI app with /api/random and /api/generate-summary
│   └── requirements.txt       # Backend dependencies
├── frontend/
│   └── index.html             # Static demo (optional)
└── frontend-react/            # React (Vite) dashboard app
    ├── public/
    │   └── action-items.json  # Sample action items data
    └── src/
        ├── App.jsx            # Main dashboard component
        └── App.css            # Dashboard styles
```

## Prerequisites

- Python 3.11+
- macOS Terminal (zsh) or similar

## Backend: FastAPI

Create and activate a virtual environment, then run the API server.

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r backend/requirements.txt
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

- Test in a browser: `http://127.0.0.1:8000/api/random` should return `{ "value": <number> }`.

## Frontend: React (Vite)

Start the React dev server in the `frontend-react/` app:

```bash
cd frontend-react
npm install
npm run dev
```

Open the URL shown (typically `http://127.0.0.1:5173/`). You'll see a comprehensive client dashboard with:

## Features

### Action Items (Left Column)
- **Draggable items** loaded from `action-items.json`
- **Priority-based color coding** (High=Red, Medium=Orange, Low=Green)
- **Drag & drop deletion** with confirmation modal
- **Real-time count** of remaining items

### Client Insights (Middle Column)
- **Editable fields** for client information
- **Approval/rejection buttons** for new values
- **Pre-filled sample data** (e.g., Credit Card Limit: 1000 CHF/day)

### Conversation Transcripts (Right Column)
- **Expandable transcripts** with German conversation sample
- **Generate Summary button** that calls `/api/generate-summary`
- **Previous conversation history** with existing summaries

## Notes

- CORS is enabled on the backend for development convenience.
- If your browser blocks direct `file://` fetches, serve the frontend with a simple server:

```bash
python -m http.server 5173 --directory frontend
```

If you prefer a static HTML demo, `frontend/index.html` is still available.
