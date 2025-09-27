import { useState, useEffect, useRef } from 'react'
import Header from './components/Header'
import ClientInfoStrip from './components/ClientInfoStrip'
import ActionItemsColumn from './components/ActionItemsColumn'
import CustomerInsightsColumn from './components/CustomerInsightsColumn'
import CallReviewColumn from './components/CallReviewColumn'
import ConfirmDialog from './components/ConfirmDialog'
import SuccessScreen from './components/SuccessScreen'
import { systemGeneratedItems, transcriptSegments } from './data/mockData'
import ApiService from './services/apiService'

function App() {
  const [actionItems, setActionItems] = useState([])
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [availableUsers, setAvailableUsers] = useState([])
  const [clientInsights, setClientInsights] = useState({
    totalAssets: 'Loading...',
    overdraftLimit: 'Loading...',
    creditCardLimit: 'Loading...',
    address: 'Loading...',
    phoneNumber: 'Loading...',
    preferredLanguage: 'Loading...',
    email: 'Loading...',
    preferredChannel: 'Loading...',
    employmentStatus: 'Loading...',
    riskProfile: 'Loading...',
    recentTransactions: 'Loading...',
    vacationPeriod: 'Loading...',
    preferredMeetingTime: 'Loading...',
    investmentInterest: 'Loading...'
  })
  const [isLoadingInsights, setIsLoadingInsights] = useState(true)
  const [insightsError, setInsightsError] = useState(null)
  const [apiHealthy, setApiHealthy] = useState(null)
  
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

  // Check API health and load users
  useEffect(() => {
    console.log('🚀 Initializing app...');
    
    const initializeApp = async () => {
      try {
        // Try API first
        console.log('🔍 Checking API health...');
        await ApiService.checkHealth();
        console.log('✅ API is healthy');
        setApiHealthy(true);
        
        // Load available users
        console.log('👥 Loading users...');
        const users = await ApiService.getAllUsers();
        console.log('✅ Loaded users:', users);
        setAvailableUsers(users);
        
        // Auto-select Markus Schmid for hackathon demo
        if (users && users.length > 0) {
          const markusUser = users.find(u => 
            (u.email && u.email.toLowerCase().includes('markus')) ||
            (u.phone_number && u.phone_number.includes('markus')) ||
            (u.postal_address && u.postal_address.toLowerCase().includes('schmid')) ||
            (u.metadata && JSON.stringify(u.metadata).toLowerCase().includes('markus'))
          );
          
          const userToSelect = markusUser || users[0];
          console.log('👤 Auto-selecting user (targeting Markus Schmid):', userToSelect);
          setSelectedUserId(userToSelect.user_id);
        }
      } catch (error) {
        console.error('❌ API failed, falling back to demo mode:', error);
        setApiHealthy(false);
        
        // Fallback to demo mode
        console.log('🔄 Starting demo mode...');
        setAvailableUsers([{
          user_id: 'demo-markus-schmid',
          email: 'markus.schmid@email.com',
          phone_number: '+41 44 123 45 67',
          last_activity: new Date().toISOString()
        }]);
        setSelectedUserId('demo-markus-schmid');
      }
    };
    
    initializeApp();
  }, [])

  // Load client insights when user changes
  useEffect(() => {
    console.log('🔄 User selection changed:', selectedUserId);
    
    if (!selectedUserId) {
      console.log('⏭️ No user selected, skipping insights load');
      return;
    }
    
    const loadClientInsights = async () => {
      console.log('📊 Loading client insights for user:', selectedUserId);
      setIsLoadingInsights(true);
      setInsightsError(null);
      
      try {
        // Try API first if healthy
        if (apiHealthy) {
          console.log('📡 Using API for insights...');
          const insights = await ApiService.getClientInsights(selectedUserId);
          console.log('✅ Received insights from API:', insights);
          setClientInsights(insights);
        } else {
          // Use demo data if API is offline
          console.log('📦 Using demo data (API offline)...');
          const demoData = {
            totalAssets: '2,450,000 CHF',
            overdraftLimit: '50,000 CHF', 
            creditCardLimit: '1,000 CHF/day',
            address: 'Bahnhofstrasse 45, 8001 Zürich',
            phoneNumber: '+41 44 123 45 67',
            preferredLanguage: 'German',
            email: 'markus.schmid@email.com',
            preferredChannel: 'Phone',
            employmentStatus: 'Employed - Senior Manager',
            riskProfile: 'Moderate',
            recentTransactions: 'CHF 500 - Restaurant (Yesterday)',
            vacationPeriod: 'July (entire month)', 
            preferredMeetingTime: 'Afternoon appointments',
            investmentInterest: 'Moderate risk, 100k CHF available'
          };
          
          // Simulate API delay even for demo data
          await new Promise(resolve => setTimeout(resolve, 800));
          setClientInsights(demoData);
        }
      } catch (error) {
        console.error('❌ Failed to load insights, using fallback:', error);
        setInsightsError(`Failed to load: ${error.message}`);
        
        // Emergency fallback
        const fallbackData = {
          totalAssets: '2,450,000 CHF (Fallback)',
          overdraftLimit: '50,000 CHF', 
          creditCardLimit: '1,000 CHF/day',
          address: 'Bahnhofstrasse 45, 8001 Zürich',
          phoneNumber: '+41 44 123 45 67',
          preferredLanguage: 'German',
          email: 'markus.schmid@email.com',
          preferredChannel: 'Phone',
          employmentStatus: 'Employed - Senior Manager',
          riskProfile: 'Moderate',
          recentTransactions: 'CHF 500 - Restaurant (Yesterday)',
          vacationPeriod: 'July (entire month)', 
          preferredMeetingTime: 'Afternoon appointments',
          investmentInterest: 'Moderate risk, 100k CHF available'
        };
        setClientInsights(fallbackData);
      } finally {
        setIsLoadingInsights(false);
        console.log('⏹️ Finished loading insights');
      }
    };
    
    loadClientInsights();
  }, [selectedUserId, apiHealthy])
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [availableUsers, setAvailableUsers] = useState([])
  const [clientInsights, setClientInsights] = useState({
    totalAssets: 'Loading...',
    overdraftLimit: 'Loading...',
    creditCardLimit: 'Loading...',
    address: 'Loading...',
    phoneNumber: 'Loading...',
    preferredLanguage: 'Loading...',
    email: 'Loading...',
    preferredChannel: 'Loading...',
    employmentStatus: 'Loading...',
    riskProfile: 'Loading...',
    recentTransactions: 'Loading...',
    vacationPeriod: 'Loading...',
    preferredMeetingTime: 'Loading...',
    investmentInterest: 'Loading...'
  })
  const [isLoadingInsights, setIsLoadingInsights] = useState(true)
  const [insightsError, setInsightsError] = useState(null)
  const [apiHealthy, setApiHealthy] = useState(null)
  
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

  // Check API health and load users
  useEffect(() => {
    console.log('🚀 Initializing app...');
    
    // For hackathon: Force immediate demo mode to avoid API issues
    console.log('� Starting in demo mode for hackathon...');
    setApiHealthy(false); // Show as offline but working
    setAvailableUsers([{
      user_id: 'demo-markus-schmid',
      email: 'markus.schmid@email.com',
      phone_number: '+41 44 123 45 67',
      last_activity: new Date().toISOString()
    }]);
    setSelectedUserId('demo-markus-schmid');
  }, [])

  // Load client insights when user changes
  useEffect(() => {
    console.log('🔄 User selection changed:', selectedUserId);
    
    if (!selectedUserId) {
      console.log('⏭️ No user selected, skipping insights load');
      return;
    }
    
    const loadClientInsights = async () => {
      console.log('📊 Loading client insights for user:', selectedUserId);
      setIsLoadingInsights(true);
      setInsightsError(null);
      
      try {
        // Try API first if healthy
        if (apiHealthy) {
          console.log('📡 Using API for insights...');
          const insights = await ApiService.getClientInsights(selectedUserId);
          console.log('✅ Received insights from API:', insights);
          setClientInsights(insights);
        } else {
          // Use demo data if API is offline
          console.log('📦 Using demo data (API offline)...');
          const demoData = {
            totalAssets: '2,450,000 CHF',
            overdraftLimit: '50,000 CHF', 
            creditCardLimit: '1,000 CHF/day',
            address: 'Bahnhofstrasse 45, 8001 Zürich',
            phoneNumber: '+41 44 123 45 67',
            preferredLanguage: 'German',
            email: 'markus.schmid@email.com',
            preferredChannel: 'Phone',
            employmentStatus: 'Employed - Senior Manager',
            riskProfile: 'Moderate',
            recentTransactions: 'CHF 500 - Restaurant (Yesterday)',
            vacationPeriod: 'July (entire month)', 
            preferredMeetingTime: 'Afternoon appointments',
            investmentInterest: 'Moderate risk, 100k CHF available'
          };
          
          // Simulate API delay even for demo data
          await new Promise(resolve => setTimeout(resolve, 800));
          setClientInsights(demoData);
        }
      } catch (error) {
        console.error('❌ Failed to load insights, using fallback:', error);
        setInsightsError(`Failed to load: ${error.message}`);
        
        // Emergency fallback
        const fallbackData = {
          totalAssets: '2,450,000 CHF (Fallback)',
          overdraftLimit: '50,000 CHF', 
          creditCardLimit: '1,000 CHF/day',
          address: 'Bahnhofstrasse 45, 8001 Zürich',
          phoneNumber: '+41 44 123 45 67',
          preferredLanguage: 'German',
          email: 'markus.schmid@email.com',
          preferredChannel: 'Phone',
          employmentStatus: 'Employed - Senior Manager',
          riskProfile: 'Moderate',
          recentTransactions: 'CHF 500 - Restaurant (Yesterday)',
          vacationPeriod: 'July (entire month)', 
          preferredMeetingTime: 'Afternoon appointments',
          investmentInterest: 'Moderate risk, 100k CHF available'
        };
        setClientInsights(fallbackData);
      } finally {
        setIsLoadingInsights(false);
        console.log('⏹️ Finished loading insights');
      }
    };
    
    loadClientInsights();
  }, [selectedUserId, apiHealthy])

  // Function to handle user selection
  const handleUserSelection = (userId) => {
    setSelectedUserId(userId)
  }

  useEffect(() => {
    console.log('📜 Starting transcript simulation...');
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
          // ⚠️ COMMENTIAMO QUESTO PER NON SOVRASCRIVERE I DATI API
          // setClientInsights(prev => ({ ...prev, email: 'm.rossi1980@email.it' }))
          setNewInsightUpdates(prev => ({ ...prev, email: true }))
          setPendingChanges(prev => ({ ...prev, email: 'm.rossi1980@email.it' }))
          setNewActionItems(prev => [...prev, systemGeneratedItems[3], systemGeneratedItems[4]])
        }
        if (currentSegment === 7) {
          // ⚠️ COMMENTIAMO QUESTO PER NON SOVRASCRIVERE I DATI API
          // setClientInsights(prev => ({ 
          //   ...prev, 
          //   preferredMeetingTime: 'August afternoons preferred'
          // }))
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
          // ⚠️ COMMENTIAMO QUESTO PER NON SOVRASCRIVERE I DATI API
          // setClientInsights(prev => ({ ...prev, creditCardLimit: 'Current + 5,000 EUR (August)' }))
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

      {/* API Status and User Selection */}
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #dee2e6',
        padding: '8px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* API Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div 
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: apiHealthy === null ? '#6c757d' : apiHealthy ? '#28a745' : '#dc3545'
              }}
            />
            <span style={{ color: '#6c757d' }}>
              {apiHealthy === null ? 'Checking API...' : apiHealthy ? 'API Connected' : 'API Offline'}
            </span>
          </div>

          {/* User Selector */}
          {availableUsers.length > 0 && (
            <div>
              <select
                value={selectedUserId || ''}
                onChange={(e) => handleUserSelection(e.target.value)}
                style={{
                  padding: '4px 8px',
                  fontSize: '14px',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  backgroundColor: '#fff'
                }}
              >
                <option value="">Select User...</option>
                {availableUsers.map(user => (
                  <option key={user.user_id} value={user.user_id}>
                    {user.email || user.phone_number || `User ${user.user_id.slice(0, 8)}`}
                    {user.last_activity && ` (${new Date(user.last_activity).toLocaleDateString()})`}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {availableUsers.length > 0 && (
            <span style={{ color: '#6c757d' }}>
              {availableUsers.length} user{availableUsers.length !== 1 ? 's' : ''} available
            </span>
          )}
        </div>
      </div>

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
          isLoadingInsights={isLoadingInsights}
          insightsError={insightsError}
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
      
      <style>
        {`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.3; }
          100% { opacity: 1; }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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
        `}
      </style>
    </div>
  )
}

export default App