"""
Configuration for Adaptive Traffic Signal System
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ============================================================
# SUPABASE CONFIGURATION
# ============================================================
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

# ============================================================
# DEVICE IPs (from Serial Monitor after firmware upload)
# ============================================================
CAM_IP = os.getenv("CAM_IP", "192.168.1.100")
DEV_IP = os.getenv("DEV_IP", "192.168.1.101")

# ============================================================
# SERVER CONFIGURATION
# ============================================================
FLASK_PORT = int(os.getenv("FLASK_PORT", "5000"))
FLASK_HOST = "0.0.0.0"  # Listen on all interfaces

# ============================================================
# YOLOv8 CONFIGURATION
# ============================================================
YOLO_MODEL = "yolov8n.pt"  # Use nano model for speed
YOLO_CONFIDENCE = 0.5  # Confidence threshold
YOLO_CLASSES = [2, 3, 5, 7]  # COCO classes: car=2, motorcycle=3, bus=5, truck=7

# ============================================================
# VISION CONFIGURATION
# ============================================================
MAX_CAR_COUNT = 20  # Cap for fusion formula
FRAME_RESIZE_WIDTH = 640  # Resize frames for faster processing

# ============================================================
# DECISION THRESHOLDS
# ============================================================
# Decision table based on traffic_score
# score < 3     → signal=GREEN,  duration=30, speed_limit=80
# score 3–7     → signal=GREEN,  duration=25, speed_limit=60
# score 7–12    → signal=YELLOW, duration=20, speed_limit=40
# score 12–17   → signal=RED,    duration=20, speed_limit=30
# score >= 17   → signal=RED,    duration=30, speed_limit=20

DECISION_THRESHOLDS = [
    {"max_score": 3, "signal": "GREEN", "duration": 30, "speed_limit": 80},
    {"max_score": 7, "signal": "GREEN", "duration": 25, "speed_limit": 60},
    {"max_score": 12, "signal": "YELLOW", "duration": 20, "speed_limit": 40},
    {"max_score": 17, "signal": "RED", "duration": 20, "speed_limit": 30},
    {"max_score": float("inf"), "signal": "RED", "duration": 30, "speed_limit": 20},
]

# ============================================================
# OVERRIDE CONFIGURATION
# ============================================================
OVERRIDE_DURATION_SECONDS = 60  # Override lasts 60 seconds

# ============================================================
# TIMING CONFIGURATION
# ============================================================
MAIN_LOOP_INTERVAL = 1.0  # Process every 1 second
HEARTBEAT_INTERVAL = 5.0  # Update heartbeat every 5 seconds
CAMERA_FETCH_TIMEOUT = 5  # Seconds to wait for camera frame

# ============================================================
# STREAMLIT DASHBOARD CONFIGURATION
# ============================================================
STREAMLIT_PORT = 8501
STREAMLIT_TITLE = "Adaptive Traffic Signal Dashboard"

# ============================================================
# CLOUDFLARE TUNNEL CONFIGURATION
# ============================================================
# The cloudflared tunnel URL (set after tunnel is created)
TUNNEL_URL = os.getenv("TUNNEL_URL", "")
