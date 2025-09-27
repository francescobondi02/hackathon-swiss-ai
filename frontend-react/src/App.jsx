import { useState, useEffect, useRef } from 'react'
import Header from './components/Header'
import ClientInfoStrip from './components/ClientInfoStrip'
import ActionItemsColumn from './components/ActionItemsColumn'
import CustomerInsightsColumn from './components/CustomerInsightsColumn'
import CallReviewColumn from './components/CallReviewColumn'
import ConfirmDialog from './components/ConfirmDialog'
import SuccessScreen from './components/SuccessScreen'
import { systemGeneratedItems, transcriptSegments } from './data/mockData'

function App() {
  const [actionItems, setActionItems] = useState([])
  const [clientInsights, setClientInsights] = useState({
    totalAssets: '2,450,000 CHF',
    overdraftLimit: '50,000 CHF',
    creditCardLimit: '1,000 CHF/day',
    address: 'Bahnhofstrasse 45, 8001 Zürich',
    phoneNumber: '+41 44 123 45 67',
    preferredLanguage: 'German',
    email: 'm.rossi@email.com',
    preferredChannel: 'Phone',
    employmentStatus: 'Employed - Senior Manager',
    riskProfile: 'Moderate',
    recentTransactions: 'CHF 500 - Restaurant (Yesterday)',
    vacationPeriod: 'July (entire month)',
    preferredMeetingTime: 'Afternoon appointments',
    investmentInterest: 'Moderate risk, 100k CHF available'
  })
  
  const [liveTranscript, setLiveTranscript] = useState('')
  const [callDuration, setCallDuration] = useState(0)
  const [callStartTime] = useState(new Date())
  const [newInsightUpdates, setNewInsightUpdates] = useState({})
  const [newActionItems, setNewActionItems] = useState([])
  const [callEnded, setCallEnded] = useState(false)
  const [finalCallDuration, setFinalCallDuration] = useState('')
  const [pendingChanges, setPendingChanges] = useState({})
  const [completedItems, setCompletedItems] = useState(new Set())
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showHomeScreen, setShowHomeScreen] = useState(false)
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [transcriptCollapsed, setTranscriptCollapsed] = useState(true)

  useEffect(() => {
    let currentSegment = 0
    const timer = setInterval(() => {
      if (currentSegment < transcriptSegments.length) {
        setLiveTranscript(prev => {
          const newTranscript = prev + (prev ? '\n\n' : '') + transcriptSegments[currentSegment]
          return newTranscript
        })
        
        // Simulate real-time insight updates and action item generation
        if (currentSegment === 3) {
          setNewActionItems(prev => [...prev, systemGeneratedItems[0]])
        }
        if (currentSegment === 5) {
          setClientInsights(prev => ({ ...prev, email: 'm.rossi1980@email.it' }))
          setNewInsightUpdates(prev => ({ ...prev, email: true }))
          setPendingChanges(prev => ({ ...prev, email: 'm.rossi1980@email.it' }))
          setNewActionItems(prev => [...prev, systemGeneratedItems[3], systemGeneratedItems[4]])
        }
        if (currentSegment === 7) {
          setClientInsights(prev => ({ 
            ...prev, 
            preferredMeetingTime: 'August afternoons preferred'
          }))
          setNewInsightUpdates(prev => ({ 
            ...prev, 
            preferredMeetingTime: true
          }))
          setPendingChanges(prev => ({ 
            ...prev, 
            preferredMeetingTime: 'August afternoons preferred'
          }))
          setNewActionItems(prev => [...prev, systemGeneratedItems[1]])
        }
        if (currentSegment === 11) {
          setClientInsights(prev => ({ ...prev, creditCardLimit: 'Current + 5,000 EUR (August)' }))
          setNewInsightUpdates(prev => ({ ...prev, creditCardLimit: true }))
          setPendingChanges(prev => ({ ...prev, creditCardLimit: 'Current + 5,000 EUR (August)' }))
          setNewActionItems(prev => [...prev, systemGeneratedItems[2]])
        }
        if (currentSegment === 12) {
          setCompletedItems(prev => new Set([...prev, 'sys-1']))
        }
        
        currentSegment++
      } else {
        const formatTime = (seconds) => {
          const mins = Math.floor(seconds / 60)
          const secs = seconds % 60
          return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        }
        
        setFinalCallDuration(formatTime(Math.floor((Date.now() - callStartTime.getTime()) / 1000)))
        setTimeout(() => {
          setCallEnded(true)
        }, 2000)
        clearInterval(timer)
      }
    }, 3000)

    const durationTimer = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - callStartTime.getTime()) / 1000))
    }, 1000)

    return () => {
      clearInterval(timer)
      clearInterval(durationTimer)
    }
  }, [])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleApproveChange = (key) => {
    setPendingChanges(prev => {
      const newPending = { ...prev }
      delete newPending[key]
      return newPending
    })
    setNewInsightUpdates(prev => ({ ...prev, [key]: false }))
  }

  const handleRejectChange = (key) => {
    setPendingChanges(prev => {
      const newPending = { ...prev }
      delete newPending[key]
      return newPending
    })
    setNewInsightUpdates(prev => ({ ...prev, [key]: false }))
    
    const originalValues = {
      creditCardLimit: '1,000 CHF/day',
      email: 'marco.rossi@email.it',
      address: 'Bahnhofstrasse 45, 8001 Zürich',
      investmentInterest: 'Moderate risk portfolio review',
      preferredMeetingTime: 'Flexible scheduling'
    }
    
    if (originalValues[key]) {
      setClientInsights(prev => ({ ...prev, [key]: originalValues[key] }))
    }
  }

  const handleToggleComplete = (itemId) => {
    setCompletedItems(prev => {
      const newCompleted = new Set(prev)
      if (newCompleted.has(itemId)) {
        newCompleted.delete(itemId)
      } else {
        newCompleted.add(itemId)
      }
      return newCompleted
    })
  }

  const handleDeleteItem = (itemId) => {
    setNewActionItems(prev => prev.filter(item => item.id !== itemId))
    setActionItems(prev => prev.filter(item => item.id !== itemId))
    setCompletedItems(prev => {
      const newCompleted = new Set(prev)
      newCompleted.delete(itemId)
      return newCompleted
    })
  }

  const allActionItems = [...actionItems, ...newActionItems]
  const completedCount = allActionItems.filter(item => completedItems.has(item.id)).length
  const pendingCount = allActionItems.length - completedCount

  if (showHomeScreen) {
    return (
      <SuccessScreen 
        completedCount={completedCount}
        pendingCount={pendingCount}
        onReturn={() => setShowHomeScreen(false)}
      />
    )
  }

  return (
    <div style={{
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      backgroundColor: '#f0f2f5',
      minHeight: '100vh',
      color: '#212529'
    }}>
      <Header 
        callEnded={callEnded}
        callDuration={callDuration}
        finalCallDuration={finalCallDuration}
        formatTime={formatTime}
      />

      <ClientInfoStrip 
        callEnded={callEnded}
        finalCallDuration={finalCallDuration}
        completedCount={completedCount}
        pendingCount={pendingCount}
        onFinalizeSubmit={() => setShowConfirmDialog(true)}
      />

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr 1fr', 
        gap: '16px', 
        padding: '16px 24px',
        height: 'calc(100vh - 160px)'
      }}>
        <ActionItemsColumn 
          actionItems={allActionItems}
          newActionItems={newActionItems}
          completedItems={completedItems}
          pendingCount={pendingCount}
          onToggleComplete={handleToggleComplete}
          onDeleteItem={handleDeleteItem}
        />

        <CustomerInsightsColumn 
          clientInsights={clientInsights}
          newInsightUpdates={newInsightUpdates}
          pendingChanges={pendingChanges}
          callEnded={callEnded}
          onApproveChange={handleApproveChange}
          onRejectChange={handleRejectChange}
        />

        <CallReviewColumn 
          callEnded={callEnded}
          liveTranscript={liveTranscript}
          additionalNotes={additionalNotes}
          transcriptCollapsed={transcriptCollapsed}
          onNotesChange={setAdditionalNotes}
          onToggleTranscript={() => setTranscriptCollapsed(!transcriptCollapsed)}
        />
      </div>
      
      {showConfirmDialog && (
        <ConfirmDialog 
          completedCount={completedCount}
          pendingCount={pendingCount}
          pendingChanges={pendingChanges}
          onConfirm={() => {
            setShowConfirmDialog(false)
            setShowHomeScreen(true)
          }}
          onCancel={() => setShowConfirmDialog(false)}
        />
      )}
      
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.3; }
          100% { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { 
            transform: translateX(100%);
            opacity: 0;
          }
          to { 
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes highlight {
          0% { background-color: #ffffff; }
          50% { background-color: #d4edda; }
          100% { background-color: #d4edda; }
        }
      `}</style>
    </div>
  )
}

export default App