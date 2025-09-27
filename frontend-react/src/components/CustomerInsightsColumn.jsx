function CustomerInsightsColumn({ 
    clientInsights, 
    newInsightUpdates, 
    pendingChanges, 
    callEnded,
    onApproveChange, 
    onRejectChange 
  }) {
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
  
    return (
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
                      onClick={() => onApproveChange(key)}
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
                      onClick={() => onRejectChange(key)}
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
    )
  }
  
  export default CustomerInsightsColumn