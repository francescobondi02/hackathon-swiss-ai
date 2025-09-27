function ConfirmDialog({ 
    completedCount, 
    pendingCount, 
    pendingChanges, 
    onConfirm, 
    onCancel 
  }) {
    return (
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
              onClick={onCancel}
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
              onClick={onConfirm}
            >
              Confirm & Submit
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  export default ConfirmDialog