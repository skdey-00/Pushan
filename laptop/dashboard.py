"""
Streamlit Dashboard - Local Monitoring UI
"""

import streamlit as st
import requests
import cv2
from streamlit_autorefresh import st_autorefresh
from config import (
    CAM_IP, FLASK_PORT, STREAMLIT_TITLE, YOLO_MODEL
)

# Page config
st.set_page_config(
    page_title=STREAMLIT_TITLE,
    page_icon="🚦",
    layout="wide"
)

st.title(STREAMLIT_TITLE)
st.markdown("---")

# Auto-refresh every 2 seconds
st_autorefresh(interval=2000, key="refresh")

# ============================================================
# CAMERA STREAM
# ============================================================
col1, col2 = st.columns([2, 1])

with col1:
    st.subheader("Live Camera Feed")

    # Fetch frame from camera
    try:
        response = requests.get(f"http://{CAM_IP}/stream", timeout=5)
        if response.status_code == 200:
            st.image(response.content, channels="BGR", use_container_width=True)
        else:
            st.error("Failed to fetch camera frame")
    except Exception as e:
        st.error(f"Camera error: {e}")

# ============================================================
# SYSTEM STATUS
# ============================================================
with col2:
    st.subheader("System Status")

    # Fetch system status from Flask API
    try:
        response = requests.get(f"http://localhost:{FLASK_PORT}/status", timeout=3)
        if response.status_code == 200:
            status = response.json()

            # Display metrics
            st.metric("Current Signal", status.get("current_signal", "UNKNOWN"))
            st.metric("Speed Limit", f"{status.get('speed_limit', 0)} km/h")
            st.metric("Car Count", status.get("car_count", 0))
            st.metric("Queue Level", f"{status.get('queue_level', 0)}/6")
            st.metric("Traffic Score", f"{status.get('traffic_score', 0):.1f}")

            # Device status
            st.markdown("---")
            st.markdown("**Device Status:**")
            devices = status.get("devices_online", {})
            cam_status = "🟢 Online" if devices.get("camera") else "🔴 Offline"
            dev_status = "🟢 Online" if devices.get("devboard") else "🔴 Offline"
            st.markdown(f"- Camera: {cam_status}")
            st.markdown(f"- Dev Board: {dev_status}")

            # Override status
            override = status.get("override", {})
            if override.get("active"):
                st.warning(f"⚠️ OVERRIDE ACTIVE: {override['signal']} @ {override['speed_limit']}km/h")
                st.caption(f"Expires in {override['remaining_seconds']}s")
            else:
                st.success("✅ AI Control Active")

        else:
            st.error("Failed to fetch status from API")
    except Exception as e:
        st.error(f"API error: {e}")

# ============================================================
# OVERRIDE CONTROLS
# ============================================================
st.markdown("---")
st.subheader("Manual Override")

col1, col2, col3 = st.columns(3)

with col1:
    signal = st.selectbox("Signal", ["RED", "YELLOW", "GREEN"])

with col2:
    speed_limit = st.select_slider("Speed Limit (km/h)", options=[20, 30, 40, 60, 80], value=40)

with col3:
    if st.button("Set Override", use_container_width=True):
        try:
            response = requests.post(
                f"http://localhost:{FLASK_PORT}/override",
                json={"signal": signal, "speed_limit": speed_limit},
                timeout=3
            )
            if response.status_code == 200:
                st.success(f"Override set: {signal} @ {speed_limit}km/h")
            else:
                st.error("Failed to set override")
        except Exception as e:
            st.error(f"Error: {e}")

if st.button("Clear Override", use_container_width=True):
    try:
        response = requests.post(f"http://localhost:{FLASK_PORT}/clear_override", timeout=3)
        if response.status_code == 200:
            st.success("Override cleared")
        else:
            st.error("Failed to clear override")
    except Exception as e:
        st.error(f"Error: {e}")

# ============================================================
# DECISION TABLE
# ============================================================
st.markdown("---")
st.subheader("Decision Table")

st.markdown("""
| Traffic Score | Signal | Duration | Speed Limit |
|--------------|--------|----------|-------------|
| < 3          | GREEN  | 30s      | 80 km/h     |
| 3 - 7        | GREEN  | 25s      | 60 km/h     |
| 7 - 12       | YELLOW | 20s      | 40 km/h     |
| 12 - 17      | RED    | 20s      | 30 km/h     |
| ≥ 17         | RED    | 30s      | 20 km/h     |
""")
