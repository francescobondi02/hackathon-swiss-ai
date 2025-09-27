function Header({ callEnded, callDuration, finalCallDuration, formatTime }) {
    return (
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
    )
  }
  
  export default Header