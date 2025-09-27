#!/usr/bin/env python3
"""
Main utility script for the customer intelligence system
"""

import argparse
import os
import sys
from pathlib import Path

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent / "src"))


def ingest_conversation(json_file):
    """Ingest a conversation JSON file"""
    from src.ingestion.ingest_from_json import main as ingest_main

    original_argv = sys.argv.copy()
    try:
        sys.argv = ["ingest_from_json.py", json_file]
        ingest_main()
        print(f"✅ Successfully ingested: {json_file}")
    except Exception as e:
        print(f"❌ Failed to ingest {json_file}: {e}")
        return False
    finally:
        sys.argv = original_argv
    return True


def run_analysis(analysis_type="all"):
    """Run data analysis"""
    print(f"🔍 Running analysis: {analysis_type}")

    if analysis_type in ["all", "json"]:
        try:
            from src.analysis.analyse_json import main as analyze_json_main

            original_argv = sys.argv.copy()
            sys.argv = ["analyse_json.py", "data/test"]
            analyze_json_main()
            sys.argv = original_argv
            print("✅ JSON analysis completed")
        except Exception as e:
            print(f"❌ JSON analysis failed: {e}")


def run_tests(test_type="integration"):
    """Run tests"""
    print(f"🧪 Running {test_type} tests")

    if test_type == "integration":
        try:
            from tests.integration.test_ingestion_system import main as test_main

            test_main()
        except Exception as e:
            print(f"❌ Integration tests failed: {e}")


def ingest_directory(directory):
    """Ingest all JSON files in a directory"""
    directory_path = Path(directory)
    if not directory_path.exists():
        print(f"❌ Directory not found: {directory}")
        return

    json_files = list(directory_path.glob("*.json"))
    if not json_files:
        print(f"❌ No JSON files found in: {directory}")
        return

    print(f"📁 Found {len(json_files)} JSON files in {directory}")

    success_count = 0
    for json_file in json_files:
        if ingest_conversation(str(json_file)):
            success_count += 1

    print(f"🎉 Successfully ingested {success_count}/{len(json_files)} files")


def show_system_status():
    """Show system status"""
    import psycopg2

    # Database configuration
    DB_CONFIG = {
        "host": "localhost",
        "port": 5432,
        "database": "hackathon_db",
        "user": "hackathon_user",
        "password": "hackathon_pass",
    }

    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # Get table counts
        cursor.execute("SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM user_fact_events")
        event_count = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(DISTINCT user_id) FROM user_profile_current")
        profile_count = cursor.fetchone()[0]

        # Get recent activity
        cursor.execute(
            """
            SELECT DATE(observed_at) as date, COUNT(*) as events
            FROM user_fact_events 
            WHERE observed_at > NOW() - INTERVAL '7 days'
            GROUP BY DATE(observed_at)
            ORDER BY date DESC
            LIMIT 5
        """
        )
        recent_activity = cursor.fetchall()

        cursor.close()
        conn.close()

        print("📊 System Status")
        print("=" * 40)
        print(f"👥 Total users: {user_count}")
        print(f"📈 Total events: {event_count}")
        print(f"👤 Users with profiles: {profile_count}")

        if recent_activity:
            print("\n📅 Recent activity (last 7 days):")
            for date, events in recent_activity:
                print(f"   • {date}: {events} events")

        print("✅ Database connection: OK")

    except Exception as e:
        print(f"❌ Database connection failed: {e}")


def main():
    """Main CLI interface"""
    parser = argparse.ArgumentParser(
        description="Customer Intelligence System CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python manage.py status                    # Show system status
  python manage.py ingest file.json         # Ingest single conversation
  python manage.py ingest-dir data/test     # Ingest directory of conversations
  python manage.py analyze                  # Run data analysis
  python manage.py test                     # Run integration tests
        """,
    )

    parser.add_argument(
        "command",
        choices=["status", "ingest", "ingest-dir", "analyze", "test"],
        help="Command to execute",
    )

    parser.add_argument("target", nargs="?", help="Target file or directory")

    args = parser.parse_args()

    if args.command == "status":
        show_system_status()

    elif args.command == "ingest":
        if not args.target:
            print("❌ Please specify a JSON file to ingest")
            return
        ingest_conversation(args.target)

    elif args.command == "ingest-dir":
        if not args.target:
            print("❌ Please specify a directory to ingest")
            return
        ingest_directory(args.target)

    elif args.command == "analyze":
        run_analysis()

    elif args.command == "test":
        run_tests()


if __name__ == "__main__":
    main()
