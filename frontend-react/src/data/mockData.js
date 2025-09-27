// Mock data for the live call dashboard

export const transcriptSegments = [
  "[14:30] Client: Good morning!",
  "[14:30] Agent: Good morning, this is Anna from UBS. May I have your name and date of birth for verification?",
  "[14:30] Client: Marco Rossi, born March 15th, 1980.",
  "[14:30] Agent: Thank you, Mr. Rossi. I have you verified. How can I help you today?",
  "[14:31] Client: I'd like to proceed with the investment discussion we had.",
  "[14:31] Agent: Excellent. I'll prepare the investment mandate for you.",
  "[14:32] Client: Perfect. When can we meet to discuss this in detail?",
  "[14:32] Agent: How does August work for you? Afternoon would be ideal.",
  "[14:33] Client: August afternoons work perfectly. Also, I need to increase my credit card limit for travel.",
  "[14:33] Agent: I can help with that. What amount did you have in mind?",
  "[14:34] Client: An additional 5,000 euros for August should be sufficient.",
  "[14:34] Agent: Understood. I'll process that request. Anything else I can help with?",
  "[14:35] Client: That covers everything. Thank you for your efficiency, Anna.",
];

export const systemGeneratedItems = [
  {
    id: "sys-1",
    priority: "High",
    text: "Send PDF mandate for financial investments via email",
    suggestion: "Prepare and send to new email: m.rossi1980@email.it",
    source: "Live Call",
    timestamp: "14:32",
  },
  {
    id: "sys-2",
    priority: "High",
    text: "Schedule investment consultation meeting for August",
    suggestion: "Check calendar for afternoon slots in August.",
    source: "Live Call",
    timestamp: "14:34",
  },
  {
    id: "sys-3",
    priority: "High",
    text: "Process temporary credit card limit increase",
    suggestion: "Additional 5,000 EUR for August travel period.",
    source: "Live Call",
    timestamp: "14:35",
  },
  {
    id: "sys-4",
    priority: "Medium",
    text: "Update email address in system",
    suggestion: "Change from marco.rossi@email.it to m.rossi1980@email.it",
    source: "Live Call",
    timestamp: "14:32",
  },
  {
    id: "sys-5",
    priority: "Low",
    text: "Wait for new home address details via email",
    suggestion: "Client will send updated address information in writing.",
    source: "Live Call",
    timestamp: "14:33",
  },
];
