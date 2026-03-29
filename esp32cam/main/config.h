#ifndef CONFIG_H
#define CONFIG_H

// ============================================================
// WIFI CREDENTIALS - CONNECT TO ESP32 DEV BOARD AP
// ============================================================
const char* WIFI_SSID = "TrafficSignal_Dev";
const char* WIFI_PASSWORD = "12345678";

// ============================================================
// SERVER SETTINGS
// ============================================================
const int SERVER_PORT = 80;

// ============================================================
// IR SENSOR PINS (AI-Thinker ESP32-CAM - Only 3 free GPIOs)
// ============================================================
const int IR_SENSOR_1_PIN = 2;   // 25% queue / near lane
const int IR_SENSOR_2_PIN = 4;   // 50% queue / mid lane
const int IR_SENSOR_3_PIN = 16;  // 75% queue / far lane

// ============================================================
// CAMERA SETTINGS
// ============================================================
// OV2640 camera pins for AI-Thinker ESP32-CAM
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27

#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

// ============================================================
// SENSOR SETTINGS
// ============================================================
const int SENSOR_DEBOUNCE_MS = 50;  // Debounce delay for IR sensors
const unsigned long SENSOR_READ_INTERVAL_MS = 100;  // Read sensors every 100ms

#endif // CONFIG_H
