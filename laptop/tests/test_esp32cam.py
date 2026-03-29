"""
Test ESP32-CAM Endpoints
Tests: /stream and /sensors endpoints
"""

import requests
import sys
import os

# Add parent directory to path to import config
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import CAM_IP


def test_stream():
    """Test camera stream endpoint"""
    print("Testing /stream endpoint...")
    url = f"http://{CAM_IP}/stream"

    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            content_type = response.headers.get("Content-Type", "")
            if "image" in content_type:
                print(f"✅ /stream working! Content-Type: {content_type}")
                print(f"   Received {len(response.content)} bytes")
                return True
            else:
                print(f"❌ Wrong Content-Type: {content_type}")
                return False
        else:
            print(f"❌ Status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_sensors():
    """Test sensors endpoint"""
    print("\nTesting /sensors endpoint...")
    url = f"http://{CAM_IP}/sensors"

    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if "s25" in data and "s50" in data and "s75" in data:
                print(f"✅ /sensors working!")
                print(f"   s25={data['s25']}, s50={data['s50']}, s75={data['s75']}")
                return True
            else:
                print(f"❌ Invalid JSON structure: {data}")
                return False
        else:
            print(f"❌ Status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_root():
    """Test root endpoint"""
    print("\nTesting / endpoint...")
    url = f"http://{CAM_IP}/"

    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            print(f"✅ / endpoint working!")
            return True
        else:
            print(f"❌ Status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


if __name__ == "__main__":
    print("=" * 50)
    print("ESP32-CAM Endpoint Tests")
    print("=" * 50)
    print(f"Target: http://{CAM_IP}")
    print("=" * 50)

    results = []
    results.append(("Root", test_root()))
    results.append(("Stream", test_stream()))
    results.append(("Sensors", test_sensors()))

    print("\n" + "=" * 50)
    print("RESULTS")
    print("=" * 50)
    for name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{name}: {status}")

    all_passed = all(r[1] for r in results)
    sys.exit(0 if all_passed else 1)
