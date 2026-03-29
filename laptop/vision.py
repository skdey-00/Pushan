"""
Vision Module - YOLOv8 Vehicle Detection
"""

import requests
import cv2
import numpy as np
from ultralytics import YOLO
from config import (
    CAM_IP, YOLO_MODEL, YOLO_CONFIDENCE,
    YOLO_CLASSES, FRAME_RESIZE_WIDTH, CAMERA_FETCH_TIMEOUT
)

# Initialize YOLO model
_model = None


def get_model():
    """Lazy-load YOLO model"""
    global _model
    if _model is None:
        print(f"Loading YOLO model: {YOLO_MODEL}...")
        _model = YOLO(YOLO_MODEL)
        print("YOLO model loaded!")
    return _model


def fetch_frame():
    """
    Fetch a single frame from ESP32-CAM
    Returns: numpy array (BGR format) or None if failed
    """
    url = f"http://{CAM_IP}/stream"
    try:
        response = requests.get(url, timeout=CAMERA_FETCH_TIMEOUT)
        if response.status_code == 200:
            # Decode JPEG to numpy array
            arr = np.asarray(bytearray(response.content), dtype=np.uint8)
            frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
            return frame
        else:
            print(f"Camera returned status {response.status_code}")
            return None
    except requests.exceptions.Timeout:
        print("Camera fetch timeout")
        return None
    except Exception as e:
        print(f"Error fetching frame: {e}")
        return None


def detect_vehicles(frame=None):
    """
    Detect vehicles in frame using YOLOv8
    Args:
        frame: numpy array (BGR format), or None to fetch from camera
    Returns:
        int: number of vehicles detected
    """
    # Fetch frame if not provided
    if frame is None:
        frame = fetch_frame()
        if frame is None:
            return 0

    # Resize for faster processing
    if frame.shape[1] > FRAME_RESIZE_WIDTH:
        scale = FRAME_RESIZE_WIDTH / frame.shape[1]
        frame = cv2.resize(frame, (FRAME_RESIZE_WIDTH, int(frame.shape[0] * scale)))

    # Run YOLO inference
    model = get_model()
    results = model(frame, conf=YOLO_CONFIDENCE, classes=YOLO_CLASSES, verbose=False)

    # Count vehicles
    car_count = 0
    for result in results:
        car_count = len(result.boxes)

    return car_count


def detect_vehicles_from_image(image_path):
    """
    Detect vehicles in a local image file (for testing)
    Args:
        image_path: path to image file
    Returns:
        int: number of vehicles detected
    """
    frame = cv2.imread(image_path)
    if frame is None:
        print(f"Failed to load image: {image_path}")
        return 0
    return detect_vehicles(frame)


def get_annotated_frame():
    """
    Fetch frame and draw bounding boxes (for dashboard display)
    Returns:
        numpy array: annotated frame (BGR format)
    """
    frame = fetch_frame()
    if frame is None:
        return None

    # Resize for faster processing
    original_shape = frame.shape
    if frame.shape[1] > FRAME_RESIZE_WIDTH:
        scale = FRAME_RESIZE_WIDTH / frame.shape[1]
        frame = cv2.resize(frame, (FRAME_RESIZE_WIDTH, int(frame.shape[0] * scale)))

    # Run YOLO inference
    model = get_model()
    results = model(frame, conf=YOLO_CONFIDENCE, classes=YOLO_CLASSES, verbose=False)

    # Draw bounding boxes
    for result in results:
        boxes = result.boxes
        for box in boxes:
            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
            x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)

    return frame


if __name__ == "__main__":
    # Test: fetch and display frame with detections
    print("Testing vision module...")
    frame = fetch_frame()
    if frame is not None:
        print(f"Frame shape: {frame.shape}")
        car_count = detect_vehicles(frame)
        print(f"Vehicles detected: {car_count}")
    else:
        print("Failed to fetch frame")
