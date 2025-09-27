function ActionItemsColumn({ 
    actionItems, 
    newActionItems, 
    completedItems, 
    pendingCount,
    onToggleComplete, 
    onDeleteItem 
  }) {
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
  
    // Sort action items: incomplete first, completed last
    const sortedActionItems = actionItems.sort((a, b) => {
      const aCompleted = completedItems.has(a.id)
      const bCompleted = completedItems.has(b.id)
      if (aCompleted && !bCompleted) return 1
      if (!aCompleted && bCompleted) return -1
      return 0
    })
  
    return (
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
              {actionItems.length} items ({pendingCount} pending)
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
            const isNew = newActionItems.includes(item)
            
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
                  boxShadow: isNew ? '0 0 10px rgba(40, 167, 69, 0.3)' : 'none',
                  animation: isNew ? 'slideIn 0.5s ease-out' : 'none',
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
                        onClick={() => onToggleComplete(item.id)}
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
                          onClick={() => onDeleteItem(item.id)}
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
            )
          })}
        </div>
      </div>
    )
  }
  
  export default ActionItemsColumn