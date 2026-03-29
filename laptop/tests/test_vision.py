"""
Test Vision Module
Tests YOLO detection with local image and live camera
"""

import sys
import os
import argparse

# Add parent directory to path to import config
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from vision import detect_vehicles_from_image, detect_vehicles, fetch_frame


def test_image_detection(image_path):
    """Test vehicle detection on local image"""
    print(f"Testing detection on image: {image_path}")

    try:
        car_count = detect_vehicles_from_image(image_path)
        print(f"✅ Detection complete!")
        print(f"   Vehicles detected: {car_count}")
        return car_count
    except Exception as e:
        print(f"❌ Error: {e}")
        return -1


def test_live_detection():
    """Test vehicle detection from live camera"""
    print("\nTesting detection from live camera...")

    try:
        car_count = detect_vehicles()
        print(f"✅ Detection complete!")
        print(f"   Vehicles detected: {car_count}")
        return car_count
    except Exception as e:
        print(f"❌ Error: {e}")
        return -1


def test_frame_fetch():
    """Test fetching frames from camera"""
    print("\nTesting frame fetch from camera...")

    try:
        frame = fetch_frame()
        if frame is not None:
            print(f"✅ Frame fetched successfully!")
            print(f"   Frame shape: {frame.shape}")
            return True
        else:
            print("❌ Failed to fetch frame")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test vision module")
    parser.add_argument("--image", type=str, help="Path to test image")
    parser.add_argument("--live", action="store_true", help="Test live camera detection")
    parser.add_argument("--fetch", action="store_true", help="Test frame fetching")

    args = parser.parse_args()

    print("=" * 50)
    print("Vision Module Tests")
    print("=" * 50)

    results = []

    if args.image:
        count = test_image_detection(args.image)
        results.append(("Image Detection", count >= 0))

    if args.fetch:
        results.append(("Frame Fetch", test_frame_fetch()))

    if args.live:
        count = test_live_detection()
        results.append(("Live Detection", count >= 0))

    # If no arguments, show usage
    if len(sys.argv) == 1:
        print("\nUsage:")
        print("  python test_vision.py --image <path>     # Test on local image")
        print("  python test_vision.py --fetch            # Test frame fetching")
        print("  python test_vision.py --live             # Test live detection")
        print("\nExample:")
        print("  python test_vision.py --image test_images/road.jpg")
        sys.exit(1)

    print("\n" + "=" * 50)
    print("RESULTS")
    print("=" * 50)
    for name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{name}: {status}")

    all_passed = all(r[1] for r in results)
    sys.exit(0 if all_passed else 1)
