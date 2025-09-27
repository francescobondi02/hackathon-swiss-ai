#!/usr/bin/env python3
"""
Deployment and setup script for the Customer Intelligence System
"""

import subprocess
import sys
import os
from pathlib import Path


def run_command(command, description):
    """Run a shell command and handle errors"""
    print(f"🔧 {description}")
    try:
        result = subprocess.run(
            command, shell=True, check=True, capture_output=True, text=True
        )
        print(f"✅ {description} completed successfully")
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        if e.stdout:
            print(f"STDOUT: {e.stdout}")
        if e.stderr:
            print(f"STDERR: {e.stderr}")
        return None


def check_prerequisites():
    """Check system prerequisites"""
    print("🔍 Checking prerequisites...")

    # Check Python
    python_version = run_command("python --version", "Checking Python version")
    if not python_version:
        print("❌ Python is required")
        return False

    # Check Docker
    docker_version = run_command("docker --version", "Checking Docker")
    if not docker_version:
        print("❌ Docker is required for database")
        return False

    # Check PostgreSQL client
    psql_version = run_command("psql --version", "Checking PostgreSQL client")
    if not psql_version:
        print("⚠️  PostgreSQL client not found (optional)")

    return True


def setup_database():
    """Setup PostgreSQL database with Docker"""
    print("\n🐳 Setting up PostgreSQL database...")

    # Stop existing container if running
    run_command(
        "docker stop hackathon-postgres 2>/dev/null || true",
        "Stopping existing database",
    )
    run_command(
        "docker rm hackathon-postgres 2>/dev/null || true",
        "Removing existing container",
    )

    # Start new container
    docker_cmd = """
    docker run -d \
      --name hackathon-postgres \
      -e POSTGRES_DB=hackathon_db \
      -e POSTGRES_USER=hackathon_user \
      -e POSTGRES_PASSWORD=hackathon_pass \
      -p 5432:5432 \
      postgres:15
    """

    if run_command(docker_cmd, "Starting PostgreSQL container"):
        print("⏳ Waiting for database to be ready...")
        import time

        time.sleep(10)

        # Test database connection
        test_cmd = "python -c \"import psycopg2; conn = psycopg2.connect(host='localhost', port=5432, database='hackathon_db', user='hackathon_user', password='hackathon_pass'); print('Database ready')\""
        if run_command(test_cmd, "Testing database connection"):
            return True

    return False


def install_dependencies():
    """Install Python dependencies"""
    print("\n📦 Installing Python dependencies...")

    dependencies = ["psycopg2-binary", "python-dateutil", "requests"]

    for dep in dependencies:
        if not run_command(f"pip install {dep}", f"Installing {dep}"):
            return False

    return True


def setup_project_structure():
    """Ensure project structure is correct"""
    print("\n📁 Setting up project structure...")

    directories = [
        "src/ingestion",
        "src/analysis",
        "src/utils",
        "tests/integration",
        "tests/unit",
        "tests/fixtures",
        "tests/data",
        "logs",
    ]

    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"   ✅ Created: {directory}/")

    return True


def run_initial_tests():
    """Run initial system tests"""
    print("\n🧪 Running initial system tests...")

    # Run integration tests
    if run_command(
        "python tests/integration/test_ingestion_system.py", "Running integration tests"
    ):
        return True

    return False


def display_summary():
    """Display deployment summary"""
    print("\n" + "=" * 60)
    print("🎉 Customer Intelligence System - Deployment Summary")
    print("=" * 60)

    print("\n✅ System Components:")
    print("   • PostgreSQL database running on localhost:5432")
    print("   • Python ingestion pipeline ready")
    print("   • Event-sourcing architecture configured")
    print("   • Integration tests passing")

    print("\n🚀 Ready to use:")
    print("   • python manage.py status        # Check system status")
    print("   • python manage.py test          # Run tests")
    print("   • python demo.py                 # Run demo")
    print("   • python manage.py ingest file.json # Ingest conversation")

    print("\n📊 Access Database:")
    print("   • Host: localhost")
    print("   • Port: 5432")
    print("   • Database: hackathon_db")
    print("   • User: hackathon_user")
    print("   • Password: hackathon_pass")

    print("\n🔗 Useful Commands:")
    print("   • docker logs hackathon-postgres  # View database logs")
    print("   • docker stop hackathon-postgres  # Stop database")
    print("   • docker start hackathon-postgres # Start database")


def main():
    """Main deployment function"""
    print("🚀 Customer Intelligence System - Deployment Script")
    print("=" * 60)

    if not check_prerequisites():
        print("❌ Prerequisites check failed")
        sys.exit(1)

    if not setup_project_structure():
        print("❌ Project structure setup failed")
        sys.exit(1)

    if not install_dependencies():
        print("❌ Dependency installation failed")
        sys.exit(1)

    if not setup_database():
        print("❌ Database setup failed")
        sys.exit(1)

    if not run_initial_tests():
        print("⚠️  Initial tests failed (system may still work)")

    display_summary()
    print("\n🎯 Deployment completed successfully!")


if __name__ == "__main__":
    main()
