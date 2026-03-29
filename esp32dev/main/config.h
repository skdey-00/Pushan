#ifndef CONFIG_H
#define CONFIG_H

// ============================================================
// WIFI ACCESS POINT SETTINGS
// ============================================================
const char* AP_SSID = "TrafficSignal_Dev";
const char* AP_PASSWORD = "12345678";
const IPAddress AP_LOCAL_IP(192, 168, 4, 1);
const IPAddress AP_GATEWAY(192, 168, 4, 1);
const IPAddress AP_SUBNET(255, 255, 255, 0);

// ============================================================
// SERVER SETTINGS
// ============================================================
const int SERVER_PORT = 80;

// ============================================================
// LED PINS (ESP32 Dev Board)
// ============================================================
const int RED_LED_PIN = 25;     // Red LED → GPIO 25
const int YELLOW_LED_PIN = 26;  // Yellow LED → GPIO 26
const int GREEN_LED_PIN = 27;   // Green LED → GPIO 27

// ============================================================
// OLED DISPLAY SETTINGS (I2C)
// ============================================================
const int OLED_SDA_PIN = 21;    // I2C SDA
const int OLED_SCL_PIN = 22;    // I2C SCL
const int OLED_ADDRESS = 0x3C;  // I2C address (try 0x3D if blank)
const int SCREEN_WIDTH = 128;   // OLED display width (pixels)
const int SCREEN_HEIGHT = 64;   // OLED display height (pixels)

// ============================================================
// SIGNAL SETTINGS
// ============================================================
const int SIGNAL_UPDATE_INTERVAL_MS = 100;  // Check signal state every 100ms
const unsigned long DEFAULT_DURATION_MS = 10000;  // Default 10 seconds

#endif // CONFIG_H
