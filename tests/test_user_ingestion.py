#!/usr/bin/env python3
"""
Test pratico per l'ingestion dinamica dei dati utente
"""

import psycopg2
import json
from datetime import datetime, timezone

# Database configuration
DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "database": "hackathon_db",
    "user": "hackathon_user",
    "password": "hackathon_pass",
}


def create_minimal_user():
    """Crea un utente con informazioni minime"""
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()

    # Inserisci utente base
    user_data = {
        "email": "marco.ferrari@email.com",
        "name": "Marco Ferrari",  # Nome nei metadata
        "role": "client",
        "segment": "unknown",
        "created_source": "manual_test",
    }

    cursor.execute(
        """
        INSERT INTO users (email, metadata, created_at)
        VALUES (%(email)s, %(metadata)s, NOW())
        ON CONFLICT (email) DO UPDATE SET metadata = %(metadata)s
        RETURNING user_id, email
    """,
        {
            "email": user_data["email"],
            "metadata": json.dumps(
                {k: v for k, v in user_data.items() if k != "email"}
            ),
        },
    )

    user_id, email = cursor.fetchone()

    conn.commit()
    cursor.close()
    conn.close()

    print(f"✅ Utente creato/aggiornato:")
    print(f"   📧 Email: {email}")
    print(f"   🆔 User ID: {user_id}")
    print(f"   👤 Nome: {user_data['name']}")

    return user_id, email


def show_user_profile_before(email):
    """Mostra il profilo utente prima dell'ingestion"""
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()

    print(f"\n📊 PROFILO UTENTE PRIMA (email: {email}):")
    print("-" * 50)

    # Dati base utente
    cursor.execute(
        """
        SELECT user_id, email, metadata, created_at
        FROM users WHERE email = %s
    """,
        (email,),
    )

    user = cursor.fetchone()
    if not user:
        print("❌ Utente non trovato")
        return

    user_id, email, metadata, created_at = user
    print(f"User ID: {user_id}")
    print(f"Email: {email}")
    print(f"Metadata: {json.dumps(metadata, indent=2)}")
    print(f"Creato: {created_at}")

    # Profilo corrente (dovrebbe essere vuoto)
    cursor.execute(
        """
        SELECT fact_key, fact_value, last_observed_at
        FROM user_profile_current
        WHERE user_id = %s
        ORDER BY fact_key
    """,
        (user_id,),
    )

    facts = cursor.fetchall()
    print(f"\n🎯 Fatti nel profilo corrente: {len(facts)}")

    for fact_key, fact_value, last_observed in facts:
        print(f"  {fact_key}: {json.loads(fact_value)} (osservato: {last_observed})")

    # Chiamate precedenti
    cursor.execute(
        """
        SELECT COUNT(*) FROM calls WHERE user_id = %s
    """,
        (user_id,),
    )

    calls_count = cursor.fetchone()[0]
    print(f"📞 Chiamate precedenti: {calls_count}")

    cursor.close()
    conn.close()


def show_user_profile_after(email):
    """Mostra il profilo utente dopo l'ingestion"""
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()

    print(f"\n🎉 PROFILO UTENTE DOPO L'INGESTION (email: {email}):")
    print("-" * 60)

    # Get user ID
    cursor.execute("SELECT user_id FROM users WHERE email = %s", (email,))
    user_id = cursor.fetchone()[0]

    # Profilo corrente
    cursor.execute(
        """
        SELECT fact_key, fact_value, last_observed_at
        FROM user_profile_current
        WHERE user_id = %s
        ORDER BY fact_key
    """,
        (user_id,),
    )

    facts = cursor.fetchall()
    print(f"🎯 Fatti nel profilo corrente: {len(facts)}")

    # Raggruppa per categoria
    categories = {}
    for fact_key, fact_value, last_observed in facts:
        category = fact_key.split(".")[0]
        if category not in categories:
            categories[category] = []

        # fact_value è già un oggetto Python dal JSONB
        try:
            if isinstance(fact_value, str):
                parsed_value = json.loads(fact_value)
            else:
                parsed_value = fact_value
        except:
            parsed_value = fact_value

        categories[category].append((fact_key, parsed_value, last_observed))

    for category, category_facts in categories.items():
        print(f"\n📋 {category.upper()}:")
        for fact_key, fact_value, last_observed in category_facts:
            print(f"  • {fact_key}: {fact_value}")
            print(f"    ⏰ Osservato: {last_observed.strftime('%Y-%m-%d %H:%M:%S')}")

    # Eventi storici
    cursor.execute(
        """
        SELECT COUNT(*) FROM user_fact_events WHERE user_id = %s
    """,
        (user_id,),
    )

    events_count = cursor.fetchone()[0]
    print(f"\n📈 Eventi storici totali: {events_count}")

    # Ultime chiamate
    cursor.execute(
        """
        SELECT c.call_id, c.started_at, c.language, c.channel, 
               COUNT(ufe.event_id) as facts_extracted
        FROM calls c
        LEFT JOIN user_fact_events ufe ON c.call_id = ufe.call_id
        WHERE c.user_id = %s
        GROUP BY c.call_id, c.started_at, c.language, c.channel
        ORDER BY c.started_at DESC
        LIMIT 5
    """,
        (user_id,),
    )

    calls = cursor.fetchall()
    print(f"\n📞 Ultime chiamate ({len(calls)}):")
    for call_id, started_at, language, channel, facts_extracted in calls:
        print(f"  • {call_id[:8]}... - {started_at} ({language}, {channel})")
        print(f"    📊 Fatti estratti: {facts_extracted}")

    cursor.close()
    conn.close()


def main():
    print("🧪 TEST INGESTION DINAMICA DATI UTENTE")
    print("=" * 60)

    # Step 1: Crea utente minimale
    user_id, email = create_minimal_user()

    # Step 2: Mostra profilo prima (vuoto)
    show_user_profile_before(email)

    print(f"\n✅ Test completato!")
    print(
        f"💡 Ora puoi eseguire: python scripts/ingest_payload.py {email} test_call_marco.json"
    )
    print(f"   per aggiungere informazioni da una chiamata")

    return email


if __name__ == "__main__":
    main()
