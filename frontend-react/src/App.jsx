import { useState, useEffect, useRef } from 'react'

function UnifiedCallDashboard() {
  const [callMode, setCallMode] = useState('live') // 'live' or 'postcall'
  const [actionItems, setActionItems] = useState([])
  const [selectedItems, setSelectedItems] = useState(new Set())
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
  const [pendingUpdates, setPendingUpdates] = useState({})
  const [callSummaryNotes, setCallSummaryNotes] = useState('')
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [callEnded, setCallEnded] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [actionItemsVisible, setActionItemsVisible] = useState(false)
  const [insightsConfirmationVisible, setInsightsConfirmationVisible] = useState(false)
  const [transitionComplete, setTransitionComplete] = useState(false)
  const transcriptRef = useRef(null)

  // Call data that gets populated during the live call
  const [completedCall, setCompletedCall] = useState(null)

  // Simulated live transcript streaming
  const transcriptSegments = [
    "[18:06] Agent: Good morning, Mr. Rossi. This is Sarah from UBS. How may I assist you today?",
    "[18:06] Client: Good morning, Sarah. I'm calling about increasing my credit card daily limit.",
    "[18:07] Agent: I'll be happy to help with that. For security purposes, could you please confirm your date of birth and current address?",
    "[18:07] Client: Certainly. I was born on March 15, 1985, and I live at Bahnhofstrasse 45 in Zurich.",
    "[18:07] Agent: Perfect, thank you. I can see your current daily limit is 1,000 CHF. What limit would you like to set?",
    "[18:08] Client: I'd like to increase it to 2,000 CHF per day, please. I have some larger purchases coming up.",
    "[18:08] Agent: I can process that change immediately. Let me update your account... Your new daily limit of 2,000 CHF is now active.",
    "[18:09] Client: That's perfect, thank you. Also, I wanted to ask about investment options for some funds I have sitting in my savings account.",
    "[18:09] Agent: I'd be happy to help with that. How much are you looking to invest approximately?",
    "[18:10] Client: Around 100,000 CHF. I'm interested in something with moderate risk.",
    "[18:10] Agent: Given your risk profile, I can schedule you with one of our investment advisors to discuss portfolio options. Would next week work for you?",
    "[18:11] Client: Actually, I'll be on vacation the entire month of July, so maybe we can schedule something for August? I prefer afternoon appointments.",
    "[18:11] Agent: Perfect. I'll arrange that for August and send you a confirmation email. Is there anything else I can help you with today?",
    "[18:12] Client: No, that covers everything. Thank you very much, Sarah.",
    "[18:12] Agent: You're very welcome, Mr. Rossi. Have a wonderful day!"
  ]

  // System generated action items based on client history
  const systemGeneratedItems = [
    {
      id: 'sys-1',
      priority: 'High',
      text: 'Process credit card limit increase to 2,000 CHF',
      suggestion: 'Use standard limit increase form. Client verified identity successfully.',
      source: 'Live Call - Auto Generated',
      timestamp: '18:08',
      completed: false,
      dueDate: '28.09.2025',
      assignee: 'Cards Team'
    },
    {
      id: 'sys-2', 
      priority: 'High',
      text: 'Schedule investment consultation appointment',
      suggestion: 'Schedule for August - client mentioned July vacation. Prefers afternoon slots (from previous calls).',
      source: 'AI Generated from Call History',
      timestamp: '18:11',
      completed: false,
      dueDate: '30.09.2025',
      assignee: 'Investment Team'
    },
    {
      id: 'sys-3',
      priority: 'Medium', 
      text: 'Send investment portfolio information packet',
      suggestion: 'Focus on moderate risk options. Client has 100k CHF available for investment.',
      source: 'Live Call - Auto Generated',
      timestamp: '18:10',
      completed: false,
      dueDate: '29.09.2025',
      assignee: 'Investment Team'
    },
    {
      id: 'sys-4',
      priority: 'Low',
      text: 'Update client vacation period preferences',
      suggestion: 'Note: Client unavailable entire July month. Use for future scheduling.',
      source: 'AI Generated from Call History',
      timestamp: '18:11',
      completed: false,
      dueDate: '30.09.2025',
      assignee: 'Client Services'
    },
    {
      id: 'sys-5',
      priority: 'Medium',
      text: 'Follow up on investment decision in 2 weeks',
      suggestion: 'Client showed high interest. Send reminder about August appointment availability.',
      source: 'System Generated from History',
      timestamp: 'Pre-call',
      completed: false,
      dueDate: '12.10.2025',
      assignee: 'Investment Team'
    },
    {
      id: 'sys-6',
      priority: 'Low',
      text: 'Send confirmation email for all changes',
      suggestion: 'Include: credit limit change confirmation, investment appointment details.',
      source: 'Live Call - Auto Generated',
      timestamp: '28.09.2025',
      completed: false,
      dueDate: '28.09.2025',
      assignee: 'Operations'
    }
  ]

  useEffect(() => {
    if (callMode === 'live') {
      let currentSegment = 0
      const timer = setInterval(() => {
        if (currentSegment < transcriptSegments.length) {
          setLiveTranscript(prev => {
            const newTranscript = prev + (prev ? '\n\n' : '') + transcriptSegments[currentSegment]
            return newTranscript
          })
          
          // Simulate real-time insight updates and action item generation
          if (currentSegment === 3) {
            setNewInsightUpdates(prev => ({ ...prev, address: true }))
          }
          if (currentSegment === 5) {
            setClientInsights(prev => ({ ...prev, creditCardLimit: '2,000 CHF/day (pending)' }))
            setNewInsightUpdates(prev => ({ ...prev, creditCardLimit: true }))
            setNewActionItems(prev => [...prev, systemGeneratedItems[0]])
          }
          if (currentSegment === 9) {
            setClientInsights(prev => ({ ...prev, investmentInterest: 'Moderate risk, 100k CHF available' }))
            setNewInsightUpdates(prev => ({ ...prev, investmentInterest: true }))
            setNewActionItems(prev => [...prev, systemGeneratedItems[2]])
          }
          if (currentSegment === 11) {
            setClientInsights(prev => ({ 
              ...prev, 
              vacationPeriod: 'July (entire month)',
              preferredMeetingTime: 'Afternoon appointments'
            }))
            setNewInsightUpdates(prev => ({ 
              ...prev, 
              vacationPeriod: true, 
              preferredMeetingTime: true 
            }))
            setNewActionItems(prev => [...prev, systemGeneratedItems[1], systemGeneratedItems[3]])
          }
          
          currentSegment++
        } else {
          clearInterval(timer)
          // Call ends - transition to post-call mode
          setTimeout(() => {
            endCall()
          }, 2000)
        }
      }, 3000)

      // Call duration timer
      const durationTimer = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartTime.getTime()) / 1000))
      }, 1000)

      // Load system generated items from client history
      setTimeout(() => {
        setNewActionItems([systemGeneratedItems[4]])
      }, 1000)

      return () => {
        clearInterval(timer)
        clearInterval(durationTimer)
      }
    }
  }, [callMode])

  useEffect(() => {
    if (transcriptRef.current && callMode === 'live') {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [liveTranscript])

  const endCall = () => {
    // Finalize call data
    const finalCall = {
      id: 1,
      date: '28.09.2025',
      time: '18:06',
      title: 'Credit Card Limit Increase & Investment Inquiry',
      type: 'Phone Call',
      status: 'Completed',
      duration: formatTime(callDuration),
      transcript: liveTranscript,
      summary: 'Client successfully requested credit card limit increase from 1,000 CHF to 2,000 CHF daily. Expressed interest in investing 100,000 CHF with moderate risk tolerance. Investment consultation scheduled for August (client unavailable in July). All requests processed successfully.',
      callOutcome: 'Successful - All requests fulfilled',
      isJustCompleted: true
    }
    
    setCompletedCall(finalCall)
    
    // Update client insights with final values
    setClientInsights(prev => ({ ...prev, creditCardLimit: '2,000 CHF/day' }))
    
    // Set up post-call state
    const allGeneratedItems = [...newActionItems, systemGeneratedItems[5]]
    // Mark first item as completed (credit limit processed during call)
    allGeneratedItems[0] = { ...allGeneratedItems[0], completed: true }
    setActionItems(allGeneratedItems)
    
    // Set pending updates for review
    setPendingUpdates({
      creditCardLimit: true,
      vacationPeriod: true,
      investmentInterest: true,
      preferredMeetingTime: true
    })
    
    // Set action items for post-call review
    setActionItems(systemGeneratedItems)
    
    // Start smooth transition sequence
    setCallEnded(true)
    setShowNotification(true)
    
    // Animate action items appearing
    setTimeout(() => {
      setActionItemsVisible(true)
    }, 500)
    
    // Show insights confirmation after action items
    setTimeout(() => {
      setInsightsConfirmationVisible(true)
    }, 1000)
    
    // Complete transition
    setTimeout(() => {
      setTransitionComplete(true)
    }, 1500)
    
    // Switch to post-call mode
    setCallMode('postcall')
    setSelectedConversation(1) // Auto-expand transcript
  }

  const handleItemSelect = (itemId) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    setSelectedItems(newSelected)
  }

  const handleInsightApproval = (field, approved) => {
    if (approved) {
      setPendingUpdates(prev => ({ ...prev, [field]: false }))
      setNewInsightUpdates(prev => ({ ...prev, [field]: false }))
    } else {
      // Revert to original value
      const originalValues = {
        creditCardLimit: '1,000 CHF/day',
        vacationPeriod: '',
        investmentInterest: '',
        preferredMeetingTime: ''
      }
      setClientInsights(prev => ({ ...prev, [field]: originalValues[field] || '' }))
      setPendingUpdates(prev => ({ ...prev, [field]: false }))
      setNewInsightUpdates(prev => ({ ...prev, [field]: false }))
    }
  }

  const dismissNotification = () => {
    setShowNotification(false)
  }

  const toggleItemComplete = (itemId) => {
    setActionItems(items => items.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    ))
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

  const addNewActionItem = () => {
    const newItem = {
      id: Date.now(),
      priority: 'Medium',
      text: callMode === 'live' ? 'New action item' : 'New manual action item',
      suggestion: 'Add specific instructions based on client needs.',
      source: 'Manual Entry',
      completed: false,
      dueDate: new Date(Date.now() + 24*60*60*1000).toLocaleDateString('de-CH'),
      assignee: callMode === 'live' ? 'To be assigned' : 'To be assigned'
    }
    if (callMode === 'live') {
      setNewActionItems(prev => [newItem, ...prev])
    } else {
      setActionItems(prev => [newItem, ...prev])
    }
  }

  const approveInsightUpdate = (field) => {
    setPendingUpdates(prev => {
      const updated = { ...prev }
      delete updated[field]
      return updated
    })
    if (callMode === 'live') {
      setNewInsightUpdates(prev => {
        const updated = { ...prev }
        delete updated[field]
        return updated
      })
    }
  }

  const rejectInsightUpdate = (field) => {
    setPendingUpdates(prev => {
      const updated = { ...prev }
      delete updated[field]
      return updated
    })
    if (callMode === 'live') {
      setNewInsightUpdates(prev => {
        const updated = { ...prev }
        delete updated[field]
        return updated
      })
    }
  }

  const updateInsight = (field, value) => {
    setClientInsights(prev => ({ ...prev, [field]: value }))
  }

  const finalizeCall = () => {
    setShowCompletionModal(true)
  }

  const completeCallReview = () => {
    console.log('Call review completed')
    setShowCompletionModal(false)
    // Could reset to start new call or redirect to dashboard
  }

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

  const getStatusStyle = (status) => {
    switch (status) {
      case 'In Progress':
        return { color: '#004085', backgroundColor: '#cce7ff', border: '1px solid #b8daff' }
      case 'Completed':
        return { color: '#155724', backgroundColor: '#d4edda', border: '1px solid #c3e6cb' }
      case 'Follow-up Required':
        return { color: '#856404', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7' }
      case 'Pending':
        return { color: '#721c24', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb' }
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

  const allActionItems = callMode === 'live' ? [...actionItems, ...newActionItems] : actionItems
  const pendingActionItems = allActionItems.filter(item => !item.completed)
  const completedActionItems = allActionItems.filter(item => item.completed)

  if (callMode === 'live') {
    // LIVE CALL DASHBOARD
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
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#e60028' }}>LIVE CALL</div>
              <div style={{ fontSize: '12px', color: '#6c757d' }}>Client: Mario Rossi • Agent: Sarah K.</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
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
          </div>
        </header>

        {/* Client Info Strip */}
        <div style={{
          backgroundColor: '#fff3cd',
          borderBottom: '1px solid #ffeaa7',
          padding: '8px 24px',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '24px'
        }}>
          <strong>Quick Info:</strong>
          <span>Assets: CHF 2.45M</span>
          <span>Risk: Moderate</span>
          <span>Language: German</span>
          <span>Relationship: 8 years</span>
          <span style={{ color: '#856404', fontWeight: '500' }}>⚠ July: On vacation (entire month)</span>
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
                  {allActionItems.length} items
                </span>
              </h3>
              <button
                onClick={addNewActionItem}
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                + Add
              </button>
            </div>
            
            <div style={{ 
              flex: 1, 
              overflowY: 'auto',
              padding: '12px'
            }}>
              {allActionItems.map((item, idx) => (
                <div 
                  key={item.id} 
                  style={{
                    padding: '14px',
                    marginBottom: '10px',
                    border: '1px solid #e9ecef',
                    borderRadius: '6px',
                    backgroundColor: '#ffffff',
                    borderLeft: `4px solid ${getPriorityStyle(item.priority).color}`,
                    boxShadow: newActionItems.includes(item) ? '0 0 10px rgba(40, 167, 69, 0.3)' : 'none',
                    animation: newActionItems.includes(item) ? 'slideIn 0.5s ease-out' : 'none'
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
                      <span>{item.text}</span>
                      <div style={{
                        ...getPriorityStyle(item.priority),
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: '600'
                      }}>
                        {item.priority}
                      </div>
                    </div>
                    
                    <div style={{
                      fontSize: '12px',
                      color: '#6c757d',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span>{item.source}</span>
                      {item.timestamp && (
                        <>
                          <span>•</span>
                          <span>{item.timestamp}</span>
                        </>
                      )}
                    </div>

                    {item.suggestion && (
                      <div style={{
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e9ecef',
                        borderRadius: '4px',
                        padding: '8px',
                        fontSize: '12px',
                        lineHeight: '1.4'
                      }}>
                        <span style={{ fontWeight: '600', color: '#495057' }}>💡 Suggestion: </span>
                        <span style={{ color: '#6c757d' }}>{item.suggestion}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
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
                    {newInsightUpdates[key] && (
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
                🎤 Live Transcript
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#dc3545',
                  borderRadius: '50%',
                  animation: 'pulse 1s infinite'
                }}></div>
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
                {liveTranscript && (
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
              </div>
            </div>
          </div>
        </div>
        
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
  } else {
    // POST-CALL DASHBOARD
    return (
      <div style={{
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        backgroundColor: '#f5f6fa',
        minHeight: '100vh',
        color: '#212529'
      }}>
        {/* Header */}
        <header style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #dee2e6',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
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
              <div style={{ fontSize: '16px', fontWeight: '500' }}>Post-Call Review</div>
              <div style={{ fontSize: '12px', color: '#6c757d' }}>
                Client: Mario Rossi • Call completed: {completedCall?.time} • Duration: {completedCall?.duration}
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              padding: '6px 12px',
              backgroundColor: '#28a745',
              color: 'white',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              Call Completed Successfully
            </div>
            <button
              onClick={finalizeCall}
              style={{
                padding: '8px 16px',
                backgroundColor: '#e60028',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Finalize & Submit
            </button>
          </div>
        </header>

        {/* Call End Notification Bar */}
        {showNotification && (
          <div style={{
            backgroundColor: '#28a745',
            color: 'white',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            animation: 'slideDown 0.5s ease-out, pulse 2s infinite',
            boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px'
              }}>
                ✓
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '2px' }}>
                  Call Completed Successfully!
                </div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>
                  Action items generated and client insights updated. Please review and confirm changes.
                </div>
              </div>
            </div>
            <button
              onClick={dismissNotification}
              style={{
                background: 'none',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Call Summary Bar */}
        <div style={{
          backgroundColor: '#d4edda',
          borderBottom: '1px solid #c3e6cb',
          padding: '12px 24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '14px', color: '#155724' }}>
              <strong>Call Outcome:</strong> {completedCall?.callOutcome} • 
              <strong> Key Actions:</strong> Credit limit increased, Investment consultation scheduled
            </div>
            <div style={{ fontSize: '12px', color: '#155724' }}>
              {pendingActionItems.length} pending items • {completedActionItems.length} completed
            </div>
          </div>
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
            borderRadius: '6px',
            border: '1px solid #dee2e6',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            opacity: actionItemsVisible ? 1 : 0,
            transform: actionItemsVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s ease-out',
            animation: actionItemsVisible ? 'fadeInUp 0.6s ease-out' : 'none',
            border: actionItemsVisible ? '2px solid #28a745' : '1px solid #dee2e6'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #dee2e6',
              backgroundColor: '#f8f9fa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: '16px', 
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📋 Generated Action Items
                <span style={{ 
                  fontSize: '12px', 
                  color: '#6c757d', 
                  fontWeight: '400' 
                }}>
                  ({actionItems.length} total)
                </span>
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={addNewActionItem}
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                >
                  + Add
                </button>
                {selectedItems.size > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    style={{
                      padding: '4px 8px',
                      fontSize: '11px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete ({selectedItems.size})
                  </button>
                )}
              </div>
            </div>
            
            <div style={{ 
              flex: 1, 
              overflowY: 'auto',
              padding: '12px'
            }}>
              {actionItems.map((item, idx) => (
                <div key={item.id} style={{
                  padding: '12px',
                  marginBottom: '8px',
                  border: '1px solid #e9ecef',
                  borderRadius: '4px',
                  backgroundColor: item.completed ? '#f8f9fa' : '#ffffff',
                  opacity: item.completed ? 0.7 : 1,
                  borderLeft: `3px solid ${getPriorityStyle(item.priority).color}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => handleItemSelect(item.id)}
                      style={{ marginTop: '2px' }}
                    />
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleItemComplete(item.id)}
                      style={{ marginTop: '2px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontSize: '13px', 
                        fontWeight: '500',
                        marginBottom: '4px',
                        textDecoration: item.completed ? 'line-through' : 'none'
                      }}>
                        {item.text}
                      </div>
                      
                      <div style={{ 
                        fontSize: '11px', 
                        color: '#6c757d',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexWrap: 'wrap',
                        marginBottom: '8px'
                      }}>
                        <span>Due: {item.dueDate}</span>
                        <span>•</span>
                        <span>{item.assignee}</span>
                        <span>•</span>
                        <span>{item.source}</span>
                      </div>

                      {item.suggestion && (
                        <div style={{
                          backgroundColor: '#e8f4fd',
                          border: '1px solid #bee5eb',
                          borderRadius: '4px',
                          padding: '8px',
                          fontSize: '12px',
                          lineHeight: '1.4'
                        }}>
                          <span style={{ fontWeight: '600', color: '#0c5460' }}>💡 Suggestion: </span>
                          <span style={{ color: '#0c5460' }}>{item.suggestion}</span>
                        </div>
                      )}
                    </div>
                    <div style={{
                      ...getPriorityStyle(item.priority),
                      padding: '2px 6px',
                      borderRadius: '10px',
                      fontSize: '10px',
                      fontWeight: '500'
                    }}>
                      {item.priority}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Insights Column */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '6px',
            border: '1px solid #dee2e6',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            opacity: insightsConfirmationVisible ? 1 : 0,
            transform: insightsConfirmationVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s ease-out',
            animation: insightsConfirmationVisible ? 'fadeInUp 0.6s ease-out' : 'none',
            border: insightsConfirmationVisible ? '2px solid #ffc107' : '1px solid #dee2e6'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #dee2e6',
              backgroundColor: '#f8f9fa'
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: '16px', 
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                👤 Updated Customer Insights
                <span style={{ 
                  fontSize: '11px', 
                  color: '#856404',
                  backgroundColor: '#fff3cd',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontWeight: '500'
                }}>
                  Review Required
                </span>
              </h3>
            </div>
            
            <div style={{ 
              flex: 1, 
              overflowY: 'auto',
              padding: '16px'
            }}>
              {Object.entries(clientInsights).map(([key, value]) => (
                <div key={key} style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '500',
                    marginBottom: '4px',
                    color: '#495057'
                  }}>
                    {formatFieldName(key)}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => updateInsight(key, e.target.value)}
                      placeholder="Not specified"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        paddingRight: pendingUpdates[key] ? '60px' : '10px',
                        border: '1px solid ' + (pendingUpdates[key] ? '#ffc107' : '#dee2e6'),
                        borderRadius: '4px',
                        fontSize: '13px',
                        backgroundColor: pendingUpdates[key] ? '#fff3cd' : '#ffffff'
                      }}
                    />
                    {pendingUpdates[key] && (
                      <div style={{
                        position: 'absolute',
                        right: '4px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        display: 'flex',
                        gap: '2px'
                      }}>
                        <button
                          onClick={() => approveInsightUpdate(key)}
                          style={{
                            width: '20px',
                            height: '20px',
                            border: 'none',
                            borderRadius: '3px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '10px'
                          }}
                          title="Approve change"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => rejectInsightUpdate(key)}
                          style={{
                            width: '20px',
                            height: '20px',
                            border: 'none',
                            borderRadius: '3px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '10px'
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

          {/* Conversation Review Column */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '6px',
            border: '1px solid #dee2e6',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #dee2e6',
              backgroundColor: '#f8f9fa'
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: '16px', 
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                💬 Call Review & Summary
              </h3>
            </div>
            
            <div style={{ 
              flex: 1, 
              overflowY: 'auto',
              padding: '16px'
            }}>
              {/* AI Generated Summary */}
              <div style={{
                backgroundColor: '#d4edda',
                border: '1px solid #c3e6cb',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '16px'
              }}>
                <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#155724' }}>
                  🤖 AI Generated Summary
                </div>
                <div style={{ fontSize: '12px', lineHeight: '1.5', color: '#155724' }}>
                  {completedCall?.summary}
                </div>
              </div>

              {/* Manual Notes Section */}
              <div style={{
                border: '1px solid #dee2e6',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '16px'
              }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#495057'
                }}>
                  Additional Notes
                </label>
                <textarea
                  value={callSummaryNotes}
                  onChange={(e) => setCallSummaryNotes(e.target.value)}
                  placeholder="Add any additional observations or notes about the call..."
                  style={{
                    width: '100%',
                    minHeight: '80px',
                    padding: '8px',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    fontSize: '12px',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Call Transcript (Collapsible) */}
              <div style={{
                border: '1px solid #dee2e6',
                borderRadius: '6px',
                overflow: 'hidden'
              }}>
                <button
                  onClick={() => setSelectedConversation(selectedConversation === 1 ? null : 1)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#f8f9fa',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}
                >
                  <span>📜 Full Transcript</span>
                  <span>{selectedConversation === 1 ? '▼' : '▶'}</span>
        </button>
                
                {selectedConversation === 1 && completedCall && (
                  <div style={{
                    padding: '12px',
                    backgroundColor: '#f8f9fa',
                    borderTop: '1px solid #dee2e6',
                    fontSize: '11px',
                    lineHeight: '1.4',
                    fontFamily: 'Consolas, Monaco, monospace',
                    maxHeight: '300px',
                    overflowY: 'auto'
                  }}>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                      {completedCall.transcript}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '6px',
              padding: '20px',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px', fontWeight: '500' }}>
                Confirm Deletion
              </h3>
              <p style={{ marginBottom: '20px', fontSize: '13px', color: '#6c757d' }}>
                Are you sure you want to delete {selectedItems.size} selected action item{selectedItems.size > 1 ? 's' : ''}?
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    background: 'white',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#dc3545',
                    border: '1px solid #dc3545',
                    borderRadius: '4px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Call Completion Modal */}
        {showCompletionModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', fontWeight: '500', color: '#28a745' }}>
                ✅ Finalize Call Review
              </h3>
              <div style={{ marginBottom: '20px', fontSize: '14px', lineHeight: '1.6' }}>
                <p>Review Summary:</p>
                <ul style={{ fontSize: '13px', color: '#6c757d' }}>
                  <li>{pendingActionItems.length} action items created</li>
                  <li>{Object.keys(pendingUpdates).length} customer insights pending approval</li>
                  <li>Call duration: {completedCall?.duration}</li>
                  <li>Call outcome: {completedCall?.callOutcome}</li>
                </ul>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowCompletionModal(false)}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #dee2e6',
                    borderRadius: '6px',
                    background: 'white',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Continue Reviewing
                </button>
                <button
                  onClick={completeCallReview}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#28a745',
                    border: '1px solid #28a745',
                    borderRadius: '6px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Submit & Complete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  )
  }
}

// Add CSS animations
const styles = `
  @keyframes slideDown {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(40, 167, 69, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(40, 167, 69, 0);
    }
  }
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}

export default UnifiedCallDashboard