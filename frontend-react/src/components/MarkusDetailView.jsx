import { useState, useEffect } from "react";
import ApiService from "../services/apiService";

function MarkusDetailView({ isVisible, onClose }) {
  const [markusData, setMarkusData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadMarkusData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("📋 Loading comprehensive Markus data...");
      const data = await ApiService.getMarkusInfo();
      console.log("✅ Received Markus data:", data);
      setMarkusData(data);
    } catch (err) {
      console.error("❌ Failed to load Markus data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible && !markusData) {
      loadMarkusData();
    }
  }, [isVisible]);

  const handleRefresh = () => {
    setMarkusData(null);
    loadMarkusData();
  };

  if (!isVisible) return null;

  const formatValue = (value) => {
    if (value === null || value === undefined) return "Not available";
    if (typeof value === "object") {
      try {
        return JSON.stringify(value, null, 2);
      } catch (e) {
        return String(value);
      }
    }
    return String(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          maxWidth: "900px",
          maxHeight: "90vh",
          width: "100%",
          overflow: "hidden",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #e0e0e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#f8f9fa",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: "600",
              color: "#333",
            }}
          >
            📋 Comprehensive Markus Information
          </h2>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={handleRefresh}
              disabled={loading}
              style={{
                padding: "8px 16px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              🔄 Refresh
            </button>
            <button
              onClick={onClose}
              style={{
                padding: "8px 16px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            padding: "24px",
            overflowY: "auto",
            maxHeight: "calc(90vh - 100px)",
          }}
        >
          {loading && (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "#666",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  border: "4px solid #f3f3f3",
                  borderTop: "4px solid #007bff",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 16px",
                }}
              ></div>
              Loading Markus data...
            </div>
          )}

          {error && (
            <div
              style={{
                padding: "20px",
                backgroundColor: "#f8d7da",
                color: "#721c24",
                borderRadius: "6px",
                marginBottom: "20px",
              }}
            >
              <h4>❌ Error Loading Data</h4>
              <p>{error}</p>
            </div>
          )}

          {markusData && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "24px" }}
            >
              {/* User Info Section */}
              <div>
                <h3
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#495057",
                    borderBottom: "2px solid #007bff",
                    paddingBottom: "4px",
                    display: "inline-block",
                  }}
                >
                  👤 User Information
                </h3>
                <div
                  style={{
                    backgroundColor: "#f8f9fa",
                    padding: "16px",
                    borderRadius: "8px",
                    border: "1px solid #e9ecef",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <strong>User ID:</strong>{" "}
                      {formatValue(markusData.user_info?.user_id)}
                    </div>
                    <div>
                      <strong>Email:</strong>{" "}
                      {formatValue(markusData.user_info?.email)}
                    </div>
                    <div>
                      <strong>Phone:</strong>{" "}
                      {formatValue(markusData.user_info?.phone_number)}
                    </div>
                    <div>
                      <strong>Address:</strong>{" "}
                      {formatValue(markusData.user_info?.postal_address)}
                    </div>
                    <div>
                      <strong>Created:</strong>{" "}
                      {formatDate(markusData.user_info?.created_at)}
                    </div>
                    <div>
                      <strong>Metadata:</strong>{" "}
                      {formatValue(markusData.user_info?.metadata)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Section */}
              <div>
                <h3
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#495057",
                    borderBottom: "2px solid #28a745",
                    paddingBottom: "4px",
                    display: "inline-block",
                  }}
                >
                  📊 Summary
                </h3>
                <div
                  style={{
                    backgroundColor: "#d4edda",
                    padding: "16px",
                    borderRadius: "8px",
                    border: "1px solid #c3e6cb",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <strong>Total Facts:</strong>{" "}
                      {markusData.summary?.total_facts || 0}
                    </div>
                    <div>
                      <strong>Total Calls:</strong>{" "}
                      {markusData.summary?.total_calls || 0}
                    </div>
                    <div>
                      <strong>Data Source:</strong>{" "}
                      {markusData.summary?.data_source || "Unknown"}
                    </div>
                    <div>
                      <strong>Last Activity:</strong>{" "}
                      {formatDate(markusData.summary?.last_activity)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Profile Section */}
              {markusData.current_profile &&
                markusData.current_profile.length > 0 && (
                  <div>
                    <h3
                      style={{
                        margin: "0 0 12px 0",
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#495057",
                        borderBottom: "2px solid #ffc107",
                        paddingBottom: "4px",
                        display: "inline-block",
                      }}
                    >
                      🎯 Current Profile ({markusData.current_profile.length}{" "}
                      facts)
                    </h3>
                    <div
                      style={{
                        backgroundColor: "#fff3cd",
                        padding: "16px",
                        borderRadius: "8px",
                        border: "1px solid #ffeaa7",
                      }}
                    >
                      {markusData.current_profile.map((fact, index) => (
                        <div
                          key={index}
                          style={{
                            padding: "8px",
                            marginBottom: "8px",
                            backgroundColor: "white",
                            borderRadius: "4px",
                            border: "1px solid #e9ecef",
                          }}
                        >
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "200px 1fr 150px",
                              gap: "12px",
                              alignItems: "start",
                            }}
                          >
                            <div>
                              <strong>{fact.fact_key}:</strong>
                            </div>
                            <div style={{ wordBreak: "break-word" }}>
                              {formatValue(fact.fact_value)}
                            </div>
                            <div style={{ fontSize: "12px", color: "#666" }}>
                              {formatDate(fact.last_observed_at)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Recent Calls Section */}
              {markusData.recent_calls &&
                markusData.recent_calls.length > 0 && (
                  <div>
                    <h3
                      style={{
                        margin: "0 0 12px 0",
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#495057",
                        borderBottom: "2px solid #17a2b8",
                        paddingBottom: "4px",
                        display: "inline-block",
                      }}
                    >
                      📞 Recent Calls ({markusData.recent_calls.length})
                    </h3>
                    <div
                      style={{
                        backgroundColor: "#d1ecf1",
                        padding: "16px",
                        borderRadius: "8px",
                        border: "1px solid #b8daff",
                      }}
                    >
                      {markusData.recent_calls.map((call, index) => (
                        <div
                          key={index}
                          style={{
                            padding: "12px",
                            marginBottom: "8px",
                            backgroundColor: "white",
                            borderRadius: "4px",
                            border: "1px solid #e9ecef",
                          }}
                        >
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr 1fr 1fr",
                              gap: "12px",
                            }}
                          >
                            <div>
                              <strong>Started:</strong>{" "}
                              {formatDate(call.started_at)}
                            </div>
                            <div>
                              <strong>Duration:</strong>{" "}
                              {call.duration_seconds
                                ? `${call.duration_seconds}s`
                                : "N/A"}
                            </div>
                            <div>
                              <strong>Channel:</strong> {call.channel || "N/A"}
                            </div>
                            <div>
                              <strong>Direction:</strong>{" "}
                              {call.direction || "N/A"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Facts and Events Section */}
              {markusData.facts_and_events &&
                markusData.facts_and_events.length > 0 && (
                  <div>
                    <h3
                      style={{
                        margin: "0 0 12px 0",
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#495057",
                        borderBottom: "2px solid #dc3545",
                        paddingBottom: "4px",
                        display: "inline-block",
                      }}
                    >
                      📝 All Facts & Events (
                      {markusData.facts_and_events.length})
                    </h3>
                    <div
                      style={{
                        backgroundColor: "#f8d7da",
                        padding: "16px",
                        borderRadius: "8px",
                        border: "1px solid #f5c6cb",
                        maxHeight: "300px",
                        overflowY: "auto",
                      }}
                    >
                      {markusData.facts_and_events.map((event, index) => (
                        <div
                          key={index}
                          style={{
                            padding: "10px",
                            marginBottom: "8px",
                            backgroundColor: "white",
                            borderRadius: "4px",
                            border: "1px solid #e9ecef",
                          }}
                        >
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "150px 1fr 120px 100px",
                              gap: "12px",
                              alignItems: "start",
                            }}
                          >
                            <div>
                              <strong>{event.fact_key}</strong>
                            </div>
                            <div
                              style={{
                                wordBreak: "break-word",
                                fontSize: "14px",
                              }}
                            >
                              {formatValue(event.fact_value)}
                            </div>
                            <div style={{ fontSize: "12px", color: "#666" }}>
                              {formatDate(event.observed_at)}
                            </div>
                            <div style={{ fontSize: "12px", color: "#666" }}>
                              Call:{" "}
                              {event.call_id
                                ? event.call_id.substring(0, 8) + "..."
                                : "N/A"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default MarkusDetailView;
