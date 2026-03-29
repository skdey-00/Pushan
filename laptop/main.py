"""
Main Orchestration Loop - Adaptive Traffic Signal System
"""

import time
import threading
import requests
from datetime import datetime
from config import (
    DEV_IP, MAIN_LOOP_INTERVAL, HEARTBEAT_INTERVAL
)
from vision import detect_vehicles
from fusion import fetch_sensor_state, compute_queue_level, compute_traffic_score
from decision import make_decision, get_override_state
from supabase_client import log_event, update_heartbeat, update_tunnel_url

# ============================================================
# GLOBAL STATE
# ============================================================
system_state = {
    "car_count": 0,
    "sensors": {"s25": 0, "s50": 0, "s75": 0},
    "queue_level": 0,
    "traffic_score": 0.0,
    "current_signal": "RED",
    "speed_limit": 30,
    "is_override": False,
    "last_update": None,
    "devices_online": {"camera": False, "devboard": False}
}

last_heartbeat_time = 0


def get_system_state():
    """Get current system state (for API)"""
    global system_state
    state = system_state.copy()
    state["override"] = get_override_state()
    return state


def send_command_to_devboard(signal, duration, speed_limit):
    """
    Send command to ESP32 Dev Board
    Args:
        signal: "RED", "YELLOW", or "GREEN"
        duration: int - seconds to hold signal
        speed_limit: int - speed limit value
    Returns:
        bool: True if successful
    """
    url = f"http://{DEV_IP}/cmd"
    payload = {
        "signal": signal,
        "duration": duration,
        "speed_limit": speed_limit
    }

    try:
        response = requests.post(url, json=payload, timeout=5)
        if response.status_code == 200:
            print(f"Command sent: {signal} for {duration}s @ {speed_limit}km/h")
            return True
        else:
            print(f"Dev board returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"Error sending command to dev board: {e}")
        return False


def check_device_status():
    """Check if devices are online"""
    global system_state

    # Check camera
    try:
        response = requests.get(f"http://{DEV_IP}/", timeout=2)
        system_state["devices_online"]["devboard"] = (response.status_code == 200)
    except:
        system_state["devices_online"]["devboard"] = False

    # Check camera (try to fetch sensors)
    try:
        sensors = fetch_sensor_state()
        system_state["devices_online"]["camera"] = True
    except:
        system_state["devices_online"]["camera"] = False


def process_traffic(log_traffic_event=None):
    """
    Main processing loop:
    1. Fetch sensor data
    2. Detect vehicles
    3. Compute traffic score
    4. Make decision
    5. Send command to dev board
    6. Log to Supabase and in-memory store
    """
    global system_state, last_heartbeat_time

    # Update heartbeat periodically
    current_time = time.time()
    if current_time - last_heartbeat_time >= HEARTBEAT_INTERVAL:
        update_heartbeat()
        check_device_status()
        last_heartbeat_time = current_time

    print(f"\n[{datetime.now().strftime('%H:%M:%S')}] Processing traffic...")

    # 1. Fetch sensors
    sensors = fetch_sensor_state()
    print(f"Sensors: s25={sensors['s25']}, s50={sensors['s50']}, s75={sensors['s75']}")

    # 2. Detect vehicles
    car_count = detect_vehicles()
    print(f"Vehicles detected: {car_count}")

    # 3. Compute metrics
    queue_level = compute_queue_level(sensors)
    traffic_score = compute_traffic_score(car_count, queue_level)
    print(f"Queue level: {queue_level}, Traffic score: {traffic_score}")

    # 4. Make decision
    decision = make_decision(car_count, queue_level, traffic_score)
    print(f"Decision: {decision['signal']} for {decision['duration']}s @ {decision['speed_limit']}km/h (override={decision['is_override']})")

    # 5. Send command to dev board
    send_command_to_devboard(
        decision["signal"],
        decision["duration"],
        decision["speed_limit"]
    )

    # 6. Log to Supabase and in-memory store
    log_event(
        car_count=car_count,
        queue_level=queue_level,
        traffic_score=traffic_score,
        signal=decision["signal"],
        speed_limit=decision["speed_limit"],
        is_override=decision["is_override"]
    )

    # Log to API server's in-memory store
    if log_traffic_event:
        log_traffic_event(
            car_count=car_count,
            queue_level=queue_level,
            traffic_score=traffic_score,
            signal=decision["signal"],
            speed_limit=decision["speed_limit"],
            is_override=decision["is_override"]
        )

    # Update system state
    system_state["car_count"] = car_count
    system_state["sensors"] = sensors
    system_state["queue_level"] = queue_level
    system_state["traffic_score"] = traffic_score
    system_state["current_signal"] = decision["signal"]
    system_state["speed_limit"] = decision["speed_limit"]
    system_state["is_override"] = decision["is_override"]
    system_state["last_update"] = datetime.now().isoformat()


def run_flask_in_thread():
    """Run Flask API in separate thread"""
    from api_server import run_api_server, log_traffic_event
    thread = threading.Thread(target=run_api_server, daemon=True)
    thread.start()
    print("Flask API server started in background thread")
    return log_traffic_event


def main():
    """Main entry point"""
    print("=" * 60)
    print("ADAPTIVE TRAFFIC SIGNAL SYSTEM - MAIN LOOP")
    print("=" * 60)

    # Start Flask API in background and get logger function
    log_traffic_event = run_flask_in_thread()

    # Wait a moment for API to start
    time.sleep(2)

    # Main processing loop
    try:
        while True:
            process_traffic(log_traffic_event)
            time.sleep(MAIN_LOOP_INTERVAL)
    except KeyboardInterrupt:
        print("\nShutting down...")
    except Exception as e:
        print(f"\nError in main loop: {e}")


if __name__ == "__main__":
    main()
