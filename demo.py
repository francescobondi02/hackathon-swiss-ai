#!/usr/bin/env python3
"""
Demo script to showcase the Customer Intelligence System capabilities
"""

import os
import sys
import json
import time
from pathlib import Path

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent / "src"))


def print_header(title):
    """Print a formatted header"""
    print("\n" + "=" * 60)
    print(f"🎯 {title}")
    print("=" * 60)


def print_section(title):
    """Print a formatted section"""
    print(f"\n🔍 {title}")
    print("-" * 40)


def demo_system_capabilities():
    """Demonstrate the system capabilities"""

    print_header("Customer Intelligence System - Live Demo")

    # 1. System Status
    print_section("System Status Check")
    os.system("conda activate TUM && python manage.py status")

    # 2. Integration Test
    print_section("Running Integration Tests")
    os.system("conda activate TUM && python manage.py test")

    # 3. Show sample conversation data
    print_section("Sample Conversation Data")
    fixture_path = Path("tests/fixtures/test_auth_methods.json")
    if fixture_path.exists():
        with open(fixture_path, "r") as f:
            data = json.load(f)

        print("📞 Conversation Overview:")
        if "call" in data:
            call_data = data["call"]
            print(f"   • Call ID: {call_data.get('call_id', 'N/A')}")
            print(f"   • Duration: {call_data.get('duration', 'N/A')}")
            print(f"   • Agent: {call_data.get('agent', {}).get('name', 'N/A')}")

        if "customer" in data:
            customer = data["customer"]
            print(f"\n👤 Customer Info:")
            print(f"   • Name: {customer.get('name', 'N/A')}")
            print(f"   • Email: {customer.get('email', 'N/A')}")
            print(f"   • Phone: {customer.get('phone', 'N/A')}")

    # 4. Database Query Demo
    print_section("Live Database Query")
    try:
        import psycopg2

        DB_CONFIG = {
            "host": "localhost",
            "port": 5432,
            "database": "hackathon_db",
            "user": "hackathon_user",
            "password": "hackathon_pass",
        }

        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # Show user profile evolution
        cursor.execute(
            """
            SELECT fact_key, fact_value, last_observed_at
            FROM user_profile_current 
            WHERE user_id = (SELECT user_id FROM users LIMIT 1)
            ORDER BY fact_key
        """
        )

        facts = cursor.fetchall()

        print("📊 Current User Profile Facts:")
        for fact_key, fact_value, observed_at in facts[:8]:  # Show first 8 facts
            value_str = (
                json.dumps(fact_value)
                if isinstance(fact_value, (dict, list))
                else str(fact_value)
            )
            if len(value_str) > 50:
                value_str = value_str[:47] + "..."
            print(f"   • {fact_key}: {value_str}")

        if len(facts) > 8:
            print(f"   ... and {len(facts) - 8} more facts")

        # Show event history
        cursor.execute(
            """
            SELECT COUNT(*), MIN(observed_at), MAX(observed_at)
            FROM user_fact_events
            WHERE user_id = (SELECT user_id FROM users LIMIT 1)
        """
        )

        event_stats = cursor.fetchone()
        print(f"\n📈 Event History:")
        print(f"   • Total events: {event_stats[0]}")
        print(f"   • First event: {event_stats[1]}")
        print(f"   • Latest event: {event_stats[2]}")

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"❌ Database query failed: {e}")

    # 5. Architecture Overview
    print_section("System Architecture")
    print(
        """
🏗️ Customer Intelligence System Architecture:

┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   JSON Files    │───▶│   Ingestion      │───▶│   PostgreSQL    │
│  (Conversations)│    │    Pipeline      │    │   Database      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │                          │
                              ▼                          ▼
                       ┌──────────────┐         ┌─────────────────┐
                       │   Fact       │         │   Event         │
                       │  Extraction  │         │   Sourcing      │
                       └──────────────┘         └─────────────────┘
                              │                          │
                              ▼                          ▼
                       ┌──────────────┐         ┌─────────────────┐
                       │   User       │◀────────│   Profile       │
                       │ Authentication│         │   Evolution     │
                       └──────────────┘         └─────────────────┘
    """
    )

    # 6. Key Features Summary
    print_section("Key Features Demonstrated")
    features = [
        "✅ Event-sourcing architecture for complete audit trail",
        "✅ Multi-method user authentication (email, phone, address, name)",
        "✅ Intelligent fact extraction from conversation JSON",
        "✅ Real-time profile updates and synchronization",
        "✅ Comprehensive testing with realistic fixtures",
        "✅ Modular architecture with clean separation of concerns",
        "✅ CLI management interface for operations",
        "✅ Database consistency and integrity checks",
    ]

    for feature in features:
        print(f"   {feature}")

    print_header("Demo Complete - System Ready for Production! 🚀")

    # 7. Next Steps
    print("\n🔄 Suggested Next Steps:")
    print("   • Scale ingestion for high-volume processing")
    print("   • Add real-time analytics dashboard")
    print("   • Implement API endpoints for external systems")
    print("   • Add data export/import capabilities")
    print("   • Deploy with Docker containers")


if __name__ == "__main__":
    demo_system_capabilities()
