import json
import hashlib
from datetime import datetime, timezone
from dateutil import parser as dtparser
import psycopg2
import psycopg2.extras as extras
import sys
import os

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_NAME = os.getenv("DB_NAME", "hackathon_db")
DB_USER = os.getenv("DB_USER", "hackathon_user")
DB_PASS = os.getenv("DB_PASS", "hackathon_pass")

PLACEHOLDERS = {"adresse", "drachen", "n/a", "unknown", "null", "redacted"}


def is_placeholder(val: str) -> bool:
    if val is None:
        return False
    t = str(val).strip().lower()
    return t in PLACEHOLDERS


def parse_bool(val):
    if val is None:
        return None
    s = str(val).strip().lower()
    if s in ("true", "yes", "y", "1"):
        return True
    if s in ("false", "no", "n", "0"):
        return False
    return None


def parse_date(val):
    if not val or is_placeholder(val):
        return None
    try:
        # supporta "YYYY-MM-DD" o ISO-like
        d = dtparser.parse(val).date()
        # conserviamo come stringa ISO YYYY-MM-DD in JSON
        return d.isoformat()
    except Exception:
        return None


def min_future_datetime(datetimes_iso):
    """Ritorna la prima data futura (UTC). Input: iterable di date/time (str o None)."""
    now = datetime.now(timezone.utc)
    candidates = []
    for s in datetimes_iso:
        if not s:
            continue
        try:
            # se è solo data, considerala mezzanotte UTC
            if len(s) == 10 and s[4] == "-" and s[7] == "-":
                dt = datetime.fromisoformat(s)  # date -> 00:00, naive
                dt = dt.replace(tzinfo=timezone.utc)
            else:
                dt = dtparser.parse(s)
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                else:
                    dt = dt.astimezone(timezone.utc)
            if dt >= now:
                candidates.append(dt)
        except Exception:
            pass
    return min(candidates).isoformat() if candidates else None


def json_sha256(obj) -> str:
    # testo JSON stabile (sort keys) per hashing
    raw = json.dumps(obj, sort_keys=True, ensure_ascii=False).encode("utf-8")
    return hashlib.sha256(raw).hexdigest()


def get(d, *path, default=None):
    cur = d
    for p in path:
        if not isinstance(cur, dict) or p not in cur:
            return default
        cur = cur[p]
    return cur


def connect():
    return psycopg2.connect(
        host=DB_HOST, port=DB_PORT, dbname=DB_NAME, user=DB_USER, password=DB_PASS
    )


def ensure_user(cur, email: str):
    # cerca utente esistente per email
    cur.execute("SELECT user_id FROM users WHERE email = %s", (email,))
    result = cur.fetchone()
    if result:
        return result[0]

    # crea nuovo utente se non esiste
    cur.execute(
        """
        INSERT INTO users (email, metadata)
        VALUES (%s, %s)
        RETURNING user_id
        """,
        (email, json.dumps({})),
    )
    return cur.fetchone()[0]


def create_call(cur, user_id, lang, channel):
    cur.execute(
        """
        INSERT INTO calls (user_id, language, channel, created_at)
        VALUES (%s, %s, %s, now())
        RETURNING call_id
        """,
        (user_id, lang, channel),
    )
    return cur.fetchone()[0]


def save_payload(cur, call_id, payload):
    cur.execute(
        """
        INSERT INTO call_payloads (call_id, payload)
        VALUES (%s, %s)
        ON CONFLICT (call_id) DO NOTHING
        """,
        (call_id, json.dumps(payload)),
    )


def insert_event(
    cur,
    user_id,
    call_id,
    observed_at,
    fact_key,
    fact_value,
    source_path,
    confidence=None,
):
    # observed_at: ISO or None -> usa NOW se non fornito
    if observed_at:
        try:
            obs = dtparser.parse(observed_at)
            if obs.tzinfo is None:
                obs = obs.replace(tzinfo=timezone.utc)
        except Exception:
            obs = datetime.now(timezone.utc)
    else:
        obs = datetime.now(timezone.utc)

    # idempotenza: unico su (user_id, fact_key, observed_at, source_path)
    cur.execute(
        """
        INSERT INTO user_fact_events (user_id, call_id, observed_at, fact_key, fact_value, confidence, source_path)
        VALUES (%s, %s, %s, %s, %s::jsonb, %s, %s)
        ON CONFLICT (user_id, fact_key, observed_at, source_path) DO NOTHING
        """,
        (
            user_id,
            call_id,
            obs,
            fact_key,
            json.dumps(fact_value),
            confidence,
            source_path,
        ),
    )

    # upsert current (ultimo valore vince)
    cur.execute(
        """
        INSERT INTO user_profile_current (user_id, fact_key, fact_value, last_observed_at)
        VALUES (%s, %s, %s::jsonb, %s)
        ON CONFLICT (user_id, fact_key)
        DO UPDATE SET
          fact_value = EXCLUDED.fact_value,
          last_observed_at = GREATEST(user_profile_current.last_observed_at, EXCLUDED.last_observed_at)
        """,
        (user_id, fact_key, json.dumps(fact_value), obs),
    )


def extract_and_store_facts(cur, user_id, call_id, payload):
    # 1) lingua e canale preferito
    lang = get(payload, "conversation_metadata", "language")
    if lang and not is_placeholder(lang):
        insert_event(
            cur,
            user_id,
            call_id,
            None,
            "pref.language",
            lang,
            "$.conversation_metadata.language",
        )

    pref_channel = get(
        payload, "interaction_context", "contact_preferences", "preferred_channel"
    )
    if pref_channel and not is_placeholder(pref_channel):
        insert_event(
            cur,
            user_id,
            call_id,
            None,
            "pref.contact_channel",
            pref_channel,
            "$.interaction_context.contact_preferences.preferred_channel",
        )

    # 2) recapiti
    email = get(payload, "interaction_context", "contact_preferences", "email")
    if email and not is_placeholder(email):
        insert_event(
            cur,
            user_id,
            call_id,
            None,
            "contact.email",
            email,
            "$.interaction_context.contact_preferences.email",
        )

    phone = get(payload, "interaction_context", "contact_preferences", "phone_number")
    if phone and not is_placeholder(phone):
        insert_event(
            cur,
            user_id,
            call_id,
            None,
            "contact.phone",
            phone,
            "$.interaction_context.contact_preferences.phone_number",
        )

    # 3) identità (se non placeholder)
    address = get(payload, "authentication", "identity_verification", "address")
    if address and not is_placeholder(address):
        insert_event(
            cur,
            user_id,
            call_id,
            None,
            "identity.address",
            address,
            "$.authentication.identity_verification.address",
        )

    dob_raw = get(payload, "authentication", "identity_verification", "date_of_birth")
    dob = parse_date(dob_raw)
    if dob:
        insert_event(
            cur,
            user_id,
            call_id,
            None,
            "identity.dob",
            dob,
            "$.authentication.identity_verification.date_of_birth",
        )

    # 4) sicurezza
    fraud_raw = get(
        payload, "compliance_and_regulatory", "security_concerns", "fraud_suspicions"
    )
    fraud = parse_bool(fraud_raw)
    if fraud is not None:
        insert_event(
            cur,
            user_id,
            call_id,
            None,
            "security.fraud_suspicions",
            fraud,
            "$.compliance_and_regulatory.security_concerns.fraud_suspicions",
        )

    # 5) meeting programmati (eventi) + next_date (proiezione comoda)
    meetings = (
        get(
            payload, "interaction_context", "meeting_arrangements", "scheduled_meetings"
        )
        or []
    )
    future_dates = []
    if isinstance(meetings, list):
        for i, m in enumerate(meetings):
            if not isinstance(m, dict):
                continue
            date = m.get("date")
            time_ = m.get("time")
            # observed_at = data della riunione se esiste, altrimenti now
            observed_at = None
            if date:
                try:
                    # se c'è anche time, prova a combinarli
                    if time_:
                        observed_at = dtparser.parse(f"{date} {time_}").isoformat()
                    else:
                        observed_at = dtparser.parse(date).isoformat()
                except Exception:
                    observed_at = None

            insert_event(
                cur,
                user_id,
                call_id,
                observed_at,
                "meeting.scheduled",
                {
                    "date": date,
                    "time": time_,
                    "type": m.get("type"),
                    "purpose": m.get("purpose"),
                },
                f"$.interaction_context.meeting_arrangements.scheduled_meetings[{i}]",
            )
            # costruiamo ISO per next_date
            iso_dt = None
            if date and time_:
                try:
                    iso_dt = dtparser.parse(f"{date} {time_}").isoformat()
                except Exception:
                    pass
            elif date:
                iso_dt = date  # verrà interpretata come mezzanotte nel calcolo
            if iso_dt:
                future_dates.append(iso_dt)

    next_iso = min_future_datetime(future_dates)
    if next_iso:
        insert_event(
            cur,
            user_id,
            call_id,
            None,
            "meeting.next_date",
            next_iso,
            "$.interaction_context.meeting_arrangements.scheduled_meetings[*]",
        )

    # 6) suggerimenti/assistenza: prova a pescare ticket da advisor_responses
    # cerchiamo "Reference code: XYZ" nel campo proposed_solution
    import re

    responses = payload.get("advisor_responses") or []
    for i, r in enumerate(responses):
        ps = r.get("proposed_solution")
        if not ps:
            continue
        m = re.search(r"Reference code:\s*([A-Za-z0-9_-]+)", ps)
        if m:
            insert_event(
                cur,
                user_id,
                call_id,
                None,
                "support.login_ticket",
                m.group(1),
                f"$.advisor_responses[{i}].proposed_solution",
            )

    # 7) address update ETA (se timeline contiene 'business days', salviamo testo grezzo)
    for i, r in enumerate(responses):
        tl = r.get("timeline")
        if isinstance(tl, str) and "business days" in tl.lower():
            insert_event(
                cur,
                user_id,
                call_id,
                None,
                "ops.address_update_eta",
                tl,
                f"$.advisor_responses[{i}].timeline",
            )


def main():
    if len(sys.argv) < 3:
        print("Usage: python ingest_facts.py <user_email> <json_file_path>")
        sys.exit(1)

    user_email = sys.argv[1]
    json_path = sys.argv[2]

    with open(json_path, "r", encoding="utf-8") as f:
        payload = json.load(f)

    # valori comodi dal JSON
    lang = get(payload, "conversation_metadata", "language")
    channel = (
        get(payload, "interaction_context", "contact_preferences", "preferred_channel")
        or "phone"
    )

    conn = connect()
    try:
        with conn:
            with conn.cursor() as cur:
                user_id = ensure_user(cur, user_email)
                call_id = create_call(cur, user_id, lang, channel)

                # salva payload immutabile (se la riga c'è già non fa nulla)
                save_payload(cur, call_id, payload)

                # estrai e inserisci i fatti + aggiorna stato corrente
                extract_and_store_facts(cur, user_id, call_id, payload)

        print("✅ Ingestion completata.")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
