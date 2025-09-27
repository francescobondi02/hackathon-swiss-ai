#!/usr/bin/env python3
"""
Test script for the Customer Intelligence API
Tests all endpoints with mock data
"""

import requests
import json
import time
from datetime import datetime

# API base URL
BASE_URL = "http://localhost:8000"


def test_api_endpoint(endpoint, method="GET", data=None, expected_status=200):
    """Test an API endpoint"""
    url = f"{BASE_URL}{endpoint}"

    try:
        if method == "GET":
            response = requests.get(url)
        elif method == "POST":
            response = requests.post(url, json=data)

        print(f"🔍 Testing {method} {endpoint}")
        print(
            f"   Status: {response.status_code} ({'✅' if response.status_code == expected_status else '❌'})"
        )

        if response.status_code == expected_status:
            result = response.json()
            print(f"   Response: {json.dumps(result, indent=2)[:200]}...")
            return result
        else:
            print(f"   Error: {response.text}")
            return None

    except Exception as e:
        print(f"   ❌ Request failed: {e}")
        return None


def main():
    """Run all API tests"""

    print("🚀 Customer Intelligence API - Test Suite")
    print("=" * 60)

    # Wait for API to be ready
    print("\n⏳ Waiting for API to be ready...")
    time.sleep(2)

    # Test 1: Health Check
    print("\n1️⃣ Health Check")
    health_result = test_api_endpoint("/health")

    # Test 2: System Stats
    print("\n2️⃣ System Statistics")
    stats_result = test_api_endpoint("/stats")

    # Test 3: Get All Users
    print("\n3️⃣ Get All Users")
    users_result = test_api_endpoint("/users")

    # Test 4: Process Mock Transcript
    print("\n4️⃣ Process Mock Transcript")
    mock_transcript = {
        "transcript": """
        Customer: Hi, this is Marco Ferrari calling about my account balance.
        Agent: Hello Mr. Ferrari, I can help you with that. Can you confirm your phone number?
        Customer: Yes, it's +41 44 888 99 00. I recently moved to Bahnhofstrasse 50 in Zürich.
        Agent: Thank you. I can see your current balance is €15,240. Is there anything else I can help you with?
        Customer: That's perfect, thank you. I'm also interested in investment options.
        Agent: I'll make a note about your investment interest. Have a great day!
        """,
        "caller_info": {
            "name": "Marco Ferrari",
            "phone": "+41 44 888 99 00",
            "email": "marco.ferrari.zurich@email.com",
        },
        "call_metadata": {
            "duration": "3m 45s",
            "agent_id": "agent_123",
            "call_type": "account_inquiry",
        },
    }

    processing_result = test_api_endpoint(
        "/process-transcript", method="POST", data=mock_transcript
    )

    # Test 5: Get User Profile (if we got a user_id from processing)
    if processing_result and processing_result.get("user_id"):
        user_id = processing_result["user_id"]
        print(f"\n5️⃣ Get User Profile (User ID: {user_id})")
        profile_result = test_api_endpoint(f"/users/{user_id}/profile")
    else:
        print("\n5️⃣ Get User Profile - Skipped (no user_id available)")

    # Test 6: Search Facts
    print("\n6️⃣ Search Facts")
    facts_result = test_api_endpoint("/facts/search?limit=10")

    # Test 7: Search Facts by Key
    print("\n7️⃣ Search Facts by Key")
    contact_facts = test_api_endpoint("/facts/search?fact_key=contact&limit=5")

    # Summary
    print("\n" + "=" * 60)
    print("🎯 Test Summary")
    print("=" * 60)

    if health_result:
        print("✅ API is healthy and database connected")

    if stats_result:
        users = stats_result.get("users", 0)
        events = stats_result.get("total_events", 0)
        print(f"📊 System has {users} users and {events} events")

    if processing_result and processing_result.get("success"):
        facts_count = processing_result.get("facts_extracted", 0)
        processing_time = processing_result.get("processing_time", 0)
        print(
            f"🔄 Transcript processed: {facts_count} facts extracted in {processing_time:.2f}s"
        )

    print("\n🎉 All tests completed!")
    print("\n💡 To interact with the API manually:")
    print("   • Open http://localhost:8000/docs for Swagger UI")
    print("   • Open http://localhost:8000/redoc for ReDoc")
    print("   • Use curl or Postman to test endpoints")


if __name__ == "__main__":
    main()
