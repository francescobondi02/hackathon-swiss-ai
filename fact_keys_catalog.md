# Fact Keys Catalog — Dynamic User Knowledge

This catalog lists all **fact_keys** you can extract from the conversation JSON template to update the **dynamic knowledge** of users.  
Each item includes: **Type**, **Typical Source (JSON path)**, **Example Value**, and a short note on **What it implies** for your app logic.

---

## 1) Preferences & Contacts

- **pref.language**

  - Type: string
  - Source: `$.conversation_metadata.language`
  - Example: `"German"`
  - Implies: UI/communications language preference.

- **pref.contact_channel**

  - Type: enum(`email|phone|postal`)
  - Source: `$.interaction_context.contact_preferences.preferred_channel`
  - Example: `"email"`
  - Implies: Primary channel for outreach & notifications.

- **contact**
  — Type: object
  — Source: `$.interaction_context.contact_preferences`
  — Example:

  ```json
  {
    "email": "client@example.com",
    "phone": "+41 79 123 45 67"
  }
  ```

- **identity.address**

  - Type: string
  - Source: `$.authentication.identity_verification.address`
  - Example: `"Bahnhofstrasse 1, Zürich"`
  - Implies: Latest known postal address (soft signal; verify before KYC updates).

- **identity.other_details**
  - Type: string|object
  - Source: `$.authentication.identity_verification.other_details`
  - Example: `"ID CH1234567"`
  - Implies: Extra ID/employment info useful for KYC context.

---

## 2) Meetings & Follow-up

- **meeting**

  - Type: object
  - Source: `$.interaction_context.meeting_arrangements`
  - Example: `{"follow_up_required":true,"next_meeting":{"date":"2025-09-17","time":"10:00","type":"video","purpose":"tailored financial advice"}}`
  - Implies: .

---

## 3) Client Requests

(For each `client_requests[i]`, create entries.)

- **request**

  - Type: object
  - Source: `$.client_requests[i]`
  - Example: `{'topic':"digital_banking","description":"Login problems..","urgency":"medium|high","documents_provided":["screenshot.png"],"documents_requested":["document1.png"]}`
  - Implies: Structure for Requests

---

## 4) Advisor Responses & Support

(For each `advisor_responses[i]`, create entries.)

- **support.assurance**

  - Type: string|null
  - Source: `$.advisor_responses[i].assurance_or_explanation`
  - Example: `"Security check might be blocking access"`
  - Implies: Client reassurance messaging context.

- **support.proposed_solution**

  - Type: string
  - Source: `$.advisor_responses[i].proposed_solution`
  - Example: `"Created support ticket. Reference code: 123456."`
  - Implies: Action taken; next steps for tracking.

- **support.timeline**

  - Type: string|null
  - Source: `$.advisor_responses[i].timeline`
  - Example: `"2 business days"`
  - Implies: Expected resolution ETA; sets reminder windows.

---

## 5) Action Items

(For each `action_items[i]`, create entries.)

- **action.item**

  - Type: object
  - Source: `$.action_items[i]`
  - Example: `{"party":"client","task":"Prepare financial documents","deadline":"2025-09-17","status":"pending"}`
  - Implies: To‑do tracking per party (client/advisor/system).

---

## 6) Financial Information

- **account**
  — Type: object
  — Source: `$.financial_information.accounts`
  — Example:
  ```json
  {
    "balances": { "chf": 12500.75 },
    "overdraft_limit": 5000,
    "credit_card_limit": 10000,
    "recent_transactions": ["2025-09-10 Grocery CHF-85.40"],
    "real_estate": 85000,
    "liquid_assets": 7000
  }
  ```

---

## 7) Investment Preferences

- **invest**
  — Type: object
  — Source: `$.financial_information.investment_preferences`
  — Example:
  ```json
  {
    "risk_profile": "moderate",
    "products_discussed": ["funds", "pillar 3a"],
    "goals": ["retirement", "tax_optimization"]
  }
  ```

---

## 8) Sentiment & Feedback

- **sentiment**
  — Type: object
  — Source: `$.client_sentiment`
  — Example:

  ```json
  {
    "emotions": ["concerned", "relieved"],
    "confidence": "medium",
    "trust": "stable"
  }
  ```

- **feedback**
  — Type: object
  — Source: `$.feedback_and_suggestions`
  — Example:
  ```json
  {
    "client_feedback": "positive",
    "suggestions": ["mobile app dark mode"]
  }
  ```

---

## 9) KYC & Security

- **kyc**
  — Type: object
  — Source: `$.compliance_and_regulatory.kyc_updates`
  — Example:

  ```json
  {
    "employment_status": "Engineer @ TechCo",
    "source_of_funds": "salary",
    "total_assets_reported": "CHF 500k",
    "purpose_of_relationship": "investment"
  }
  ```

- **security**
  — Type: object
  — Source: `$.compliance_and_regulatory.security_concerns`
  — Example:
  ```json
  {
    "fraud_suspicions": true,
    "measures_discussed": ["2fa", "alerts", "card_block"]
  }
  ```

---

## 10) Conversation Metadata (optional facts)

- **conversation.id**

  - Type: string
  - Source: `$.conversation_metadata.conversation_id`
  - Example: `"call_001.json"`
  - Implies: Cross-reference between systems.

- **conversation.date**

  - Type: string (YYYY‑MM‑DD / ISO)
  - Source: `$.conversation_metadata.date`
  - Example: `"2025-09-17"`
  - Implies: Temporal context for facts.

- **conversation.duration**

  - Type: string (`hh:mm:ss`)
  - Source: `$.conversation_metadata.duration`
  - Example: `"00:12:45"`
  - Implies: Workload and complexity proxy.

- **conversation.advisor**

  - Type: string
  - Source: `$.conversation_metadata.participants.advisor`
  - Example: `"NAME2"`
  - Implies: Advisor attribution/performance.

- **conversation.client_name**
  - Type: string
  - Source: `$.conversation_metadata.participants.client`
  - Example: `"Mario Rossi"`
  - Implies: Display/merge aid (not authoritative identity).
