"""
Simple test script to verify the system is working
Run this before the full traffic controller
"""

import requests
import json

ESP32_DEV = "192.168.4.1"
ESP32_CAM = "192.168.4.2"

print("="*50)
print("TRAFFIC SYSTEM TEST")
print("="*50)

# Test 1: ESP32-CAM Sensors
print("\n📷 Testing ESP32-CAM sensors...")
try:
    response = requests.get(f"http://{ESP32_CAM}/sensors", timeout=5)
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Sensors working: {data}")
        print(f"   s25: {'Vehicle detected' if data['s25'] else 'Clear'}")
        print(f"   s50: {'Vehicle detected' if data['s50'] else 'Clear'}")
        print(f"   s75: {'Vehicle detected' if data['s75'] else 'Clear'}")
    else:
        print(f"❌ Error: HTTP {response.status_code}")
except Exception as e:
    print(f"❌ Connection failed: {e}")

# Test 2: ESP32 Dev Board Status
print("\n🚦 Testing ESP32 Dev Board...")
try:
    response = requests.get(f"http://{ESP32_DEV}/", timeout=5)
    if response.status_code == 200:
        print("✅ Dev Board is online")
    else:
        print(f"❌ Error: HTTP {response.status_code}")
except Exception as e:
    print(f"❌ Connection failed: {e}")

# Test 3: Send Test Command
print("\n🎮 Sending test command to Dev Board...")
try:
    payload = {
        "signal": "YELLOW",
        "duration": 5,
        "speed_limit": 40
    }
    response = requests.post(
        f"http://{ESP32_DEV}/cmd",
        json=payload,
        headers={"Content-Type": "application/json"},
        timeout=5
    )
    if response.status_code == 200:
        print("✅ Command sent successfully!")
        print("   Check your Dev Board - signal should be YELLOW")
        print("   OLED should show speed limit: 40 km/h")
    else:
        print(f"❌ Error: HTTP {response.status_code}")
except Exception as e:
    print(f"❌ Failed: {e}")

print("\n" + "="*50)
print("TEST COMPLETE")
print("="*50)
print("\nIf all tests passed, run:")
print("  python traffic_controller.py")
print("\nTo stop the controller, press Ctrl+C")
