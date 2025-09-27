function SuccessScreen({ completedCount, pendingCount, onReturn }) {
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
          onClick={onReturn}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }
  
  export default SuccessScreen