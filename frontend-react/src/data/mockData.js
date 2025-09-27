// Mock data for the live call dashboard

export const transcriptSegments = [
    "[14:30] Agent (Anna Bianchi): Good morning, Mr. Rossi, this is Anna Bianchi from UBS. How are you today?",
    "[14:30] Client (Marco Rossi): Good morning, Anna. All is well, thank you. A bit busy, but I'm glad you called.",
    "[14:31] Agent (Anna Bianchi): I'm happy to hear that. I'm calling to check in, as discussed, and to see if there is anything I can help you with. I remember you mentioned wanting to review your portfolio.",
    "[14:31] Client (Marco Rossi): Yes, exactly. I've been thinking about our last discussion on financial investments, and I'd like to proceed. Could you send me the necessary paperwork to sign? A PDF via email would be perfect.",
    "[14:32] Agent (Anna Bianchi): Of course, Mr. Rossi. I will prepare the mandate for financial investments and send it to you by the end of the day. Is your email address still marco.rossi@email.it?",
    "[14:32] Client (Marco Rossi): Actually, I have a new address. It's m.rossi1980@email.it. Please update your records. My home address has also changed, I'll send you the details via email so you have it in writing.",
    "[14:33] Agent (Anna Bianchi): Thank you for the update, I've noted the new email address and will wait for your communication regarding the new home address. Regarding our meeting to discuss the investment decision in more detail, when would be a good time for you?",
    "[14:33] Client (Marco Rossi): August is looking to be a calmer month for me. A meeting in the afternoon would be ideal, if possible.",
    "[14:34] Agent (Anna Bianchi): Excellent, I will check my calendar for August and send you a few options for an afternoon meeting. Was there anything else I could assist you with today?",
    "[14:34] Client (Marco Rossi): Yes, one more thing. I'm planning a trip abroad and I was hoping to increase the limit on my credit card for the duration of the trip. Is that something you can help me with?",
    "[14:35] Agent (Anna Bianchi): I can certainly initiate that request for you. I will have the relevant department get in touch with you to finalize the details. Is there a specific amount you had in mind?",
    "[14:35] Client (Marco Rossi): I think an additional 5,000 euros for the month of August should be sufficient.",
    "[14:36] Agent (Anna Bianchi): Understood. I will add this to my follow-up tasks. So, to summarize: I will email you the PDF mandate for the financial investments, we will schedule a meeting in August to discuss the investment decision, and I will start the process for the temporary increase of your credit card limit.",
    "[14:36] Client (Marco Rossi): That's perfect, Anna. Thank you for your efficiency.",
    "[14:37] Agent (Anna Bianchi): It's my pleasure, Mr. Rossi. Have a great day."
  ]
  
  export const systemGeneratedItems = [
    {
      id: 'sys-1',
      priority: 'High',
      text: 'Send PDF mandate for financial investments via email',
      suggestion: 'Prepare and send to new email: m.rossi1980@email.it',
      source: 'Live Call',
      timestamp: '14:32'
    },
    {
      id: 'sys-2', 
      priority: 'High',
      text: 'Schedule investment consultation meeting for August',
      suggestion: 'Check calendar for afternoon slots in August.',
      source: 'Live Call',
      timestamp: '14:34'
    },
    {
      id: 'sys-3',
      priority: 'High', 
      text: 'Process temporary credit card limit increase',
      suggestion: 'Additional 5,000 EUR for August travel period.',
      source: 'Live Call',
      timestamp: '14:35'
    },
    {
      id: 'sys-4',
      priority: 'Medium',
      text: 'Update email address in system',
      suggestion: 'Change from marco.rossi@email.it to m.rossi1980@email.it',
      source: 'Live Call',
      timestamp: '14:32'
    },
    {
      id: 'sys-5',
      priority: 'Low',
      text: 'Wait for new home address details via email',
      suggestion: 'Client will send updated address information in writing.',
      source: 'Live Call',
      timestamp: '14:33'
    }
  ]