"""
Fusion Module - Sensor Fusion and Queue Level Computation
"""

import requests
from config import CAM_IP


def fetch_sensor_state():
    """
    Fetch IR sensor state from ESP32-CAM
    Returns: dict with keys 's25', 's50', 's75' (values 0 or 1)
    """
    url = f"http://{CAM_IP}/sensors"
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Sensor endpoint returned status {response.status_code}")
            return {"s25": 0, "s50": 0, "s75": 0}
    except Exception as e:
        print(f"Error fetching sensors: {e}")
        return {"s25": 0, "s50": 0, "s75": 0}


def compute_queue_level(sensors):
    """
    Compute queue level from sensor states
    Formula: queue_level = (s25 * 1) + (s50 * 2) + (s75 * 3)  [max=6]

    Args:
        sensors: dict with keys 's25', 's50', 's75'

    Returns:
        int: queue level (0-6)
    """
    queue_level = (sensors["s25"] * 1) + (sensors["s50"] * 2) + (sensors["s75"] * 3)
    return queue_level


def compute_traffic_score(car_count, queue_level):
    """
    Compute traffic score using fusion formula
    Formula: traffic_score = (min(car_count, 20) * 0.6) + (queue_level * 0.4)

    Args:
        car_count: int (number of cars detected by vision)
        queue_level: int (0-6 from sensors)

    Returns:
        float: traffic score
    """
    max_cars = 20
    capped_cars = min(car_count, max_cars)
    traffic_score = (capped_cars * 0.6) + (queue_level * 0.4)
    return round(traffic_score, 2)


if __name__ == "__main__":
    # Test fusion logic
    print("Testing fusion module...")

    # Test case 1: No traffic
    sensors = {"s25": 0, "s50": 0, "s75": 0}
    queue = compute_queue_level(sensors)
    score = compute_traffic_score(0, queue)
    print(f"Test 1 - No traffic: queue={queue}, score={score}")

    # Test case 2: Medium traffic
    sensors = {"s25": 1, "s50": 0, "s75": 0}
    queue = compute_queue_level(sensors)
    score = compute_traffic_score(5, queue)
    print(f"Test 2 - Medium traffic: queue={queue}, score={score}")

    # Test case 3: Heavy traffic
    sensors = {"s25": 1, "s50": 1, "s75": 1}
    queue = compute_queue_level(sensors)
    score = compute_traffic_score(15, queue)
    print(f"Test 3 - Heavy traffic: queue={queue}, score={score}")
