import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [connectionStatus, setConnectionStatus] = useState('testing...')
  const [backendData, setBackendData] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const testConnection = async () => {
    setIsLoading(true)
    setError(null)
    setConnectionStatus('testing...')
    
    try {
      const response = await fetch('http://localhost:5000/api/test-connection')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setBackendData(data)
      setConnectionStatus('connected')
    } catch (err) {
      setError(err.message)
      setConnectionStatus('failed')
      setBackendData(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <div className="app">
      <div className="container">
        <h1>Frontend ↔ Backend Connection Test</h1>
        
        <div className="connection-status">
          <h2>Connection Status</h2>
          <div className={`status-indicator ${connectionStatus}`}>
            <span className="status-dot"></span>
            <span className="status-text">
              {connectionStatus === 'testing...' && 'Testing connection...'}
              {connectionStatus === 'connected' && 'Connected successfully!'}
              {connectionStatus === 'failed' && 'Connection failed'}
            </span>
          </div>
        </div>

        <div className="test-section">
          <button 
            onClick={testConnection} 
            disabled={isLoading}
            className="test-button"
          >
            {isLoading ? 'Testing...' : 'Test Connection'}
          </button>
        </div>

        {error && (
          <div className="error-section">
            <h3>Error Details</h3>
            <p className="error-message">{error}</p>
            <div className="troubleshooting">
              <h4>Troubleshooting:</h4>
              <ul>
                <li>Make sure the Python backend is running on port 5000</li>
                <li>Check if CORS is properly configured</li>
                <li>Verify the backend URL is correct</li>
              </ul>
            </div>
          </div>
        )}

        {backendData && (
          <div className="success-section">
            <h3>Backend Response</h3>
            <div className="response-data">
              <div className="data-item">
                <strong>Message:</strong> {backendData.message}
              </div>
              <div className="data-item">
                <strong>Language:</strong> {backendData.backend_info?.language}
              </div>
              <div className="data-item">
                <strong>Framework:</strong> {backendData.backend_info?.framework}
              </div>
              <div className="data-item">
                <strong>CORS Enabled:</strong> {backendData.backend_info?.cors_enabled ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        )}

        <div className="info-section">
          <h3>Setup Information</h3>
          <div className="setup-info">
            <div className="info-card">
              <h4>Frontend</h4>
              <ul>
                <li>React with Vite</li>
                <li>Running on port 5173</li>
                <li>Using fetch API</li>
              </ul>
            </div>
            <div className="info-card">
              <h4>Backend</h4>
              <ul>
                <li>Python Flask</li>
                <li>Running on port 5000</li>
                <li>CORS enabled</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App