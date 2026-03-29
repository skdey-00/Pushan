#!/usr/bin/env python3
"""
 ============================================================
 ADAPTIVE TRAFFIC SIGNAL SYSTEM - AUTOMATED CONTROLLER
 ============================================================

 This script:
  - Polls ESP32-CAM for IR sensor data (queue detection)
  - Analyzes queue density
  - Sends commands to ESP32 Dev Board to adjust traffic signals
  - Implements adaptive traffic logic

 Requirements:
  - pip install requests

 Usage:
  - python traffic_controller.py

 ============================================================
"""

import requests
import time
import json
from datetime import datetime

# ============================================================
# CONFIGURATION
# ============================================================

ESP32_DEV_BOARD_IP = "192.168.4.1"  # Traffic signal controller
ESP32_CAM_IP = "192.168.4.2"         # Camera + IR sensors

# How often to check sensors (seconds)
SENSOR_CHECK_INTERVAL = 2

# How often to update traffic signal (seconds)
SIGNAL_UPDATE_INTERVAL = 5

# Minimum time for a signal (seconds) - prevents too frequent changes
MIN_SIGNAL_DURATION = 8

# ============================================================
# TRAFFIC LOGIC PARAMETERS
# ============================================================

# Queue density levels
QUEUE_EMPTY = 0      # No sensors triggered
QUEUE_LOW = 1        # s25=1 (25% queue)
QUEUE_MEDIUM = 2     # s50=1 (50% queue)
QUEUE_HIGH = 3       # s75=1 (75% queue) or multiple sensors

# Signal configurations based on queue density
SIGNAL_CONFIGS = {
    QUEUE_EMPTY: {
        "signal": "GREEN",
        "duration": 20,      # Long green when no queue
        "speed_limit": 60    # Higher speed limit
    },
    QUEUE_LOW: {
        "signal": "GREEN",
        "duration": 15,      # Medium green
        "speed_limit": 50
    },
    QUEUE_MEDIUM: {
        "signal": "YELLOW",
        "duration": 8,       # Prepare to stop
        "speed_limit": 40
    },
    QUEUE_HIGH: {
        "signal": "RED",
        "duration": 25,      # Long red to clear queue
        "speed_limit": 30    # Lower speed limit
    }
}

# ============================================================
# API FUNCTIONS
# ============================================================

def get_sensor_data():
    """
    Fetch sensor data from ESP32-CAM
    Returns: dict with s25, s50, s75 values (0 or 1)
    """
    try:
        response = requests.get(f"http://{ESP32_CAM_IP}/sensors", timeout=3)
        if response.status_code == 200:
            data = response.json()
            return data
        else:
            print(f"⚠️  Error getting sensors: HTTP {response.status_code}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"⚠️  Connection error: {e}")
        return None


def send_traffic_command(signal, duration, speed_limit):
    """
    Send traffic control command to ESP32 Dev Board
    Returns: True if successful, False otherwise
    """
    try:
        payload = {
            "signal": signal,
            "duration": duration,
            "speed_limit": speed_limit
        }

        response = requests.post(
            f"http://{ESP32_DEV_BOARD_IP}/cmd",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=5
        )

        if response.status_code == 200:
            return True
        else:
            print(f"⚠️  Error sending command: HTTP {response.status_code}")
            return False

    except requests.exceptions.RequestException as e:
        print(f"⚠️  Connection error: {e}")
        return False


def get_signal_status():
    """
    Get current signal status from ESP32 Dev Board
    Returns: dict with current signal state
    """
    try:
        response = requests.get(f"http://{ESP32_DEV_BOARD_IP}/", timeout=3)
        if response.status_code == 200:
            # Parse response or return success
            return True
        return False
    except:
        return False

# ============================================================
# TRAFFIC LOGIC
# ============================================================

def calculate_queue_density(sensor_data):
    """
    Calculate queue density from sensor data
    Returns: queue level (0-3)
    """
    if sensor_data is None:
        return QUEUE_EMPTY

    s25 = sensor_data.get("s25", 0)
    s50 = sensor_data.get("s50", 0)
    s75 = sensor_data.get("s75", 0)

    # Count how many sensors are triggered
    triggered_count = s25 + s50 + s75

    if triggered_count == 0:
        return QUEUE_EMPTY
    elif s75 == 1:
        return QUEUE_HIGH       # Far sensor triggered = high queue
    elif s50 == 1:
        return QUEUE_MEDIUM     # Middle sensor triggered
    elif s25 == 1:
        return QUEUE_LOW        # Near sensor triggered
    else:
        return QUEUE_EMPTY


def should_update_signal(current_queue, last_queue, last_update_time):
    """
    Decide if signal should be updated based on queue changes
    Prevents too frequent signal changes
    """
    time_since_update = time.time() - last_update_time

    # Always update if queue level changed significantly
    if abs(current_queue - last_queue) >= 2:
        return True

    # Update if queue increased
    if current_queue > last_queue and time_since_update >= MIN_SIGNAL_DURATION:
        return True

    # Update if enough time passed
    if time_since_update >= SIGNAL_UPDATE_INTERVAL:
        return True

    return False


# ============================================================
# MAIN CONTROL LOOP
# ============================================================

def main():
    import sys
    # Fix Windows console encoding issue
    if sys.platform == 'win32':
        import codecs
        sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

    print("\n" + "="*60)
    print("🚦 ADAPTIVE TRAFFIC SIGNAL SYSTEM")
    print("="*60)
    print(f"ESP32 Dev Board: {ESP32_DEV_BOARD_IP}")
    print(f"ESP32-CAM: {ESP32_CAM_IP}")
    print(f"Starting automated control...")
    print("="*60 + "\n")

    # Initialize variables
    last_queue_level = QUEUE_EMPTY
    last_signal_update = time.time()
    loop_count = 0

    try:
        while True:
            loop_count += 1
            timestamp = datetime.now().strftime("%H:%M:%S")

            # ====================================================
            # STEP 1: Get sensor data
            # ====================================================
            sensor_data = get_sensor_data()

            if sensor_data is None:
                print(f"[{timestamp}] ⚠️  Unable to read sensors, waiting...")
                time.sleep(SENSOR_CHECK_INTERVAL)
                continue

            # ====================================================
            # STEP 2: Calculate queue density
            # ====================================================
            queue_level = calculate_queue_density(sensor_data)

            queue_names = {
                QUEUE_EMPTY: "EMPTY",
                QUEUE_LOW: "LOW (25%)",
                QUEUE_MEDIUM: "MEDIUM (50%)",
                QUEUE_HIGH: "HIGH (75%+)"
            }

            # ====================================================
            # STEP 3: Decide if signal needs update
            # ====================================================
            if should_update_signal(queue_level, last_queue_level, last_signal_update):

                # Get signal config for this queue level
                config = SIGNAL_CONFIGS[queue_level]

                # Send command to Dev Board
                print(f"\n[{timestamp}] 🚨 Queue: {queue_names[queue_level]}")
                print(f"                  → Signal: {config['signal']}")
                print(f"                  → Duration: {config['duration']}s")
                print(f"                  → Speed Limit: {config['speed_limit']} km/h")

                success = send_traffic_command(
                    config['signal'],
                    config['duration'],
                    config['speed_limit']
                )

                if success:
                    print(f"                  ✅ Command sent successfully")
                    last_queue_level = queue_level
                    last_signal_update = time.time()
                else:
                    print(f"                  ❌ Failed to send command")

            else:
                # Just show status (every 5 loops to reduce spam)
                if loop_count % 5 == 0:
                    print(f"[{timestamp}] ✓ Queue: {queue_names[queue_level]} (no update needed)")

            # ====================================================
            # STEP 4: Wait before next check
            # ====================================================
            time.sleep(SENSOR_CHECK_INTERVAL)

    except KeyboardInterrupt:
        print("\n\n" + "="*60)
        print("🛑 Stopping traffic controller...")
        print("="*60)

        # Set signal to RED when stopping
        print("Setting signal to RED for safety...")
        send_traffic_command("RED", 60, 30)
        print("✅ Done. System stopped safely.")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("Setting signal to RED for safety...")
        send_traffic_command("RED", 60, 30)


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    # Check if requests is installed
    try:
        import requests
    except ImportError:
        print("❌ 'requests' library not found!")
        print("Install it with: pip install requests")
        exit(1)

    main()
