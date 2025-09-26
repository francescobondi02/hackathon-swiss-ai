-- =============================================================================
-- schema.sql - Banking App Data Model
-- PostgreSQL 15+
-- =============================================================================

-- ----------------------------
-- Extensions
-- ----------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

-- =============================================================================
-- 1) USERS (identità applicativa) + DATI STATICI (anagrafica immutabile)
-- =============================================================================

-- Identità applicativa (login/identificatori tecnici)
CREATE TABLE IF NOT EXISTS users (
  user_id    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email      CITEXT NOT NULL,
  postal_address TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata   JSONB
);

-- email univoca, case-insensitive
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx ON users (email);

-- Dati anagrafici statici (immutabili)
CREATE TABLE IF NOT EXISTS user_static (
  user_id     UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  birth_date  DATE NOT NULL,
  birth_place TEXT NOT NULL,
  nationality TEXT,
  tax_id      TEXT,  -- es. codice fiscale / TIN
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger: impedisce UPDATE/DELETE su user_static (immutabilità)
CREATE OR REPLACE FUNCTION forbid_update_delete_user_static()
RETURNS trigger AS $$
BEGIN
  IF TG_OP IN ('UPDATE','DELETE') THEN
    RAISE EXCEPTION 'user_static is immutable (no % allowed)', TG_OP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_forbid_update_delete_user_static ON user_static;
CREATE TRIGGER trg_forbid_update_delete_user_static
  BEFORE UPDATE OR DELETE ON user_static
  FOR EACH ROW EXECUTE FUNCTION forbid_update_delete_user_static();

-- =============================================================================
-- 2) CALLS (chiamate) + TRANSCRIPT testuale (immutabile) + PAYLOAD grezzo (immutabile)
-- =============================================================================

CREATE TABLE IF NOT EXISTS calls (
  call_id    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  -- temporali
  started_at TIMESTAMPTZ,
  ended_at   TIMESTAMPTZ,
  -- metadati
  language   TEXT,
  channel    TEXT,     -- phone/chat/branch/video/email
  direction  TEXT,     -- inbound/outbound
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- durata generata (in secondi)
  duration_seconds INTEGER
    GENERATED ALWAYS AS (
      CASE
        WHEN started_at IS NOT NULL AND ended_at IS NOT NULL
        THEN EXTRACT(EPOCH FROM (ended_at - started_at))::int
        ELSE NULL
      END
    ) STORED
);

-- Indici utili
CREATE INDEX IF NOT EXISTS calls_user_idx ON calls(user_id);
CREATE INDEX IF NOT EXISTS calls_started_at_idx ON calls(started_at);
CREATE INDEX IF NOT EXISTS calls_user_started_idx ON calls (user_id, started_at DESC);

-- Controlli leggeri su valori ammessi
ALTER TABLE calls
  ADD CONSTRAINT calls_channel_chk
  CHECK (channel IS NULL OR channel IN ('phone','chat','branch','video','email'));
ALTER TABLE calls
  ADD CONSTRAINT calls_direction_chk
  CHECK (direction IS NULL OR direction IN ('inbound','outbound'));

-- Transcript testuale IMMUTABILE (1:1 con call)
CREATE TABLE IF NOT EXISTS call_transcripts (
  call_id         UUID PRIMARY KEY REFERENCES calls(call_id) ON DELETE CASCADE,
  transcript_text TEXT NOT NULL,
  sha256          TEXT NOT NULL,
  stored_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Full-text search
  text_fts tsvector GENERATED ALWAYS AS (
    to_tsvector('simple', coalesce(transcript_text, ''))
  ) STORED
);

CREATE INDEX IF NOT EXISTS call_transcripts_fts_idx
  ON call_transcripts USING GIN (text_fts);

-- Trigger: transcript immutabile
CREATE OR REPLACE FUNCTION forbid_update_delete_transcript()
RETURNS trigger AS $$
BEGIN
  IF TG_OP IN ('UPDATE','DELETE') THEN
    RAISE EXCEPTION 'call_transcripts is immutable (no % allowed)', TG_OP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_forbid_update_delete_transcript ON call_transcripts;
CREATE TRIGGER trg_forbid_update_delete_transcript
  BEFORE UPDATE OR DELETE ON call_transcripts
  FOR EACH ROW EXECUTE FUNCTION forbid_update_delete_transcript();

-- Payload grezzo IMMUTABILE (1:1 con call)
CREATE TABLE IF NOT EXISTS call_payloads (
  call_id   UUID PRIMARY KEY REFERENCES calls(call_id) ON DELETE CASCADE,
  payload   JSONB NOT NULL,
  stored_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- JSONB path ops per ricerche rapide
CREATE INDEX IF NOT EXISTS call_payloads_gin
  ON call_payloads USING GIN (payload jsonb_path_ops);

-- Trigger: payload immutabile
CREATE OR REPLACE FUNCTION forbid_update_delete_payload()
RETURNS trigger AS $$
BEGIN
  IF TG_OP IN ('UPDATE','DELETE') THEN
    RAISE EXCEPTION 'call_payloads is immutable (no % allowed)', TG_OP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_forbid_update_delete_payload ON call_payloads;
CREATE TRIGGER trg_forbid_update_delete_payload
  BEFORE UPDATE OR DELETE ON call_payloads
  FOR EACH ROW EXECUTE FUNCTION forbid_update_delete_payload();

-- =============================================================================
-- 3) USER FACTS (event sourcing) + STATO CORRENTE
-- =============================================================================

-- Eventi di "fatti" osservati (preferenze, consensi, attributi variabili)
CREATE TABLE IF NOT EXISTS user_fact_events (
  event_id     BIGSERIAL PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  call_id      UUID REFERENCES calls(call_id) ON DELETE SET NULL,
  observed_at  TIMESTAMPTZ NOT NULL,   -- quando il fatto è stato osservato
  fact_key     TEXT NOT NULL,          -- es: "pref.contact_channel", "pref.call_time_window", "kyc.employment_status"
  fact_value   JSONB,                  -- valore arbitrario (potenzialmente complesso)
  confidence   REAL,                   -- score modello/estrazione (opz.)
  source_path  TEXT,                   -- JSONPath o riferimento nel payload
  UNIQUE(user_id, fact_key, observed_at, source_path)
);

-- Indici di supporto
CREATE INDEX IF NOT EXISTS user_fact_events_user_key_time_idx
  ON user_fact_events (user_id, fact_key, observed_at DESC);

CREATE INDEX IF NOT EXISTS user_fact_events_val_gin
  ON user_fact_events USING GIN (fact_value);

-- Stato corrente "denormalizzato": ultimo valore per (user_id, fact_key)
CREATE TABLE IF NOT EXISTS user_profile_current (
  user_id          UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  fact_key         TEXT NOT NULL,
  fact_value       JSONB,
  last_observed_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (user_id, fact_key)
);

CREATE INDEX IF NOT EXISTS user_profile_current_user_idx ON user_profile_current(user_id);
CREATE INDEX IF NOT EXISTS user_profile_current_fact_idx ON user_profile_current(fact_key);

-- Helper per upsert nello stato corrente
CREATE OR REPLACE FUNCTION upsert_user_profile_current(
  p_user_id UUID,
  p_fact_key TEXT,
  p_fact_value JSONB,
  p_observed_at TIMESTAMPTZ
) RETURNS VOID AS $$
BEGIN
  INSERT INTO user_profile_current (user_id, fact_key, fact_value, last_observed_at)
  VALUES (p_user_id, p_fact_key, p_fact_value, p_observed_at)
  ON CONFLICT (user_id, fact_key)
  DO UPDATE
  SET fact_value = EXCLUDED.fact_value,
      last_observed_at = GREATEST(user_profile_current.last_observed_at, EXCLUDED.last_observed_at);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 4) VISTE DI COMODO
-- =============================================================================

-- Vista profilo: anagrafica + preferenze principali se presenti
CREATE OR REPLACE VIEW v_user_profile AS
SELECT
  u.user_id,
  us.first_name,
  us.last_name,
  us.birth_date,
  us.birth_place,
  us.nationality,
  u.email,
  -- preferenze (dal current state)
  (SELECT c.fact_value #>> '{}'
     FROM user_profile_current c
     WHERE c.user_id = u.user_id AND c.fact_key = 'pref.contact_channel')   AS pref_contact_channel,
  (SELECT c.fact_value::text
     FROM user_profile_current c
     WHERE c.user_id = u.user_id AND c.fact_key = 'pref.call_time_window')  AS pref_call_time_window,
  (SELECT c.fact_value #>> '{}'
     FROM user_profile_current c
     WHERE c.user_id = u.user_id AND c.fact_key = 'pref.language')          AS pref_language
FROM users u
LEFT JOIN user_static us USING (user_id);

-- Vista: ultime chiamate per utente con durata (per PG < 16 usare CTE + rank)
CREATE OR REPLACE VIEW v_user_last_calls AS
SELECT *
FROM (
  SELECT
    c.user_id,
    c.call_id,
    c.started_at,
    c.ended_at,
    c.duration_seconds,
    c.channel,
    c.direction,
    ROW_NUMBER() OVER (PARTITION BY c.user_id ORDER BY c.started_at DESC) AS rn
  FROM calls c
  WHERE c.started_at IS NOT NULL
) s
WHERE s.rn <= 10;

-- =============================================================================
-- 5) NOTE
-- - Le chiavi di preferenza sono libere; convenzione suggerita: 'pref.*'
--   es: 'pref.contact_channel' ('"phone"'), 'pref.call_time_window' ('{"start":"09:00","end":"12:00"}'), 'pref.language' ('"de"').
-- - Transcript/payload sono immutabili: correzioni tramite nuove righe (nuove call) o tabelle di rettifica ad hoc.
-- - Per popolare user_profile_current dagli eventi, usare la funzione upsert
--   durante l’ingest o un job periodico.
-- =============================================================================