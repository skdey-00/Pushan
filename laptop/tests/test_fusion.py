"""
Test Fusion and Decision Engine
Unit tests for sensor fusion, traffic score, and decision logic
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fusion import compute_queue_level, compute_traffic_score
from decision import make_decision, set_override, clear_override, get_override_state


def test_queue_level():
    """Test queue level computation"""
    print("Testing queue level computation...")

    tests = [
        ({"s25": 0, "s50": 0, "s75": 0}, 0, "No sensors"),
        ({"s25": 1, "s50": 0, "s75": 0}, 1, "Near sensor only"),
        ({"s25": 0, "s50": 1, "s75": 0}, 2, "Mid sensor only"),
        ({"s25": 0, "s50": 0, "s75": 1}, 3, "Far sensor only"),
        ({"s25": 1, "s50": 1, "s75": 0}, 3, "Near + Mid"),
        ({"s25": 1, "s50": 0, "s75": 1}, 4, "Near + Far"),
        ({"s25": 0, "s50": 1, "s75": 1}, 5, "Mid + Far"),
        ({"s25": 1, "s50": 1, "s75": 1}, 6, "All sensors"),
    ]

    all_passed = True
    for sensors, expected, desc in tests:
        result = compute_queue_level(sensors)
        passed = (result == expected)
        status = "✅" if passed else "❌"
        print(f"  {status} {desc}: {result} (expected {expected})")
        all_passed = all_passed and passed

    return all_passed


def test_traffic_score():
    """Test traffic score computation"""
    print("\nTesting traffic score computation...")

    tests = [
        (0, 0, 0.0, "No traffic"),
        (5, 1, 3.4, "Light traffic"),
        (10, 3, 7.2, "Medium traffic"),
        (15, 5, 11.0, "Heavy traffic"),
        (25, 6, 14.4, "Very heavy (capped at 20 cars)"),
    ]

    all_passed = True
    for cars, queue, expected, desc in tests:
        result = compute_traffic_score(cars, queue)
        passed = (abs(result - expected) < 0.1)  # Allow small floating point error
        status = "✅" if passed else "❌"
        print(f"  {status} {desc}: {result} (expected {expected})")
        all_passed = all_passed and passed

    return all_passed


def test_decision_light():
    """Test decision for light traffic"""
    print("\nTesting decision - light traffic (score < 3)...")

    decision = make_decision(2, 0, 1.2)
    passed = (
        decision["signal"] == "GREEN" and
        decision["duration"] == 30 and
        decision["speed_limit"] == 80 and
        not decision["is_override"]
    )

    status = "✅" if passed else "❌"
    print(f"  {status} Signal: {decision['signal']}, Duration: {decision['duration']}, Speed: {decision['speed_limit']}")

    return passed


def test_decision_medium():
    """Test decision for medium traffic"""
    print("\nTesting decision - medium traffic (score 3-7)...")

    decision = make_decision(5, 2, 4.0)
    passed = (
        decision["signal"] == "GREEN" and
        decision["duration"] == 25 and
        decision["speed_limit"] == 60
    )

    status = "✅" if passed else "❌"
    print(f"  {status} Signal: {decision['signal']}, Duration: {decision['duration']}, Speed: {decision['speed_limit']}")

    return passed


def test_decision_heavy():
    """Test decision for heavy traffic"""
    print("\nTesting decision - heavy traffic (score 7-12)...")

    decision = make_decision(10, 4, 8.0)
    passed = (
        decision["signal"] == "YELLOW" and
        decision["duration"] == 20 and
        decision["speed_limit"] == 40
    )

    status = "✅" if passed else "❌"
    print(f"  {status} Signal: {decision['signal']}, Duration: {decision['duration']}, Speed: {decision['speed_limit']}")

    return passed


def test_decision_congested():
    """Test decision for congested traffic"""
    print("\nTesting decision - congested (score 12-17)...")

    decision = make_decision(15, 5, 13.0)
    passed = (
        decision["signal"] == "RED" and
        decision["duration"] == 20 and
        decision["speed_limit"] == 30
    )

    status = "✅" if passed else "❌"
    print(f"  {status} Signal: {decision['signal']}, Duration: {decision['duration']}, Speed: {decision['speed_limit']}")

    return passed


def test_decision_severe():
    """Test decision for severe congestion"""
    print("\nTesting decision - severe (score >= 17)...")

    decision = make_decision(20, 6, 18.0)
    passed = (
        decision["signal"] == "RED" and
        decision["duration"] == 30 and
        decision["speed_limit"] == 20
    )

    status = "✅" if passed else "❌"
    print(f"  {status} Signal: {decision['signal']}, Duration: {decision['duration']}, Speed: {decision['speed_limit']}")

    return passed


def test_override():
    """Test override functionality"""
    print("\nTesting override functionality...")

    # Set override
    set_override("RED", 20)
    state = get_override_state()

    passed1 = (
        state["active"] and
        state["signal"] == "RED" and
        state["speed_limit"] == 20
    )
    status1 = "✅" if passed1 else "❌"
    print(f"  {status1} Override set: {state}")

    # Test that override is used in decision
    decision = make_decision(0, 0, 0.0)  # Light traffic, but override should win
    passed2 = (
        decision["signal"] == "RED" and
        decision["speed_limit"] == 20 and
        decision["is_override"]
    )
    status2 = "✅" if passed2 else "❌"
    print(f"  {status2} Decision respects override: {decision}")

    # Clear override
    clear_override()
    state = get_override_state()
    passed3 = not state["active"]
    status3 = "✅" if passed3 else "❌"
    print(f"  {status3} Override cleared: {state}")

    return passed1 and passed2 and passed3


if __name__ == "__main__":
    print("=" * 50)
    print("Fusion & Decision Engine Tests")
    print("=" * 50)

    tests = [
        ("Queue Level", test_queue_level),
        ("Traffic Score", test_traffic_score),
        ("Decision - Light", test_decision_light),
        ("Decision - Medium", test_decision_medium),
        ("Decision - Heavy", test_decision_heavy),
        ("Decision - Congested", test_decision_congested),
        ("Decision - Severe", test_decision_severe),
        ("Override", test_override),
    ]

    results = []
    for name, test_func in tests:
        results.append((name, test_func()))

    print("\n" + "=" * 50)
    print("RESULTS")
    print("=" * 50)
    for name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{name}: {status}")

    all_passed = all(r[1] for r in results)
    print(f"\nTotal: {len(results)} tests, {sum(r[1] for r in results)} passed")

    sys.exit(0 if all_passed else 1)
