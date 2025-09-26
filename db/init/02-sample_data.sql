DO $do$
DECLARE
  v_user_giulia UUID;
  v_user_luca   UUID;

  v_call1 UUID;
  v_call2 UUID;

  v_txt1 TEXT;
  v_txt2 TEXT;
BEGIN
  -- Insert only clients (no advisors as users)
  INSERT INTO users (user_id, external_user_ref, display_name, email, metadata)
  VALUES
    (uuid_generate_v4(), 'client_001', 'Giulia Conti', 'giulia.conti@example.com',
      jsonb_build_object('segment','affluent','risk_profile','moderate',
                         'role','client','phone_number','+41 21 555 01 01','preferred_language','Italian')),
    (uuid_generate_v4(), 'client_002', 'Luca Bernasconi', 'luca.bernasconi@example.com',
      jsonb_build_object('segment','mass_market','risk_profile','growth',
                         'role','client','phone_number','+41 44 555 02 02','preferred_language','French'))
  ON CONFLICT (external_user_ref) DO NOTHING;

  SELECT user_id INTO v_user_giulia FROM users WHERE external_user_ref = 'client_001';
  SELECT user_id INTO v_user_luca   FROM users WHERE external_user_ref = 'client_002';

  -- ===== CALL 1: Giulia (advisor only referenced in payload) =====
  v_call1 := uuid_generate_v4();

  INSERT INTO calls (call_id, user_id, started_at, ended_at, language, channel)
  VALUES (
    v_call1,
    v_user_giulia,
    TIMESTAMPTZ '2024-06-03 08:45:00+00',
    TIMESTAMPTZ '2024-06-03 09:00:00+00',
    'it-CH',
    'phone'
  );

  v_txt1 := $txt1$DISCLAIMER: Synthetic conversation.

Giulia (client): Buongiorno, ho notato un addebito sconosciuto sulla mia carta e sono piuttosto preoccupata.
Sara (advisor): Tranquilla, Giulia. Confermiamo la tua identità e blocchiamo temporaneamente la carta mentre verifichiamo.
Giulia: La mia data di nascita è 12/02/1988 e vivo a Lugano.
Sara: Ho avviato il blocco e una carta sostitutiva è in lavorazione. Controllo anche gli ultimi movimenti.
Giulia: Vorrei attivare le notifiche in tempo reale.
Sara: Certo, le abilito e riceverai le istruzioni via email entro oggi.
$txt1$;

  INSERT INTO call_transcripts (call_id, transcript_text, sha256)
  VALUES (
    v_call1,
    v_txt1,
    encode(digest(convert_to(v_txt1,'UTF8'), 'sha256'), 'hex')
  );

  INSERT INTO call_payloads (call_id, payload)
  VALUES (
    v_call1,
    jsonb_build_object(
      'conversation_metadata', jsonb_build_object(
        'conversation_id','call_fraud_001',
        'language','Italian',
        'participants', jsonb_build_object(
          'client','Giulia Conti',
          'advisor','Sara Keller'
        )
      ),
      'client_requests', jsonb_build_array(
        jsonb_build_object(
          'topic','card',
          'description','Unknown card charge, requests immediate block and push notifications',
          'urgency','high'
        )
      ),
      'advisor_responses', jsonb_build_array(
        jsonb_build_object(
          'proposed_solution','Block card, issue replacement, enable notifications, send email guide',
          'timeline','same day'
        )
      ),
      'action_items', jsonb_build_array(
        jsonb_build_object(
          'responsible_party','advisor',
          'task','Send email with notification instructions',
          'status','in_progress'
        )
      ),
      'client_sentiment', jsonb_build_object(
        'expressed_emotions', jsonb_build_array('concerned','relieved'),
        'confidence_level','increasing'
      )
    )
  );

  -- ===== CALL 2: Luca (advisor only referenced in payload) =====
  v_call2 := uuid_generate_v4();

  INSERT INTO calls (call_id, user_id, started_at, ended_at, language, channel)
  VALUES (
    v_call2,
    v_user_luca,
    TIMESTAMPTZ '2024-06-04 14:10:00+00',
    TIMESTAMPTZ '2024-06-04 14:40:00+00',
    'fr-CH',
    'phone'
  );

  v_txt2 := $txt2$DISCLAIMER: Synthetic conversation.

Luca (client): Bonjour Marc, je voudrais revoir mon portefeuille. Les marchés ont beaucoup bougé.
Marc (advisor): Bien sûr Luca, regardons ensemble. Votre exposition actions est passée à 72 %, au-dessus de l'objectif.
Luca: Je voudrais réduire un peu le risque, peut-être ajouter des obligations durables.
Marc: Très bonne idée. Je prépare une proposition pour rééquilibrer 10 % vers des obligations ESG suisses.
Luca: Parfait, envoyez-moi les détails ce soir si possible.
Marc: Vous les recevrez d'ici la fin de journée avec un résumé via e-banking.
$txt2$;

  INSERT INTO call_transcripts (call_id, transcript_text, sha256)
  VALUES (
    v_call2,
    v_txt2,
    encode(digest(convert_to(v_txt2,'UTF8'), 'sha256'), 'hex')
  );

  INSERT INTO call_payloads (call_id, payload)
  VALUES (
    v_call2,
    jsonb_build_object(
      'conversation_metadata', jsonb_build_object(
        'conversation_id','call_invest_001',
        'language','French',
        'participants', jsonb_build_object(
          'client','Luca Bernasconi',
          'advisor','Marc Dubois'
        )
      ),
      'client_requests', jsonb_build_array(
        jsonb_build_object(
          'topic','investment',
          'description','Adjust portfolio to reduce risk and add ESG bonds',
          'urgency','medium'
        )
      ),
      'advisor_responses', jsonb_build_array(
        jsonb_build_object(
          'proposed_solution','Rebalance 10% to Swiss ESG bonds and send detailed proposal',
          'timeline','end of day'
        )
      ),
      'action_items', jsonb_build_array(
        jsonb_build_object(
          'responsible_party','advisor',
          'task','Send reallocation proposal',
          'status','pending'
        )
      ),
      'client_sentiment', jsonb_build_object(
        'expressed_emotions', jsonb_build_array('vigilant','confident'),
        'confidence_level','stable'
      )
    )
  );

END;
$do$;