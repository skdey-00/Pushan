# 🚦 Adaptive Traffic Signal System - Python Controller

## Quick Start

### 1. Install Python (if not installed)
Download from: https://www.python.org/downloads/
During installation, check "Add Python to PATH"

### 2. Install Required Library
```bash
pip install requests
```

Or:
```bash
python -m pip install requests
```

### 3. Test Your System
```bash
python TEST_CONTROLLER.py
```

This will:
- ✅ Check ESP32-CAM sensors
- ✅ Check ESP32 Dev Board connection
- ✅ Send a test command (YELLOW signal, 5 seconds, 40 km/h)

### 4. Run the Automated Controller
```bash
python traffic_controller.py
```

---

## What the Python Controller Does

### 🔁 **Continuous Loop:**
1. **Reads sensors** from ESP32-CAM (every 2 seconds)
2. **Analyzes queue density:**
   - EMPTY → No sensors triggered
   - LOW (25%) → Near sensor triggered
   - MEDIUM (50%) → Middle sensor triggered
   - HIGH (75%+) → Far sensor triggered
3. **Adjusts traffic signal:**
   - EMPTY → GREEN, 20 seconds, 60 km/h
   - LOW → GREEN, 15 seconds, 50 km/h
   - MEDIUM → YELLOW, 8 seconds, 40 km/h
   - HIGH → RED, 25 seconds, 30 km/h
4. **Repeats** continuously

### 📊 **Output Example:**
```
============================================================
🚦 ADAPTIVE TRAFFIC SIGNAL SYSTEM
============================================================
ESP32 Dev Board: 192.168.4.1
ESP32-CAM: 192.168.4.2
Starting automated control...
============================================================

[14:30:15] 🚨 Queue: MEDIUM (50%)
                  → Signal: YELLOW
                  → Duration: 8s
                  → Speed Limit: 40 km/h
                  ✅ Command sent successfully

[14:30:17] ✓ Queue: MEDIUM (50%) (no update needed)
[14:30:19] ✓ Queue: MEDIUM (50%) (no update needed)

[14:30:22] 🚨 Queue: HIGH (75%+)
                  → Signal: RED
                  → Duration: 25s
                  → Speed Limit: 30 km/h
                  ✅ Command sent successfully
```

---

## Stopping the Controller

Press **Ctrl+C** to stop safely. The controller will:
1. Set signal to RED (safety)
2. Exit cleanly

---

## Customization

### Change Check Intervals
Edit `traffic_controller.py`:
```python
SENSOR_CHECK_INTERVAL = 2    # How often to check sensors (seconds)
SIGNAL_UPDATE_INTERVAL = 5   # Minimum time between updates (seconds)
```

### Change Signal Logic
Edit the `SIGNAL_CONFIGS` dictionary:
```python
SIGNAL_CONFIGS = {
    QUEUE_EMPTY: {
        "signal": "GREEN",
        "duration": 20,      # Change these values
        "speed_limit": 60
    },
    # ... etc
}
```

---

## Troubleshooting

### "Connection refused" error
- Make sure both ESP32 devices are powered on
- Check your laptop is connected to "TrafficSignal_Dev" WiFi
- Verify IP addresses in the script match your devices

### "requests library not found"
- Install with: `pip install requests`

### Commands not working
- Check ESP32 Dev Board serial monitor
- Verify Dev Board is in AP mode and connected

---

## Next Steps

Once the controller is running:
1. ✅ Test sensor detection by passing objects over IR sensors
2. ✅ Watch the signal adapt automatically
3. ✅ Check Serial Monitor on both devices
4. ✅ Modify the logic to suit your needs
