# Adaptive Traffic Signal System

A distributed edge-AI traffic management system using ESP32 microcontrollers, YOLOv8 computer vision, and a Next.js dashboard.

## System Architecture

```
┌─────────────────┐      ┌──────────────┐      ┌─────────────────┐
│  ESP32-CAM      │      │   Laptop     │      │  ESP32 Dev      │
│  (Camera Node)  │◄────►│  (AI Brain)  │◄────►│  (Signal Ctrl)  │
│                 │      │              │      │                 │
│  - OV2640 Cam   │      │ - YOLOv8     │      │ - RGB LEDs      │
│  - 3x IR Sensor │      │ - Fusion     │      │ - OLED Display  │
│  - WiFi Server  │      │ - Decision   │      │ - WiFi Client   │
└─────────────────┘      │ - Flask API  │      └─────────────────┘
                         │ - Supabase   │
                         └──────┬───────┘
                                │
                         ┌──────▼───────┐
                         │  Vercel App  │
                         │  (Dashboard) │
                         │              │
                         │ - Live Feed  │
                         │ - Controls   │
                         │ - History    │
                         └──────────────┘
```

## Features

- **Computer Vision**: YOLOv8 vehicle detection from ESP32-CAM
- **Sensor Fusion**: IR sensors validate queue detection
- **Adaptive Control**: AI adjusts signals based on traffic score
- **Manual Override**: Police can override via web dashboard
- **Real-time Dashboard**: Next.js app with live metrics
- **Database Logging**: All events logged to Supabase
- **Health Monitoring**: Device status tracking

## Hardware Requirements

- **ESP32-CAM** (AI-Thinker board)
- **ESP32 Dev Board** (standard ESP32)
- **OV2640 Camera** (comes with ESP32-CAM)
- **3x FC-51 IR Sensors**
- **SSD1306 OLED Display** (128x64)
- **3x LEDs** (Red, Yellow, Green)
- **3x 220Ω Resistors**
- **Breadboard & wires**
- **5V 2A Power Supply** (for ESP32-CAM)
- **FTDI232 Programmer** (for ESP32-CAM)

## Hardware Connections

### ESP32-CAM (AI-Thinker)

```
IR Sensor 1 OUT → GPIO 2   (25% queue / near lane)
IR Sensor 2 OUT → GPIO 4   (50% queue / mid lane)
IR Sensor 3 OUT → GPIO 16  (75% queue / far lane)
All IR VCC      → 3.3V pin
All IR GND      → GND pin
Power Supply    → 5V / 2A dedicated
```

**Programming (FTDI232 - only during flash):**
```
FTDI TX → ESP32-CAM GPIO 3 (U0RXD)
FTDI RX → ESP32-CAM GPIO 1 (U0TXD)
FTDI GND → GND
GPIO 0  → GND (bridge during flash only, remove after)
```

### ESP32 Dev Board

```
RED LED    → 220Ω → GPIO 25 (cathode to GND)
YELLOW LED → 220Ω → GPIO 26 (cathode to GND)
GREEN LED  → 220Ω → GPIO 27 (cathode to GND)

OLED SDA → GPIO 21
OLED SCL → GPIO 22
OLED VCC → 3.3V
OLED GND → GND
```

## Software Requirements

### Arduino IDE
- ESP32 board package (v2.x)
- ArduinoJson library
- Adafruit SSD1306 library
- Adafruit GFX Library

### Python (Laptop)
- Python 3.9+
- pip packages from `laptop/requirements.txt`

### Node.js (Dashboard)
- Node.js 18+
- npm or yarn

### Supabase Account
- Free tier account at supabase.com

## Setup Instructions

### Phase 1: Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run:

```sql
-- Create traffic_events table
CREATE TABLE traffic_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  car_count INTEGER,
  queue_level INTEGER,
  traffic_score NUMERIC,
  signal TEXT,
  speed_limit INTEGER,
  is_override BOOLEAN DEFAULT false
);

-- Enable Realtime
ALTER TABLE traffic_events REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE traffic_events;

-- Create system_state table
CREATE TABLE system_state (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Realtime
ALTER TABLE system_state REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE system_state;
```

3. Get your credentials from Settings → API
4. Copy `SUPABASE_URL` and `SUPABASE_KEY`

### Phase 2: ESP32-CAM Firmware

1. Open Arduino IDE
2. Install ESP32 board package
3. Select **"AI Thinker ESP32-CAM"** board
4. Open `esp32cam/main.ino`
5. Update WiFi credentials in `esp32cam/config.h`:
```cpp
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
```
6. Connect FTDI programmer (GPIO 0 to GND for flash)
7. Upload sketch
8. Remove GPIO 0 bridge and press reset
9. Open Serial Monitor (115200 baud) - note the IP address
10. Test in browser: `http://[CAM-IP]/sensors`
11. **SEALED** - Do not reflash after this phase

### Phase 3: ESP32 Dev Board Firmware

1. Open Arduino IDE
2. Select **"ESP32 Dev Module"** board
3. Open `esp32dev/main.ino`
4. Update WiFi credentials in `esp32dev/config.h`
5. Connect via USB (normal programming)
6. Upload sketch
7. Open Serial Monitor - note the IP address
8. Test with curl:
```bash
curl -X POST http://[DEV-IP]/cmd \
  -H "Content-Type: application/json" \
  -d '{"signal":"GREEN","duration":10,"speed_limit":60}'
```

### Phase 4: Python Backend Setup

1. Open terminal in `laptop/` directory
2. Install dependencies:
```bash
pip install -r requirements.txt
```
3. Copy `.env.example` to `.env` and update:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
CAM_IP=192.168.1.100    # from ESP32-CAM Serial Monitor
DEV_IP=192.168.1.101    # from ESP32 Dev Board Serial Monitor
FLASK_PORT=5000
```
4. Run tests:
```bash
python tests/test_fusion.py
python tests/test_esp32cam.py
python tests/test_devboard.py
```

### Phase 5: Start Main System

1. In `laptop/` directory:
```bash
python main.py
```
2. You should see LEDs changing and sensor data being logged
3. Check Supabase dashboard → traffic_events table filling up

### Phase 6: Optional - Streamlit Dashboard

In a new terminal:
```bash
streamlit run dashboard.py
```
Open browser to `http://localhost:8501`

### Phase 7: Optional - Cloudflare Tunnel (for external access)

1. Install cloudflared:
```bash
# On Windows: Download from cloudflare.com
# On Mac: brew install cloudflare-tools
# On Linux: apt install cloudflare-tools
```

2. Start tunnel:
```bash
cloudflared tunnel --url http://localhost:5000
```

3. Copy the HTTPS URL
4. Update Supabase system_state table:
```sql
INSERT INTO system_state (key, value) VALUES
('tunnel_url', 'https://your-tunnel-url.trycloudflare.com')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

### Phase 8: Next.js Dashboard (Vercel)

1. In `web/` directory:
```bash
npm install
```

2. Copy `.env.local.example` to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_FLASK_API_URL=http://localhost:5000
```

3. Run locally:
```bash
npm run dev
```
Open browser to `http://localhost:3000`

4. Deploy to Vercel:
```bash
npm install -g vercel
vercel
```

## Testing

### Test Individual Components

```bash
# Test fusion logic
python tests/test_fusion.py

# Test ESP32-CAM endpoints
python tests/test_esp32cam.py

# Test ESP32 Dev Board endpoints
python tests/test_devboard.py

# Test vision module (needs test image)
python tests/test_vision.py --image test_images/road.jpg
python tests/test_vision.py --live
```

## Decision Table

| Traffic Score | Signal | Duration | Speed Limit |
|--------------|--------|----------|-------------|
| < 3          | GREEN  | 30s      | 80 km/h     |
| 3 - 7        | GREEN  | 25s      | 60 km/h     |
| 7 - 12       | YELLOW | 20s      | 40 km/h     |
| 12 - 17      | RED    | 20s      | 30 km/h     |
| ≥ 17         | RED    | 30s      | 20 km/h     |

## API Endpoints

### ESP32-CAM (Port 80)
- `GET /stream` - Returns JPEG frame
- `GET /sensors` - Returns JSON: `{"s25":0,"s50":1,"s75":0}`

### ESP32 Dev Board (Port 80)
- `POST /cmd` - Body: `{"signal":"RED","duration":20,"speed_limit":30}`
- `GET /` - Returns current state

### Flask API (Port 5000)
- `POST /override` - Set manual override
- `POST /clear_override` - Clear override
- `GET /status` - Get system state

## Troubleshooting

### ESP32-CAM won't connect
- Check 5V 2A power supply (USB may not be enough)
- Verify WiFi credentials
- Check antenna is connected
- Try reducing `XCLK_FREQ_HZ` to 10MHz

### YOLO model fails to load
- First run will download model (~6MB)
- Check internet connection
- Manually download from ultralytics.com

### Dashboard shows "Offline"
- Check `CAM_IP` and `DEV_IP` in `.env`
- Ping devices from laptop
- Check devices are on same WiFi network

### Supabase errors
- Verify URL and key
- Check tables exist in SQL Editor
- Ensure Realtime is enabled

## Project Structure

```
.
├── esp32cam/           # ESP32-CAM firmware
│   ├── main.ino
│   ├── config.h
│   ├── camera_config.h
│   └── ir_sensors.h
│
├── esp32dev/           # ESP32 Dev Board firmware
│   ├── main.ino
│   ├── config.h
│   ├── led_control.h
│   └── oled_display.h
│
├── laptop/             # Python backend
│   ├── main.py         # Main orchestration loop
│   ├── vision.py       # YOLOv8 detection
│   ├── fusion.py       # Sensor fusion
│   ├── decision.py     # Decision engine
│   ├── api_server.py   # Flask API
│   ├── supabase_client.py
│   ├── dashboard.py    # Streamlit UI
│   ├── config.py
│   ├── requirements.txt
│   ├── .env.example
│   └── tests/          # Test files
│
└── web/                # Next.js dashboard
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   └── globals.css
    ├── components/     # React components
    ├── lib/           # Supabase client, types
    ├── package.json
    └── next.config.js
```

## License

MIT License - Feel free to use for educational and commercial purposes.

## Demo Talking Points

**Hardware pitch:**
"The ESP32-CAM is our sealed edge node — it runs one firmware forever, serving live video and IR sensor data over WiFi. The ESP32 Dev Board is our physical actuator — it drives the traffic lights and OLED speed limit display on command."

**AI pitch:**
"Our fusion engine combines computer vision with physical sensor validation. A camera glitch alone cannot trigger a wrong decision — the IR sensors provide physical ground truth."

**Dashboard pitch:**
"Any traffic officer in the city can open this URL on their phone right now, see what the AI sees, and override the signal instantly if there is an incident. No special app, no login — just a URL."

**Cost pitch:**
"The entire hardware cost is under Rs 2000. This can be deployed at any junction in under 30 minutes."
