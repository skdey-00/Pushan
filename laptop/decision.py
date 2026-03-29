"""
Decision Module - Traffic Signal Decision Engine
"""

from datetime import datetime, timedelta
from config import DECISION_THRESHOLDS, OVERRIDE_DURATION_SECONDS


# ============================================================
# OVERRIDE STATE
# ============================================================
override_state = {
    "active": False,
    "signal": None,
    "speed_limit": None,
    "expires_at": None
}


def set_override(signal, speed_limit):
    """
    Set manual override for traffic signal
    Args:
        signal: "RED", "YELLOW", or "GREEN"
        speed_limit: 20, 30, 40, 60, or 80
    """
    global override_state
    override_state["active"] = True
    override_state["signal"] = signal.upper()
    override_state["speed_limit"] = speed_limit
    override_state["expires_at"] = datetime.now() + timedelta(seconds=OVERRIDE_DURATION_SECONDS)
    print(f"Override set: {signal} @ {speed_limit}km/h until {override_state['expires_at']}")


def clear_override():
    """Clear manual override"""
    global override_state
    override_state["active"] = False
    override_state["signal"] = None
    override_state["speed_limit"] = None
    override_state["expires_at"] = None
    print("Override cleared")


def get_override_state():
    """
    Get current override state
    Returns:
        dict: override state with 'active', 'signal', 'speed_limit', 'remaining_seconds'
    """
    global override_state

    if not override_state["active"]:
        return {
            "active": False,
            "signal": None,
            "speed_limit": None,
            "remaining_seconds": 0
        }

    # Check if override has expired
    if datetime.now() >= override_state["expires_at"]:
        clear_override()
        return {
            "active": False,
            "signal": None,
            "speed_limit": None,
            "remaining_seconds": 0
        }

    remaining = (override_state["expires_at"] - datetime.now()).total_seconds()
    return {
        "active": True,
        "signal": override_state["signal"],
        "speed_limit": override_state["speed_limit"],
        "remaining_seconds": int(remaining)
    }


def make_decision(car_count, queue_level, traffic_score):
    """
    Make traffic signal decision based on traffic score
    Args:
        car_count: int (number of cars detected)
        queue_level: int (0-6 from sensors)
        traffic_score: float (computed score)
    Returns:
        dict: {"signal": str, "duration": int, "speed_limit": int}
    """
    # Check if override is active
    override = get_override_state()
    if override["active"]:
        return {
            "signal": override["signal"],
            "duration": OVERRIDE_DURATION_SECONDS,
            "speed_limit": override["speed_limit"],
            "is_override": True
        }

    # Find matching threshold
    for threshold in DECISION_THRESHOLDS:
        if traffic_score < threshold["max_score"]:
            return {
                "signal": threshold["signal"],
                "duration": threshold["duration"],
                "speed_limit": threshold["speed_limit"],
                "is_override": False
            }

    # Fallback (should never reach here)
    return {
        "signal": "RED",
        "duration": 30,
        "speed_limit": 20,
        "is_override": False
    }


def get_decision_table():
    """
    Get the decision threshold table (for display)
    Returns:
        list: decision thresholds
    """
    return DECISION_THRESHOLDS


if __name__ == "__main__":
    # Test decision logic
    print("Testing decision module...")

    # Test 1: Light traffic
    decision = make_decision(2, 0, 1.2)
    print(f"Light traffic: {decision}")

    # Test 2: Medium traffic
    decision = make_decision(5, 2, 4.0)
    print(f"Medium traffic: {decision}")

    # Test 3: Heavy traffic
    decision = make_decision(15, 5, 13.0)
    print(f"Heavy traffic: {decision}")

    # Test 4: Override
    set_override("RED", 20)
    decision = make_decision(2, 0, 1.2)
    print(f"With override: {decision}")

    clear_override()
