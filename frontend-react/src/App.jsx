import { useState } from 'react'
import './App.css'

function App() {
  const [value, setValue] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function fetchRandom() {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('http://127.0.0.1:8000/api/random')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setValue(data.value)
    } catch (err) {
      setError(err.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Random Number</h1>
      <button onClick={fetchRandom} disabled={loading}>
        {loading ? 'Loading…' : 'Get Random Number'}
      </button>
      <div style={{ marginTop: 16, fontSize: 18 }}>
        {error && <span style={{ color: 'crimson' }}>Error: {error}</span>}
        {!error && value !== null && (
          <span>
            Value: <strong>{value}</strong>
          </span>
        )}
      </div>
    </div>
  )
}

export default App
