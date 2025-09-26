import { useState, useEffect, useRef } from 'react'

function LiveCallDashboard() {
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
  const transcriptRef = useRef(null)

  // Simulated live transcript streaming
  const transcriptSegments = [
    "[14:30] Agent (Anna Bianchi): Good morning, Mr. Rossi, this is Anna Bianchi from UBS. How are you today?",
    "[14:30] Client (Marco Rossi): Good morning, Anna. All is well, thank you. A bit busy, but I'm glad you called.",
    "[14:31] Agent (Anna Bianchi): I'm happy to hear that. I'm calling to check in, as discussed, and to see if there is anything I can help you with. I remember you mentioned wanting to review your portfolio.",
    "[14:31] Client (Marco Rossi): Yes, exactly. I've been thinking about our last discussion on financial investments, and I'd like to proceed. Could you send me the necessary paperwork to sign? A PDF via email would be perfect.",
    "[14:32] Agent (Anna Bianchi): Of course, Mr. Rossi. I will prepare the mandate for financial investments and send it to you by the end of the day. Is your email address still marco.rossi@email.it?",
    "[14:32] Client (Marco Rossi): Actually, I have a new address. It's m.rossi1980@email.it. Please update your records. My home address has also changed, I'll send you the details via email so you have it in writing.",
    "[14:33] Agent (Anna Bianchi): Thank you for the update, I've noted the new email address and will wait for your communication regarding the new home address. Regarding our meeting to discuss the investment decision in more detail, when would be a good time for you?",
    "[14:33] Client (Marco Rossi): August is looking to be a calmer month for me. A meeting in the afternoon would be ideal, if possible.",
    "[14:34] Agent (Anna Bianchi): Excellent, I will check my calendar for August and send you a few options for an afternoon meeting. Was there anything else I could assist you with today?",
    "[14:34] Client (Marco Rossi): Yes, one more thing. I'm planning a trip abroad and I was hoping to increase the limit on my credit card for the duration of the trip. Is that something you can help me with?",
    "[14:35] Agent (Anna Bianchi): I can certainly initiate that request for you. I will have the relevant department get in touch with you to finalize the details. Is there a specific amount you had in mind?",
    "[14:35] Client (Marco Rossi): I think an additional 5,000 euros for the month of August should be sufficient.",
    "[14:36] Agent (Anna Bianchi): Understood. I will add this to my follow-up tasks. So, to summarize: I will email you the PDF mandate for the financial investments, we will schedule a meeting in August to discuss the investment decision, and I will start the process for the temporary increase of your credit card limit.",
    "[14:36] Client (Marco Rossi): That's perfect, Anna. Thank you for your efficiency.",
    "[14:37] Agent (Anna Bianchi): It's my pleasure, Mr. Rossi. Have a great day."
  ]

  // System generated action items based on client history
  const systemGeneratedItems = [
    {
      id: 'sys-1',
      priority: 'High',
      text: 'Send PDF mandate for financial investments via email',
      suggestion: 'Prepare and send to new email: m.rossi1980@email.it',
      source: 'Live Call',
      timestamp: '14:32'
    },
    {
      id: 'sys-2', 
      priority: 'High',
      text: 'Schedule investment consultation meeting for August',
      suggestion: 'Check calendar for afternoon slots in August.',
      source: 'Live Call',
      timestamp: '14:34'
    },
    {
      id: 'sys-3',
      priority: 'High', 
      text: 'Process temporary credit card limit increase',
      suggestion: 'Additional 5,000 EUR for August travel period.',
      source: 'Live Call',
      timestamp: '14:35'
    },
    {
      id: 'sys-4',
      priority: 'Medium',
      text: 'Update email address in system',
      suggestion: 'Change from marco.rossi@email.it to m.rossi1980@email.it',
      source: 'Live Call',
      timestamp: '14:32'
    },
    {
      id: 'sys-5',
      priority: 'Low',
      text: 'Wait for new home address details via email',
      suggestion: 'Client will send updated address information in writing.',
      source: 'Live Call',
      timestamp: '14:33'
    }
  ]

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
          // Investment mandate requested
          setNewActionItems(prev => [...prev, systemGeneratedItems[0]])
        }
        if (currentSegment === 5) {
          // Email and address update mentioned
          setClientInsights(prev => ({ ...prev, email: 'm.rossi1980@email.it' }))
          setNewInsightUpdates(prev => ({ ...prev, email: true }))
          setPendingChanges(prev => ({ ...prev, email: 'm.rossi1980@email.it' }))
          setNewActionItems(prev => [...prev, systemGeneratedItems[3], systemGeneratedItems[4]])
        }
        if (currentSegment === 7) {
          // Meeting preferences mentioned
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
          // Credit card increase mentioned
          setClientInsights(prev => ({ ...prev, creditCardLimit: 'Current + 5,000 EUR (August)' }))
          setNewInsightUpdates(prev => ({ ...prev, creditCardLimit: true }))
          setPendingChanges(prev => ({ ...prev, creditCardLimit: 'Current + 5,000 EUR (August)' }))
          setNewActionItems(prev => [...prev, systemGeneratedItems[2]])
        }
        if (currentSegment === 12) {
          // Agent confirms actions - auto-complete PDF mandate
          setCompletedItems(prev => new Set([...prev, 'sys-1']))
        }
        
        currentSegment++
      } else {
        // Call ended - set final duration and status
        setFinalCallDuration(formatTime(Math.floor((Date.now() - callStartTime.getTime()) / 1000)))
        setTimeout(() => {
          setCallEnded(true)
        }, 2000) // 2 second delay before showing post-call review
        clearInterval(timer)
      }
    }, 3000)

    // Call duration timer
    const durationTimer = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - callStartTime.getTime()) / 1000))
    }, 1000)

    // Load initial action item
    setTimeout(() => {
      // No pre-call items for this scenario
    }, 1000)

    return () => {
      clearInterval(timer)
      clearInterval(durationTimer)
    }
  }, [])

  useEffect(() => {
    // Auto-scroll transcript to bottom
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [liveTranscript])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'High': 
        return { color: '#721c24', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb' }
      case 'Medium': 
        return { color: '#856404', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7' }
      case 'Low': 
        return { color: '#155724', backgroundColor: '#d4edda', border: '1px solid #c3e6cb' }
      default: 
        return { color: '#495057', backgroundColor: '#e9ecef', border: '1px solid #ced4da' }
    }
  }

  const formatFieldName = (key) => {
    const fieldNames = {
      totalAssets: 'Total Assets',
      overdraftLimit: 'Overdraft Limit', 
      creditCardLimit: 'Credit Card Limit',
      address: 'Address',
      phoneNumber: 'Phone Number',
      preferredLanguage: 'Preferred Language',
      email: 'Email Address',
      preferredChannel: 'Preferred Contact',
      employmentStatus: 'Employment Status',
      riskProfile: 'Risk Profile',
      recentTransactions: 'Recent Transactions',
      vacationPeriod: 'Vacation Period',
      preferredMeetingTime: 'Meeting Preferences',
      investmentInterest: 'Investment Interest'
    }
    return fieldNames[key] || key
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
    
    // Revert to original value
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

  const handleFinalizeSubmit = () => {
    setShowConfirmDialog(true)
  }

  const handleConfirmSubmit = () => {
    setShowConfirmDialog(false)
    setShowHomeScreen(true)
  }

  const handleCancelSubmit = () => {
    setShowConfirmDialog(false)
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
  
  // Sort action items: incomplete first, completed last
  const sortedActionItems = allActionItems.sort((a, b) => {
    const aCompleted = completedItems.has(a.id)
    const bCompleted = completedItems.has(b.id)
    // Completed items go to bottom
    if (aCompleted && !bCompleted) return 1
    if (!aCompleted && bCompleted) return -1
    // Within same completion status, maintain original order
    return 0
  })

  // Show home screen if finalized
  if (showHomeScreen) {
    return (
      <div style={{
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        backgroundColor: '#f0f2f5',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#212529'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '48px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '24px'
          }}>
            ✅
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#e60028',
            marginBottom: '16px'
          }}>
            Call Successfully Finalized
          </div>
          <div style={{
            fontSize: '16px',
            color: '#6c757d',
            marginBottom: '32px',
            lineHeight: '1.5'
          }}>
            Call with Marco Rossi has been completed and all data has been saved to the system.
          </div>
          <div style={{
            padding: '16px',
            backgroundColor: '#d4edda',
            borderRadius: '8px',
            marginBottom: '32px'
          }}>
            <div style={{ fontSize: '14px', color: '#155724', fontWeight: '600' }}>
              Summary: {completedCount} tasks completed, {pendingCount} pending items saved for follow-up
            </div>
          </div>
          <button style={{
            padding: '12px 32px',
            backgroundColor: '#e60028',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
          onClick={() => setShowHomeScreen(false)}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      backgroundColor: '#f0f2f5',
      minHeight: '100vh',
      color: '#212529'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#ffffff',
        borderBottom: '2px solid #e60028',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{
            fontSize: '24px',
            fontWeight: '300',
            color: '#e60028',
            letterSpacing: '1px'
          }}>
            UBS
          </div>
          <div style={{ height: '24px', width: '1px', backgroundColor: '#dee2e6' }}></div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#e60028' }}>
              {callEnded ? 'POST-CALL REVIEW' : 'LIVE CALL'}
            </div>
            <div style={{ fontSize: '12px', color: '#6c757d' }}>Client: Marco Rossi • Agent: Anna Bianchi</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {!callEnded ? (
            <>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: 'white',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  animation: 'pulse 1.5s infinite'
                }}></div>
                LIVE • {formatTime(callDuration)}
              </div>
              <div style={{
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                Recording Active
              </div>
            </>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              ✅ Call Completed • Duration: {finalCallDuration}
            </div>
          )}
        </div>
      </header>

      {/* Client Info Strip - Changes to green when call ends */}
      <div style={{
        backgroundColor: callEnded ? '#d4edda' : '#fff3cd',
        borderBottom: callEnded ? '1px solid #c3e6cb' : '1px solid #ffeaa7',
        padding: '12px 24px',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'all 0.5s ease'
      }}>
        {callEnded ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#155724',
                fontWeight: '600'
              }}>
                <span style={{ fontSize: '18px' }}>✅</span>
                <div>
                  <div style={{ fontSize: '16px' }}>Post-Call Review</div>
                  <div style={{ fontSize: '12px', fontWeight: '400' }}>
                    Client: Marco Rossi • Call completed: 14:37 • Duration: {finalCallDuration}
                  </div>
                </div>
              </div>
              <div style={{ height: '32px', width: '1px', backgroundColor: '#c3e6cb' }}></div>
              <div style={{ color: '#155724' }}>
                <strong>Call Outcome:</strong> Successful • <strong>Key Actions:</strong> Investment mandate, Credit card increase, Meeting scheduled
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                Call Completed Successfully
              </div>
              <div style={{
                padding: '8px 16px',
                backgroundColor: '#155724',
                color: 'white',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {completedCount} completed • {pendingCount} pending items
              </div>
              <button 
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
                onClick={handleFinalizeSubmit}
              >
                Finalize & Submit
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', width: '100%' }}>
            <strong>Quick Info:</strong>
            <span>Assets: CHF 2.45M</span>
            <span>Risk: Moderate</span>
            <span>Language: German</span>
            <span>Relationship: 8 years</span>
            <span style={{ color: '#856404', fontWeight: '500' }}>⚠ July: On vacation (entire month)</span>
          </div>
        )}
      </div>

      {/* Three Column Layout */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr 1fr', 
        gap: '16px', 
        padding: '16px 24px',
        height: 'calc(100vh - 160px)'
      }}>
        
        {/* Action Items Column */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '2px solid #28a745',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          position: 'relative'
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #dee2e6',
            backgroundColor: '#d4edda',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: '16px', 
              fontWeight: '600',
              color: '#155724',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🎯 Action Items
              <span style={{ 
                fontSize: '12px', 
                color: '#155724', 
                fontWeight: '400',
                backgroundColor: '#c3e6cb',
                padding: '2px 6px',
                borderRadius: '10px'
              }}>
                {allActionItems.length} items ({pendingCount} pending)
              </span>
            </h3>
          </div>
          
          <div style={{ 
            flex: 1, 
            overflowY: 'auto',
            padding: '12px'
          }}>
            {sortedActionItems.map((item, idx) => {
              const isCompleted = completedItems.has(item.id)
              return (
              <div 
                key={item.id} 
                style={{
                  padding: '14px',
                  marginBottom: '10px',
                  border: '1px solid #e9ecef',
                  borderRadius: '6px',
                  backgroundColor: isCompleted ? '#f8f9fa' : '#ffffff',
                  borderLeft: `4px solid ${getPriorityStyle(item.priority).color}`,
                  boxShadow: newActionItems.includes(item) ? '0 0 10px rgba(40, 167, 69, 0.3)' : 'none',
                  animation: newActionItems.includes(item) ? 'slideIn 0.5s ease-out' : 'none',
                  opacity: isCompleted ? 0.7 : 1,
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '600',
                    marginBottom: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                      <button
                        onClick={() => handleToggleComplete(item.id)}
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '3px',
                          border: '2px solid ' + (isCompleted ? '#28a745' : '#dee2e6'),
                          backgroundColor: isCompleted ? '#28a745' : 'white',
                          color: 'white',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {isCompleted ? '✓' : ''}
                      </button>
                      <span style={{ 
                        textDecoration: isCompleted ? 'line-through' : 'none',
                        color: isCompleted ? '#6c757d' : 'inherit'
                      }}>
                        {item.text}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        ...getPriorityStyle(item.priority),
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: '600'
                      }}>
                        {item.priority}
                      </div>
                      {isCompleted && (
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '3px',
                            border: 'none',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Delete item"
                        >
                          🗑
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div style={{
                    fontSize: '12px',
                    color: '#6c757d',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginLeft: '28px'
                  }}>
                    <span>{item.source}</span>
                    {item.timestamp && (
                      <>
                        <span>•</span>
                        <span>{item.timestamp}</span>
                      </>
                    )}
                    {isCompleted && (
                      <>
                        <span>•</span>
                        <span style={{ color: '#28a745', fontWeight: '600' }}>✓ Completed</span>
                      </>
                    )}
                  </div>

                  {item.suggestion && (
                    <div style={{
                      backgroundColor: isCompleted ? '#e9ecef' : '#f8f9fa',
                      border: '1px solid #e9ecef',
                      borderRadius: '4px',
                      padding: '8px',
                      fontSize: '12px',
                      lineHeight: '1.4',
                      marginLeft: '28px'
                    }}>
                      <span style={{ fontWeight: '600', color: '#495057' }}>💡 Suggestion: </span>
                      <span style={{ 
                        color: isCompleted ? '#6c757d' : '#6c757d',
                        textDecoration: isCompleted ? 'line-through' : 'none'
                      }}>
                        {item.suggestion}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )})}
          </div>
        </div>

        {/* Customer Insights Column */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '2px solid #ffc107',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #dee2e6',
            backgroundColor: '#fff3cd'
          }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: '16px', 
              fontWeight: '600',
              color: '#856404',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📊 Customer Insights
              <span style={{ 
                fontSize: '12px', 
                color: '#856404', 
                fontWeight: '400' 
              }}>
                (Auto-updating)
              </span>
            </h3>
          </div>
          
          <div style={{ 
            flex: 1, 
            overflowY: 'auto',
            padding: '16px'
          }}>
            {Object.entries(clientInsights).map(([key, value]) => (
              <div key={key} style={{ marginBottom: '14px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '4px',
                  color: '#495057'
                }}>
                  {formatFieldName(key)}
                </label>
                <div style={{
                  padding: '8px 12px',
                  border: '1px solid ' + (newInsightUpdates[key] ? '#28a745' : '#dee2e6'),
                  borderRadius: '4px',
                  fontSize: '13px',
                  backgroundColor: newInsightUpdates[key] ? '#d4edda' : '#ffffff',
                  minHeight: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  position: 'relative',
                  animation: newInsightUpdates[key] ? 'highlight 1s ease-out' : 'none'
                }}>
                  <span style={{ flex: 1 }}>{value || 'Not specified'}</span>
                  {newInsightUpdates[key] && !callEnded && (
                    <div style={{
                      position: 'absolute',
                      right: '4px',
                      top: '2px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      borderRadius: '10px',
                      padding: '2px 6px',
                      fontSize: '10px',
                      fontWeight: '600'
                    }}>
                      UPDATED
                    </div>
                  )}
                  {callEnded && pendingChanges[key] && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginLeft: '8px'
                    }}>
                      <button
                        onClick={() => handleApproveChange(key)}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          border: 'none',
                          backgroundColor: '#28a745',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Approve change"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => handleRejectChange(key)}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          border: 'none',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Reject change"
                      >
                        ✗
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Transcript Column */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '2px solid #007bff',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #dee2e6',
            backgroundColor: '#cce7ff'
          }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: '16px', 
              fontWeight: '600',
              color: '#004085',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🎤 {callEnded ? 'Call Transcript' : 'Live Transcript'}
              {!callEnded && (
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#dc3545',
                  borderRadius: '50%',
                  animation: 'pulse 1s infinite'
                }}></div>
              )}
            </h3>
          </div>
          
          <div 
            ref={transcriptRef}
            style={{ 
              flex: 1, 
              overflowY: 'auto',
              padding: '16px',
              backgroundColor: '#f8f9fa'
            }}
          >
            <div style={{
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: '13px',
              lineHeight: '1.6',
              color: '#495057',
              whiteSpace: 'pre-wrap'
            }}>
              {liveTranscript}
              {liveTranscript && !callEnded && (
                <div style={{
                  marginTop: '16px',
                  padding: '8px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#6c757d',
                  textAlign: 'center'
                }}>
                  🎤 Listening... (AI processing in real-time)
                </div>
              )}
              {callEnded && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: '#d4edda',
                  border: '1px solid #c3e6cb',
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#155724',
                  textAlign: 'center',
                  fontWeight: '500'
                }}>
                  ✅ Call completed successfully. Transcript saved automatically.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '32px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            maxWidth: '450px',
            width: '90%'
          }}>
            <div style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#212529',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              Confirm Submission
            </div>
            <div style={{
              fontSize: '14px',
              color: '#6c757d',
              marginBottom: '24px',
              lineHeight: '1.5',
              textAlign: 'center'
            }}>
              Are you sure you want to finalize this call? This will save all changes and action items to the system.
            </div>
            <div style={{
              padding: '16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              marginBottom: '24px',
              fontSize: '13px'
            }}>
              <div style={{ marginBottom: '8px' }}>
                <strong>Summary:</strong>
              </div>
              <div>• {completedCount} tasks completed</div>
              <div>• {pendingCount} pending items for follow-up</div>
              <div>• {Object.keys(pendingChanges).length} customer insight updates pending approval</div>
            </div>
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              <button
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
                onClick={handleCancelSubmit}
              >
                Cancel
              </button>
              <button
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
                onClick={handleConfirmSubmit}
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
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

export default LiveCallDashboard