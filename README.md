# Fullstack Connection Test

A simple fullstack application with React frontend and Node.js Express backend to test connectivity between frontend and backend services.

## Project Structure

```
├── frontend/          # React application (Vite)
├── backend/           # Node.js Express API
├── package.json       # Root package.json for scripts
└── README.md
```

## Quick Start

### Quick Start (Both servers)
```bash
npm run start:both
### Manual Setup
npm run install-all
1. **Install all dependencies:**
# Run both frontend and backend together
```

### Option 2: Run Servers Separately
2. **Start backend server:**
**Terminal 1 - Backend:**
```bash
   npm run dev
python run.py
```
3. **Start frontend server (in new terminal):**
**Terminal 2 - Frontend:**
   cd frontend
   npm run dev
npm run dev
```
## API Endpoints
- **Health Check**: http://localhost:5000/api/health
- `GET /api/health` - Health check endpoint
- `GET /api/test-connection` - Connection test endpoint

## Features

### Frontend (React)
- Connection status indicator
- Real-time connection testing
- Error handling and troubleshooting tips
- Responsive design
- Visual feedback for connection states

### Backend (Python Flask)
- RESTful API endpoints
- CORS enabled for cross-origin requests
- Health check endpoint
- Connection test endpoint
- Environment variable support

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Basic health check |
| GET | `/api/test-connection` | Connection test with detailed info |

## Testing the Connection

1. Start both servers
2. Open http://localhost:5173 in your browser
3. The page will automatically test the connection
4. Click "Test Connection" to manually test again
5. Check the connection status and backend response data

## Troubleshooting

### Backend Issues
- Ensure Python 3.7+ is installed
- Check if port 5000 is available
- Verify requirements.txt dependencies are installed

### Frontend Issues
- Ensure Node.js 16+ is installed
- Check if port 5173 is available
- Verify npm dependencies are installed

### CORS Issues
- Backend has CORS enabled by default
- If issues persist, check browser console for errors

## Development

### Adding New API Endpoints

1. Add new routes in `backend/app.py`
2. Update frontend to call new endpoints
3. Test the connection

### Environment Variables

Backend supports `.env` file in the `backend/` directory:
```
PORT=5000
FLASK_ENV=development
```

## Technologies Used

- **Frontend**: React, Vite, CSS3
- **Backend**: Python, Flask, Flask-CORS
- **Development**: Concurrently for running both servers