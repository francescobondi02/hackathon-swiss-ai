import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [actionItems, setActionItems] = useState([])
  const [selectedItems, setSelectedItems] = useState(new Set())
  const [clientInsights, setClientInsights] = useState({
    totalAssets: '',
    overdraftLimit: '',
    creditCardLimit: '1000 CHF/day',
    address: '',
    phoneNumber: '',
    preferredLanguage: '',
    email: '',
    preferredChannel: '',
    employmentStatus: '',
    riskProfile: '',
    recentTransactions: ''
  })
  const [conversations, setConversations] = useState([
    {
      id: 1,
      date: '28.09.2025',
      time: '18:06',
      title: 'Conversation about Financial Investments',
      transcript: `Speaker 1: Guten Morgen.

Speaker 2: Guten Morgen, Herr Rossi. Wie geht es Ihnen heute?

Speaker 1: Gut, danke. Ich rufe an, weil ich Fragen zu meiner Kreditkarte habe.

Speaker 2: Gerne helfe ich Ihnen. Können Sie mir bitte Ihr Geburtsdatum und Ihre Adresse bestätigen?

Speaker 1: Ja, ich bin am 15. März 1985 geboren und wohne in der Bahnhofstrasse 45 in Zürich.

Speaker 2: Vielen Dank. Ich sehe, dass Sie kürzlich eine Transaktion in Höhe von 500 CHF in einem Restaurant gemacht haben. Ist das korrekt?

Speaker 1: Ja, das war gestern Abend. Ich wollte fragen, ob ich mein Tageslimit erhöhen kann.

Speaker 2: Natürlich. Ihr aktuelles Limit liegt bei 1000 CHF pro Tag. Möchten Sie es auf 2000 CHF erhöhen?

Speaker 1: Das wäre perfekt.`,
      summary: null
    },
    {
      id: 2,
      date: '21.05.2025',
      time: '16:43',
      title: 'Conversation #1',
      transcript: 'Previous conversation transcript...',
      summary: 'Previous conversation summary...'
    }
  ])
  const [selectedConversation, setSelectedConversation] = useState(1)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Load action items from JSON
  useEffect(() => {
    const loadActionItems = async () => {
      try {
        const response = await fetch('/action-items.json')
        const data = await response.json()
        setActionItems(data)
      } catch (error) {
        console.error('Failed to load action items:', error)
        // Fallback to sample data
        const sampleActionItems = [
          { id: 1, priority: 'High', text: 'Schedule Follow-up Call', completed: false },
          { id: 2, priority: 'High', text: 'Verify Card Activation', completed: false },
          { id: 3, priority: 'Medium', text: 'Verify Employment Status', completed: false },
          { id: 4, priority: 'Low', text: 'Verify Correct Phone Number', completed: false },
          { id: 5, priority: 'Medium', text: 'Update Credit Card Limit', completed: false },
          { id: 6, priority: 'Low', text: 'Send Confirmation Email', completed: false }
        ]
        setActionItems(sampleActionItems)
      }
    }
    loadActionItems()
  }, [])

  const handleItemSelect = (itemId) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    setSelectedItems(newSelected)
  }

  const handleDeleteSelected = () => {
    if (selectedItems.size > 0) {
      setShowDeleteConfirm(true)
    }
  }

  const confirmDelete = () => {
    setActionItems(items => items.filter(item => !selectedItems.has(item.id)))
    setSelectedItems(new Set())
    setShowDeleteConfirm(false)
  }

  const selectAllItems = () => {
    if (selectedItems.size === actionItems.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(actionItems.map(item => item.id)))
    }
  }

  const generateSummary = async (conversationId) => {
    setLoading(true)
    try {
      const res = await fetch('http://127.0.0.1:8000/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, summary: data.summary }
          : conv
      ))
    } catch (err) {
      console.error('Failed to generate summary:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateInsight = (field, value) => {
    setClientInsights(prev => ({ ...prev, [field]: value }))
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#ff4444'
      case 'Medium': return '#ffaa00'
      case 'Low': return '#44aa44'
      default: return '#666'
    }
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <div className="logo">UBS</div>
        </div>
        <div className="header-center">
          <input 
            type="text" 
            placeholder="Search for customers..." 
            className="search-bar"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="header-right">
          <div className="user-info">Anima Agrawal, U.P, India</div>
        </div>
      </header>

      {/* Client Info Card */}
      <div className="client-card">
        <h2>Mario Rossi</h2>
        <div className="client-details">
          <div>Client ID: 123456789</div>
          <div>Birth place: Zürich</div>
          <div>Birth date: 15.03.1985</div>
          <div>VAT Number: CHE-123.456.789</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Left Column - Action Items */}
        <div className="column action-items">
          <div className="action-items-header">
            <h3>Open Action Items about Mario Rossi /{actionItems.length}</h3>
            <div className="action-items-controls">
              <button 
                className="select-all-btn"
                onClick={selectAllItems}
              >
                {selectedItems.size === actionItems.length ? 'Deselect All' : 'Select All'}
              </button>
              {selectedItems.size > 0 && (
                <button 
                  className="delete-selected-btn"
                  onClick={handleDeleteSelected}
                >
                  Delete Selected ({selectedItems.size})
                </button>
              )}
            </div>
          </div>
          <div className="action-items-list">
            {actionItems.map(item => (
              <div
                key={item.id}
                className={`action-item ${selectedItems.has(item.id) ? 'selected' : ''}`}
                style={{ borderLeft: `4px solid ${getPriorityColor(item.priority)}` }}
              >
                <div className="action-item-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => handleItemSelect(item.id)}
                  />
                </div>
                <div className="action-item-content">
                  <span className="priority">{item.priority}</span>
                  <span className="text">{item.text}</span>
                </div>
                <span className="more-options">⋯</span>
              </div>
            ))}
          </div>
        </div>

        {/* Middle Column - Client Insights */}
        <div className="column client-insights">
          <h3>Customer Insights about Mario Rossi</h3>
          <div className="insights-list">
            {Object.entries(clientInsights).map(([key, value]) => (
              <div key={key} className="insight-item">
                <label>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</label>
                <div className="insight-value">
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateInsight(key, e.target.value)}
                    placeholder="Not specified"
                  />
                  {value && value !== clientInsights[key] && (
                    <div className="approval-buttons">
                      <button className="approve">✓</button>
                      <button className="reject">✗</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Conversations */}
        <div className="column conversations">
          <h3>Conversation Transcripts with Mario Rossi</h3>
          <div className="conversations-list">
            {conversations.map(conv => (
              <div key={conv.id} className="conversation-item">
                <div className="conversation-header">
                  <span className="date">{conv.date} - {conv.time}</span>
                  <span className="title">{conv.title}</span>
                </div>
                <div className="conversation-content">
                  <div className="transcript-section">
                    <button 
                      className="expand-btn"
                      onClick={() => setSelectedConversation(conv.id)}
                    >
                      {selectedConversation === conv.id ? '▼' : '▶'} Transcript
                    </button>
                    {selectedConversation === conv.id && (
                      <div className="transcript-content">
                        {conv.transcript}
                      </div>
                    )}
                  </div>
                  {conv.summary ? (
                    <div className="summary-section">
                      <h4>Summary</h4>
                      <p>{conv.summary}</p>
                    </div>
                  ) : (
                    <button 
                      className="generate-summary-btn"
                      onClick={() => generateSummary(conv.id)}
                      disabled={loading}
                    >
                      {loading ? 'Generating...' : 'Generate Summary'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete {selectedItems.size} selected action item{selectedItems.size > 1 ? 's' : ''}?</p>
            <div className="modal-buttons">
              <button 
                className="cancel-btn"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="delete-btn"
                onClick={confirmDelete}
              >
                Delete {selectedItems.size} Item{selectedItems.size > 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
