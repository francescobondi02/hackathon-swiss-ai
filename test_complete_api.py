#!/usr/bin/env python3
import requests
import json
import time
import os

BASE_URL = "http://localhost:8000"

# Global variable to store test user ID
TEST_USER_ID = None


def load_example_transcript():
    """Carica il transcript dall'example file"""
    try:
        with open("example/example.txt", "r", encoding="utf-8") as f:
            content = f.read().strip()
        print(f"📄 Loaded transcript from example.txt ({len(content)} characters)")
        return content
    except FileNotFoundError:
        print("⚠️ example.txt not found, using fallback transcript")
        return """Ciao Marco, sono Mario di UBS. Come va?
        Bene Mario, grazie per la chiamata. 
        Volevo aggiornarti sul tuo portfolio. Abbiamo completato l'analisi e tutto sembra andare bene.
        Perfetto, quali sono i dettagli?
        Il tuo patrimonio totale è ora di 5.2 milioni. Abbiamo diversificato come da tue istruzioni."""


def test_root():
    print("🧪 Test 1: Root endpoint")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False


def test_health():
    print("\n🧪 Test 2: Health check")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False


def test_users_list():
    print("\n🧪 Test 3: Users list")
    try:
        global TEST_USER_ID
        response = requests.get(f"{BASE_URL}/users")
        print(f"   Status: {response.status_code}")
        data = response.json()
        print(f"   Users count: {data.get('count', 0)}")
        if data.get("users") and len(data["users"]) > 0:
            first_user = data["users"][0]
            print(f"   First user ID: {first_user.get('user_id')}")
            print(f"   First user email: {first_user.get('email')}")
            # Store first user ID for profile test
            TEST_USER_ID = first_user.get("user_id")
        return response.status_code == 200
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False


def test_user_profile():
    print("\n🧪 Test 4: User profile")
    try:
        global TEST_USER_ID
        # Use real user ID from users list
        user_id = TEST_USER_ID
        if not user_id:
            print("   ⚠️ No user ID available, skipping test")
            return False

        response = requests.get(f"{BASE_URL}/users/{user_id}/profile")
        print(f"   Status: {response.status_code}")
        print(f"   Testing with user_id: {user_id}")
        if response.status_code == 200:
            data = response.json()
            print(f"   User email: {data.get('email')}")
            print(f"   Facts count: {data.get('facts_count', 0)}")
        else:
            print(f"   Response: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False


def test_process_transcript():
    print("\n🧪 Test 5: Process transcript with REAL EXAMPLE DATA")
    try:
        # Carica il transcript dall'example file
        transcript_text = load_example_transcript()

        payload = {"transcript": transcript_text, "user_id": "mario_test_001"}

        print(
            f"📤 Sending transcript ({len(transcript_text)} chars) to /process-transcript..."
        )
        start_time = time.time()

        response = requests.post(
            f"{BASE_URL}/process-transcript",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=60,  # 1 minute timeout for Gemini processing
        )

        total_time = time.time() - start_time
        print(f"⏱️  Request completed in {total_time:.2f}s")
        print(f"   Status: {response.status_code}")

        if response.status_code != 200:
            print(f"   ❌ Error Response: {response.text}")
            return False

        data = response.json()
        print(f"📥 Risultati:")
        print(f"   Success: {data.get('success')}")
        print(f"   Message: {data.get('message')}")
        print(f"   User ID: {data.get('user_id')}")
        print(f"   Facts Extracted: {data.get('facts_extracted', 0)}")
        print(f"   Processing Time: {data.get('processing_time', 0):.2f}s")
        print(f"   Total Time: {total_time:.2f}s")
        print(f"   Saved File: {data.get('saved_file', 'N/A')}")

        if data.get("success"):
            print("🎉 TRANSCRIPT PROCESSING SUCCESSFUL!")

            # Mostra il risultato completo dalla risposta dell'API
            print("\n🤖 GEMINI RESPONSE COMPLETA:")
            print("=" * 50)

            # Se non abbiamo la risposta nell'API response, proviamo a leggere dal file salvato
            saved_file = data.get("saved_file")
            if saved_file:
                try:
                    with open(saved_file, "r", encoding="utf-8") as f:
                        gemini_result = json.load(f)

                    print("📄 CONTENUTO DEL FILE SALVATO:")
                    print(json.dumps(gemini_result, indent=2, ensure_ascii=False))

                except Exception as e:
                    print(f"❌ Errore lettura file: {e}")

            print("=" * 50)
        else:
            print(f"⚠️  Processing failed: {data.get('message')}")

        return data.get("success", False)

    except requests.exceptions.Timeout:
        print("   ❌ Timeout - Gemini processing took too long")
        return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False


def test_user_facts():
    print("\n🧪 Test 6: User facts")
    try:
        response = requests.get(f"{BASE_URL}/users/mario_test_001/facts")
        print(f"   Status: {response.status_code}")
        data = response.json()
        print(f"   Facts count: {len(data.get('facts', []))}")
        print(f"   Response: {json.dumps(data, indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False


def test_results():
    print("\n🧪 Test 7: Results endpoint")
    try:
        response = requests.get(f"{BASE_URL}/results")
        print(f"   Status: {response.status_code}")
        data = response.json()
        print(f"   Results count: {len(data.get('results', []))}")
        return response.status_code == 200
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False


def test_stats():
    print("\n🧪 Test 8: Stats endpoint")
    try:
        response = requests.get(f"{BASE_URL}/stats")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False


def main():
    print("🚀 TESTING COMPLETE API - WITH REAL EXAMPLE DATA")
    print("=" * 60)

    tests = [
        ("Root endpoint", test_root),
        ("Health check", test_health),
        ("Users list", test_users_list),
        ("User profile", test_user_profile),
        ("Process transcript (REAL DATA)", test_process_transcript),
        ("User facts", test_user_facts),
        ("Results", test_results),
        ("Stats", test_stats),
    ]

    passed = 0
    for name, test_func in tests:
        if test_func():
            passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED")

    print("\n" + "=" * 60)
    print(f"📊 TEST SUMMARY: {passed}/{len(tests)} tests passed")

    if passed == len(tests):
        print("🎉 ALL TESTS PASSED!")
    else:
        print("⚠️  Some tests failed")


if __name__ == "__main__":
    main()
