"""
Manual LED control test
Sends direct commands and waits for response
"""

import requests
import time

ESP32_DEV = "192.168.4.1"

print("="*50)
print("MANUAL LED TEST")
print("="*50)

# Test RED
print("\n🔴 Testing RED LED...")
try:
    response = requests.post(
        f"http://{ESP32_DEV}/cmd",
        json={"signal": "RED", "duration": 10, "speed_limit": 30},
        timeout=5
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")

time.sleep(2)

# Test YELLOW
print("\n🟡 Testing YELLOW LED...")
try:
    response = requests.post(
        f"http://{ESP32_DEV}/cmd",
        json={"signal": "YELLOW", "duration": 10, "speed_limit": 40},
        timeout=5
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")

time.sleep(2)

# Test GREEN
print("\n🟢 Testing GREEN LED...")
try:
    response = requests.post(
        f"http://{ESP32_DEV}/cmd",
        json={"signal": "GREEN", "duration": 10, "speed_limit": 60},
        timeout=5
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")

print("\n" + "="*50)
print("Check your Dev Board LEDs!")
print("="*50)
