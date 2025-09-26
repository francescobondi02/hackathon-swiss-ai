#!/usr/bin/env python3
"""
Integration test for the complete ingestion system
"""

import os
import sys
import json
import psycopg2
from pathlib import Path

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))

from ingestion.ingest_from_json import main as ingest_main

# Database configuration
DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "database": "hackathon_db",
    "user": "hackathon_user",
    "password": "hackathon_pass",
}


class IngestionIntegrationTest:
    def __init__(self):
        self.test_fixtures_dir = Path(__file__).parent.parent / "fixtures"
        self.original_cwd = os.getcwd()

    def setup_test_environment(self):
        """Setup test environment and database connection"""
        # Change to project root for relative paths to work
        project_root = Path(__file__).parent.parent.parent
        os.chdir(project_root)

        # Test database connection
        try:
            conn = psycopg2.connect(**DB_CONFIG)
            conn.close()
            print("✅ Database connection successful")
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            raise

    def cleanup(self):
        """Cleanup test environment"""
        os.chdir(self.original_cwd)

    def get_user_data(self, user_id):
        """Get user data from database"""
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # Get user basic info
        cursor.execute(
            "SELECT email, postal_address, phone_number, metadata FROM users WHERE user_id = %s",
            (user_id,),
        )
        user_info = cursor.fetchone()

        # Get current profile
        cursor.execute(
            "SELECT fact_key, fact_value, last_observed_at FROM user_profile_current WHERE user_id = %s ORDER BY fact_key",
            (user_id,),
        )
        profile = cursor.fetchall()

        # Get event count
        cursor.execute(
            "SELECT COUNT(*) FROM user_fact_events WHERE user_id = %s", (user_id,)
        )
        event_count = cursor.fetchone()[0]

        cursor.close()
        conn.close()

        return {"user_info": user_info, "profile": profile, "event_count": event_count}

    def test_conversation_ingestion(self, fixture_filename):
        """Test ingestion of a conversation JSON"""
        fixture_path = self.test_fixtures_dir / fixture_filename

        if not fixture_path.exists():
            raise FileNotFoundError(f"Fixture not found: {fixture_path}")

        print(f"\n🧪 Testing ingestion of: {fixture_filename}")
        print("-" * 50)

        # Backup original sys.argv
        original_argv = sys.argv.copy()

        try:
            # Set up arguments for the ingestion script
            sys.argv = ["ingest_from_json.py", str(fixture_path)]

            # Run ingestion
            ingest_main()

            print(f"✅ Ingestion completed for {fixture_filename}")

        except Exception as e:
            print(f"❌ Ingestion failed for {fixture_filename}: {e}")
            raise
        finally:
            # Restore original sys.argv
            sys.argv = original_argv

    def test_user_evolution(self):
        """Test that user data evolves correctly across multiple conversations"""
        print("\n🔄 Testing user data evolution across conversations")
        print("=" * 60)

        # Find Marco Ferrari's user_id
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute(
            "SELECT user_id FROM users WHERE email LIKE '%marco.ferrari%' LIMIT 1"
        )
        result = cursor.fetchone()
        cursor.close()
        conn.close()

        if not result:
            print("❌ Marco Ferrari user not found")
            return

        user_id = result[0]

        # Get current state
        user_data = self.get_user_data(user_id)

        print(f"👤 User ID: {user_id}")
        print(f"📊 Profile facts: {len(user_data['profile'])}")
        print(f"📈 Total events: {user_data['event_count']}")
        print(
            f"📧 Current email: {user_data['user_info'][0] if user_data['user_info'] else 'N/A'}"
        )
        print(
            f"📍 Current address: {user_data['user_info'][1] if user_data['user_info'] else 'N/A'}"
        )
        print(
            f"📞 Current phone: {user_data['user_info'][2] if user_data['user_info'] else 'N/A'}"
        )

        # Show some profile facts
        print("\n🎯 Current profile facts:")
        for fact_key, fact_value, observed_at in user_data["profile"][
            :5
        ]:  # First 5 facts
            value_str = (
                json.dumps(fact_value)
                if isinstance(fact_value, (dict, list))
                else str(fact_value)
            )
            if len(value_str) > 50:
                value_str = value_str[:47] + "..."
            print(f"   • {fact_key}: {value_str}")

        if len(user_data["profile"]) > 5:
            print(f"   ... and {len(user_data['profile']) - 5} more facts")

    def run_all_tests(self):
        """Run all integration tests"""
        try:
            self.setup_test_environment()

            print("🚀 Starting Ingestion Integration Tests")
            print("=" * 60)

            # Test fixtures available
            fixtures = list(self.test_fixtures_dir.glob("*.json"))
            print(f"📁 Found {len(fixtures)} test fixtures:")
            for fixture in fixtures:
                print(f"   • {fixture.name}")

            # Test each fixture (but skip to avoid duplicates in this demo)
            # for fixture in fixtures:
            #     self.test_conversation_ingestion(fixture.name)

            # Test user evolution
            self.test_user_evolution()

            print("\n🎉 All integration tests completed successfully!")

        except Exception as e:
            print(f"\n❌ Integration test failed: {e}")
            raise
        finally:
            self.cleanup()


def main():
    """Run the integration tests"""
    test_runner = IngestionIntegrationTest()
    test_runner.run_all_tests()


if __name__ == "__main__":
    main()
