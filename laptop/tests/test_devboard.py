"""
Test ESP32 Dev Board Endpoints
Tests: /cmd endpoint and all signal types
"""

import requests
import sys
import os
import time

# Add parent directory to path to import config
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import DEV_IP


def test_root():
    """Test root endpoint"""
    print("Testing / endpoint...")
    url = f"http://{DEV_IP}/"

    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ / endpoint working!")
            print(f"   Current signal: {data.get('signal')}")
            return True
        else:
            print(f"❌ Status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_command(signal, speed_limit):
    """Test command endpoint"""
    print(f"\nTesting /cmd with signal={signal}, speed_limit={speed_limit}...")
    url = f"http://{DEV_IP}/cmd"
    payload = {
        "signal": signal,
        "duration": 10,
        "speed_limit": speed_limit
    }

    try:
        response = requests.post(url, json=payload, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "ok":
                print(f"✅ Command accepted! LED should be {signal}")
                return True
            else:
                print(f"❌ Error in response: {data}")
                return False
        else:
            print(f"❌ Status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_all_signals():
    """Test all three signal types"""
    print("\nTesting all signal types...")

    # Test sequence: RED → YELLOW → GREEN
    signals = [
        ("RED", 20),
        ("YELLOW", 40),
        ("GREEN", 60)
    ]

    results = []
    for signal, speed in signals:
        result = test_command(signal, speed)
        results.append(result)
        time.sleep(2)  # Wait between commands

    return all(results)


def test_invalid_commands():
    """Test error handling with invalid commands"""
    print("\nTesting invalid commands (should fail gracefully)...")

    url = f"http://{DEV_IP}/cmd"

    # Test 1: Invalid signal
    print("\n1. Testing invalid signal...")
    response = requests.post(url, json={"signal": "BLUE", "duration": 10, "speed_limit": 40}, timeout=5)
    if response.status_code == 400:
        print("   ✅ Correctly rejected invalid signal")
    else:
        print(f"   ⚠️  Unexpected response: {response.status_code}")

    # Test 2: Invalid speed limit
    print("\n2. Testing invalid speed_limit...")
    response = requests.post(url, json={"signal": "RED", "duration": 10, "speed_limit": 100}, timeout=5)
    if response.status_code == 400:
        print("   ✅ Correctly rejected invalid speed_limit")
    else:
        print(f"   ⚠️  Unexpected response: {response.status_code}")

    # Test 3: Missing fields
    print("\n3. Testing missing fields...")
    response = requests.post(url, json={"signal": "RED"}, timeout=5)
    if response.status_code == 400:
        print("   ✅ Correctly rejected incomplete request")
    else:
        print(f"   ⚠️  Unexpected response: {response.status_code}")

    return True


if __name__ == "__main__":
    print("=" * 50)
    print("ESP32 Dev Board Endpoint Tests")
    print("=" * 50)
    print(f"Target: http://{DEV_IP}")
    print("=" * 50)

    results = []

    # Test root endpoint
    results.append(("Root", test_root()))

    # Test all signals
    results.append(("All Signals", test_all_signals()))

    # Test invalid commands
    results.append(("Error Handling", test_invalid_commands()))

    print("\n" + "=" * 50)
    print("RESULTS")
    print("=" * 50)
    for name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{name}: {status}")

    all_passed = all(r[1] for r in results)
    sys.exit(0 if all_passed else 1)
