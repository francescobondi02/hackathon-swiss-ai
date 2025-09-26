# Random Number App

A minimal example: a Python FastAPI backend returns a random number, and a React frontend displays it when you click a button.

## Project Structure

```
/Users/franc/hackathon-swiss-ai/
├── backend/
│   ├── main.py                # FastAPI app with /api/random
│   └── requirements.txt       # Backend dependencies
└── frontend/
    └── index.html             # React CDN page with button
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

Open the URL shown (typically `http://127.0.0.1:5173/`). Click the button; it fetches from `http://127.0.0.1:8000/api/random` and displays the number.

## Notes

- CORS is enabled on the backend for development convenience.
- If your browser blocks direct `file://` fetches, serve the frontend with a simple server:

```bash
python -m http.server 5173 --directory frontend
```

If you prefer a static HTML demo, `frontend/index.html` is still available.
