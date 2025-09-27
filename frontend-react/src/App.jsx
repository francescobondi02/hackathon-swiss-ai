import { useState, useEffect, useRef } from "react";
import Header from "./components/Header";
import ClientInfoStrip from "./components/ClientInfoStrip";
import ActionItemsColumn from "./components/ActionItemsColumn";
import CustomerInsightsColumn from "./components/CustomerInsightsColumn";
import CallReviewColumn from "./components/CallReviewColumn";
import ConfirmDialog from "./components/ConfirmDialog";
import SuccessScreen from "./components/SuccessScreen";
import { systemGeneratedItems, transcriptSegments } from "./data/mockData";
import ApiService from "./services/apiService";

function App() {
  // Helper function to extract client insights from userData
  const extractClientInsights = (userData) => {
    if (!userData || !userData.profile_facts) {
      return {
        totalAssets: "Not available",
        overdraftLimit: "Not available",
        creditCardLimit: "Not available",
        address: userData?.postal_address || "Not available",
        phoneNumber: userData?.phone_number || "Not available",
        preferredLanguage: "Not available",
        email: userData?.email || "Not available",
        preferredChannel: "Not available",
        employmentStatus: "Not available",
        riskProfile: "Not available",
        recentTransactions: "Not available",
        vacationPeriod: "Not available",
        preferredMeetingTime: "Not available",
        investmentInterest: "Not available",
      };
    }

    // Extract data from profile_facts
    const accountFact = userData.profile_facts.find(
      (f) => f.fact_key === "account"
    );
    const kycFact = userData.profile_facts.find((f) => f.fact_key === "kyc");
    const investFact = userData.profile_facts.find(
      (f) => f.fact_key === "invest"
    );
    const languageFact = userData.profile_facts.find(
      (f) => f.fact_key === "pref.language"
    );
    const channelFact = userData.profile_facts.find(
      (f) => f.fact_key === "pref.contact_channel"
    );
    const meetingTimeFact = userData.profile_facts.find(
      (f) => f.fact_key === "pref.meeting_time"
    );
    const vacationFact = userData.profile_facts.find(
      (f) => f.fact_key === "pref.vacation"
    );

    return {
      totalAssets:
        kycFact?.fact_value?.total_assets_reported || "Not available",
      overdraftLimit: accountFact?.fact_value?.overdraft_limit
        ? `${accountFact.fact_value.overdraft_limit.toLocaleString()} CHF`
        : "Not available",
      creditCardLimit: accountFact?.fact_value?.credit_card_limit
        ? `${accountFact.fact_value.credit_card_limit.toLocaleString()} CHF`
        : "Not available",
      address: userData.postal_address || "Not available",
      phoneNumber: userData.phone_number || "Not available",
      preferredLanguage: languageFact?.fact_value || "Not available",
      email: userData.email || "Not available",
      preferredChannel: channelFact?.fact_value || "Not available",
      employmentStatus:
        kycFact?.fact_value?.employment_status || "Not available",
      riskProfile: investFact?.fact_value?.risk_profile || "Not available",
      recentTransactions:
        accountFact?.fact_value?.recent_transactions?.[0] || "Not available",
      vacationPeriod: vacationFact?.fact_value || "Not available",
      preferredMeetingTime: meetingTimeFact?.fact_value || "Not available",
      investmentInterest:
        investFact?.fact_value?.goals?.join(", ") || "Not available",
    };
  };

  const [actionItems, setActionItems] = useState([]);
  const [clientInsights, setClientInsights] = useState({
    // Now it's standard, but could be done dynamic
    totalAssets: "Loading...",
    overdraftLimit: "Loading...",
    creditCardLimit: "Loading...",
    address: "Loading...",
    phoneNumber: "Loading...",
    preferredLanguage: "Loading...",
    email: "Loading...",
    preferredChannel: "Loading...",
    employmentStatus: "Loading...",
    riskProfile: "Loading...",
    recentTransactions: "Loading...",
    vacationPeriod: "Loading...",
    preferredMeetingTime: "Loading...",
    investmentInterest: "Loading...",
  });
  const [userData, setUserData] = useState(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);
  const [insightsError, setInsightsError] = useState(null);
  const [apiHealthy, setApiHealthy] = useState(null);

  const [liveTranscript, setLiveTranscript] = useState("");
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime] = useState(new Date());
  const [newInsightUpdates, setNewInsightUpdates] = useState({});
  const [newActionItems, setNewActionItems] = useState([]);
  const [callEnded, setCallEnded] = useState(false);
  const [finalCallDuration, setFinalCallDuration] = useState("");
  const [pendingChanges, setPendingChanges] = useState({});
  const [completedItems, setCompletedItems] = useState(new Set());
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showHomeScreen, setShowHomeScreen] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [transcriptCollapsed, setTranscriptCollapsed] = useState(true);

  // Check API health and load users
  useEffect(() => {
    console.log("🚀 Initializing app...");

    const initializeApp = async () => {
      console.log("🔍 Checking API health...");
      try {
        await ApiService.checkHealth();
        console.log("✅ API health check succeeded");
        setApiHealthy(true);
      } catch (error) {
        console.warn(
          "⚠️ API health check failed (continuing in degraded mode):",
          error
        );
        setApiHealthy(false);
      }
      try {
        const uData = await ApiService.getUserByName("Markus");
        console.log("👤 Fetched user data:", uData);

        if (uData) {
          // Here I prepare them for every scenario
          const data = {
            user_id: uData.user_id,
            email: uData.email,
            phone_number: uData.phone_number,
            postal_address: uData.postal_address,
            first_name: uData.first_name,
            last_name: uData.last_name,
            nationality: uData.nationality,
            birth_date: uData.birth_date,
            birth_place: uData.birth_place,
            metadata: uData.metadata,
            profile_facts: uData.profile_facts,
            tax_id: uData.tax_id,
          };

          setUserData(data);
          setIsLoadingInsights(false); // Stop loading animation

          // Update clientInsights with real data from userData
          const extractedInsights = extractClientInsights(data);
          setClientInsights(extractedInsights);

          console.log(
            "👤 Loaded user data for",
            data.first_name,
            data.last_name
          );
          console.log(data);
          return;
        }
      } catch (err) {
        console.warn("⚠️ endpoint failed, trying general users endpoint:", err);
        setIsLoadingInsights(false); // Stop loading animation on error
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    console.log("📜 Starting transcript simulation...");
    let currentSegment = 0;
    const timer = setInterval(() => {
      if (currentSegment < transcriptSegments.length) {
        setLiveTranscript((prev) => {
          const newTranscript =
            prev + (prev ? "\n\n" : "") + transcriptSegments[currentSegment];
          return newTranscript;
        });

        // Simulate real-time insight updates and action item generation
        if (currentSegment === 3) {
          setNewActionItems((prev) => [...prev, systemGeneratedItems[0]]);
        }
        if (currentSegment === 5) {
          // ⚠️ COMMENTIAMO QUESTO PER NON SOVRASCRIVERE I DATI API
          // setClientInsights(prev => ({ ...prev, email: 'm.rossi1980@email.it' }))
          setNewInsightUpdates((prev) => ({ ...prev, email: true }));
          setPendingChanges((prev) => ({
            ...prev,
            email: "m.rossi1980@email.it",
          }));
          setNewActionItems((prev) => [
            ...prev,
            systemGeneratedItems[3],
            systemGeneratedItems[4],
          ]);
        }
        if (currentSegment === 7) {
          // ⚠️ COMMENTIAMO QUESTO PER NON SOVRASCRIVERE I DATI API
          // setClientInsights(prev => ({
          //   ...prev,
          //   preferredMeetingTime: 'August afternoons preferred'
          // }))
          setNewInsightUpdates((prev) => ({
            ...prev,
            preferredMeetingTime: true,
          }));
          setPendingChanges((prev) => ({
            ...prev,
            preferredMeetingTime: "August afternoons preferred",
          }));
          setNewActionItems((prev) => [...prev, systemGeneratedItems[1]]);
        }
        if (currentSegment === 11) {
          // ⚠️ COMMENTIAMO QUESTO PER NON SOVRASCRIVERE I DATI API
          // setClientInsights(prev => ({ ...prev, creditCardLimit: 'Current + 5,000 EUR (August)' }))
          setNewInsightUpdates((prev) => ({ ...prev, creditCardLimit: true }));
          setPendingChanges((prev) => ({
            ...prev,
            creditCardLimit: "Current + 5,000 EUR (August)",
          }));
          setNewActionItems((prev) => [...prev, systemGeneratedItems[2]]);
        }
        if (currentSegment === 12) {
          setCompletedItems((prev) => new Set([...prev, "sys-1"]));
        }

        currentSegment++;
      } else {
        const formatTime = (seconds) => {
          const mins = Math.floor(seconds / 60);
          const secs = seconds % 60;
          return `${mins.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`;
        };

        setFinalCallDuration(
          formatTime(Math.floor((Date.now() - callStartTime.getTime()) / 1000))
        );
        setTimeout(() => {
          setCallEnded(true);
        }, 2000);
        clearInterval(timer);
      }
    }, 3000);

    const durationTimer = setInterval(() => {
      setCallDuration(
        Math.floor((Date.now() - callStartTime.getTime()) / 1000)
      );
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(durationTimer);
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleApproveChange = (key) => {
    setPendingChanges((prev) => {
      const newPending = { ...prev };
      delete newPending[key];
      return newPending;
    });
    setNewInsightUpdates((prev) => ({ ...prev, [key]: false }));
  };

  const handleRejectChange = (key) => {
    setPendingChanges((prev) => {
      const newPending = { ...prev };
      delete newPending[key];
      return newPending;
    });
    setNewInsightUpdates((prev) => ({ ...prev, [key]: false }));

    // Extract original values from userData directly
    const getOriginalValues = () => {
      // Find specific facts by key
      const accountFact = userData.profile_facts.find(
        (f) => f.fact_key === "account"
      );
      const investFact = userData.profile_facts.find(
        (f) => f.fact_key === "invest"
      );
      const meetingTimeFact = userData.profile_facts.find(
        (f) => f.fact_key === "pref.meeting_time"
      );

      const originalValues = {
        email: userData.email,
        address: userData.postal_address,
        creditCardLimit: accountFact?.fact_value?.credit_card_limit
          ? `${accountFact.fact_value.credit_card_limit} CHF`
          : "1,000 CHF",
        investmentInterest: investFact?.fact_value?.goals
          ? investFact.fact_value.goals.join(", ")
          : "Tax optimization",
        preferredMeetingTime: meetingTimeFact?.fact_value || "August",
      };

      return originalValues;
    };

    const originalValues = getOriginalValues();

    if (originalValues[key]) {
      setClientInsights((prev) => ({ ...prev, [key]: originalValues[key] }));
    }
  };

  const handleToggleComplete = (itemId) => {
    setCompletedItems((prev) => {
      const newCompleted = new Set(prev);
      if (newCompleted.has(itemId)) {
        newCompleted.delete(itemId);
      } else {
        newCompleted.add(itemId);
      }
      return newCompleted;
    });
  };

  const handleDeleteItem = (itemId) => {
    setNewActionItems((prev) => prev.filter((item) => item.id !== itemId));
    setActionItems((prev) => prev.filter((item) => item.id !== itemId));
    setCompletedItems((prev) => {
      const newCompleted = new Set(prev);
      newCompleted.delete(itemId);
      return newCompleted;
    });
  };

  const allActionItems = [...actionItems, ...newActionItems];
  const completedCount = allActionItems.filter((item) =>
    completedItems.has(item.id)
  ).length;
  const pendingCount = allActionItems.length - completedCount;

  if (showHomeScreen) {
    return (
      <SuccessScreen
        completedCount={completedCount}
        pendingCount={pendingCount}
        onReturn={() => setShowHomeScreen(false)}
      />
    );
  }

  return (
    <div
      style={{
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        backgroundColor: "#f0f2f5",
        minHeight: "100vh",
        color: "#212529",
      }}
    >
      <Header
        callEnded={callEnded}
        callDuration={callDuration}
        finalCallDuration={finalCallDuration}
        formatTime={formatTime}
      />

      {/* API Status and User Selection */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #dee2e6",
          padding: "8px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* API Status */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor:
                  apiHealthy === null
                    ? "#6c757d"
                    : apiHealthy
                    ? "#28a745"
                    : "#dc3545",
              }}
            />
            <span style={{ color: "#6c757d" }}>
              {apiHealthy === null
                ? "Checking API..."
                : apiHealthy
                ? "API Connected"
                : "API Offline"}
            </span>
          </div>

          {/* User Display */}
          {userData && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#495057", fontWeight: "500" }}>
                {userData.first_name} {userData.last_name}
              </span>
            </div>
          )}
        </div>
      </div>

      <ClientInfoStrip
        callEnded={callEnded}
        finalCallDuration={finalCallDuration}
        completedCount={completedCount}
        pendingCount={pendingCount}
        onFinalizeSubmit={() => setShowConfirmDialog(true)}
        userData={userData}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "16px",
          padding: "16px 24px",
          height: "calc(100vh - 160px)",
        }}
      >
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
          onToggleTranscript={() =>
            setTranscriptCollapsed(!transcriptCollapsed)
          }
        />
      </div>

      {showConfirmDialog && (
        <ConfirmDialog
          completedCount={completedCount}
          pendingCount={pendingCount}
          pendingChanges={pendingChanges}
          onConfirm={() => {
            setShowConfirmDialog(false);
            setShowHomeScreen(true);
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
  );
}

export default App;
