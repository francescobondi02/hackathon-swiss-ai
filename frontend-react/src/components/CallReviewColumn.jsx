import { useRef, useEffect } from 'react'

function CallReviewColumn({ 
  callEnded, 
  liveTranscript, 
  additionalNotes, 
  transcriptCollapsed,
  onNotesChange, 
  onToggleTranscript 
}) {
  const transcriptRef = useRef(null)

  useEffect(() => {
    if (transcriptRef.current && !transcriptCollapsed) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [liveTranscript, transcriptCollapsed])

  return (
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
          💬 {callEnded ? 'Call Review & Summary' : 'Live Transcript'}
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
      
      <div style={{ 
        flex: 1, 
        overflowY: 'auto',
        padding: '16px',
        backgroundColor: '#f8f9fa'
      }}>
        {callEnded ? (
          <div>
            {/* AI Generated Summary */}
            <div style={{
              backgroundColor: '#d4edda',
              border: '1px solid #c3e6cb',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#155724'
              }}>
                🤖 AI Generated Summary
              </div>
              <div style={{
                fontSize: '14px',
                lineHeight: '1.6',
                color: '#155724'
              }}>
                Client successfully requested investment mandate for 100,000 CHF with moderate risk tolerance. Updated email address from marco.rossi@email.it to m.rossi1980@email.it. Scheduled investment consultation for August (client unavailable in July). Processed temporary credit card limit increase of additional 5,000 EUR for August travel period. All requests handled successfully with clear follow-up actions identified.
              </div>
            </div>

            {/* Additional Notes */}
            <div style={{
              marginBottom: '20px'
            }}>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#6c757d',
                marginBottom: '8px'
              }}>
                Additional Notes
              </div>
              <textarea
                value={additionalNotes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="Add any additional observations or notes about the call..."
                style={{
                  width: '100%',
                  height: '80px',
                  padding: '12px',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>

            {/* Full Transcript - Collapsible */}
            <div style={{
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              backgroundColor: '#ffffff'
            }}>
              <div 
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#f8f9fa',
                  borderBottom: transcriptCollapsed ? 'none' : '1px solid #dee2e6',
                  borderRadius: transcriptCollapsed ? '8px' : '8px 8px 0 0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#6c757d'
                }}
                onClick={onToggleTranscript}
              >
                📄 Full Transcript
                <div style={{
                  marginLeft: 'auto',
                  transform: transcriptCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
                  transition: 'transform 0.3s ease',
                  fontSize: '12px'
                }}>
                  ▼
                </div>
              </div>
              
              {!transcriptCollapsed && (
                <div 
                  ref={transcriptRef}
                  style={{
                    padding: '16px',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <div style={{
                    fontFamily: 'Consolas, Monaco, monospace',
                    fontSize: '12px',
                    lineHeight: '1.6',
                    color: '#495057',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {liveTranscript}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div 
            ref={transcriptRef}
            style={{
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: '13px',
              lineHeight: '1.6',
              color: '#495057',
              whiteSpace: 'pre-wrap'
            }}
          >
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
          </div>
        )}
      </div>
    </div>
  )
}

export default CallReviewColumn