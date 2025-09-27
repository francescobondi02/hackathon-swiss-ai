import { useState, useEffect } from "react";
import ApiService from "../services/apiService";

function ClientInfoStrip({
  callEnded,
  finalCallDuration,
  completedCount,
  pendingCount,
  onFinalizeSubmit,
  userData,
}) {
  // Helper function to get display name
  const getDisplayName = () => {
    if (!userData) return "Loading...";
    if (userData.first_name && userData.last_name) {
      return `${userData.first_name} ${userData.last_name}`;
    }
    if (userData.email) {
      return userData.email.split("@")[0];
    }
    return "Unknown User";
  };

  return (
    <div
      style={{
        backgroundColor: callEnded ? "#d4edda" : "#fff3cd",
        borderBottom: callEnded ? "1px solid #c3e6cb" : "1px solid #ffeaa7",
        padding: "12px 24px",
        fontSize: "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        transition: "all 0.5s ease",
      }}
    >
      {callEnded ? (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                color: "#155724",
                fontWeight: "600",
              }}
            >
              <span style={{ fontSize: "18px" }}>✅</span>
              <div>
                <div style={{ fontSize: "16px" }}>Post-Call Review</div>
                <div style={{ fontSize: "12px", fontWeight: "400" }}>
                  Client: {getDisplayName()} • Call completed: 14:37 • Duration:{" "}
                  {finalCallDuration}
                </div>
              </div>
            </div>
            <div
              style={{
                height: "32px",
                width: "1px",
                backgroundColor: "#c3e6cb",
              }}
            ></div>
            <div style={{ color: "#155724" }}>
              <strong>Call Outcome:</strong> Successful •{" "}
              <strong>Key Actions:</strong> Investment mandate, Credit card
              increase, Meeting scheduled
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                padding: "8px 16px",
                backgroundColor: "#28a745",
                color: "white",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              Call Completed Successfully
            </div>
            <div
              style={{
                padding: "8px 16px",
                backgroundColor: "#155724",
                color: "white",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {completedCount} completed • {pendingCount} pending items
            </div>
            <button
              style={{
                padding: "10px 20px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
              }}
              onClick={onFinalizeSubmit}
            >
              Finalize & Submit
            </button>
          </div>
        </>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            width: "100%",
          }}
        >
          <strong>Quick Info:</strong>
          <span>
            Assets:{" "}
            {userData?.profile_facts?.find((item) => {
              if (item.fact_key === "kyc") {
                return item.fact_value?.total_assets_reported;
              }
            })?.fact_value?.total_assets_reported || "Loading..."}
          </span>
          <span>
            Risk:{" "}
            {userData?.profile_facts?.find((item) => item.fact_key === "invest")
              ?.fact_value?.risk_profile || "Loading..."}
          </span>
          <span>
            Language:{" "}
            {userData?.profile_facts?.find(
              (item) => item.fact_key === "pref.language"
            )?.fact_value || "Loading..."}
          </span>
          <span>Relationship: 8 years</span>
        </div>
      )}
    </div>
  );
}

export default ClientInfoStrip;
