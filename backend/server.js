const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Backend is running!',
    data: {
      server: 'Node.js Express',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }
  });
});

// Test connection endpoint
app.get('/api/test-connection', (req, res) => {
  res.json({
    status: 'success',
    message: 'Connection successful!',
    timestamp: new Date().toISOString(),
    backend_info: {
      language: 'JavaScript',
      runtime: 'Node.js',
      framework: 'Express',
      cors_enabled: true,
      port: PORT
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints:`);
  console.log(`   - Health: http://localhost:${PORT}/api/health`);
  console.log(`   - Test: http://localhost:${PORT}/api/test-connection`);
});