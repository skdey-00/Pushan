/*
 * ============================================================
 * ADAPTIVE TRAFFIC SIGNAL SYSTEM - ESP32 DEV BOARD
 * ============================================================
 * Functions:
 *  - Control RGB traffic lights (Red/Yellow/Green)
 *  - Display speed limit on OLED
 *  - Accept commands via HTTP POST /cmd
 *
 * Hardware: ESP32 Dev Board + 3x LEDs + SSD1306 OLED
 *
 * API Endpoint:
 *  POST /cmd - Body: {"signal":"RED|YELLOW|GREEN", "duration":int, "speed_limit":int}
 *
 * ============================================================
 */

#include "WiFi.h"
#include "WebServer.h"
#include <ArduinoJson.h>
#include "config.h"
#include "led_control.h"
#include "oled_display.h"

// ============================================================
// WEB SERVER
// ============================================================
WebServer server(SERVER_PORT);

// ============================================================
// SETUP FUNCTION
// ============================================================
void setup() {
  Serial.begin(115200);
  Serial.println();
  Serial.println("========================================");
  Serial.println("Adaptive Traffic Signal - ESP32 Dev Board");
  Serial.println("========================================");

  // Initialize WiFi Access Point
  Serial.println("Starting WiFi Access Point...");
  Serial.print("AP SSID: ");
  Serial.println(AP_SSID);
  Serial.print("AP Password: ");
  Serial.println(AP_PASSWORD);

  WiFi.mode(WIFI_AP);
  WiFi.softAPConfig(AP_LOCAL_IP, AP_GATEWAY, AP_SUBNET);
  WiFi.softAP(AP_SSID, AP_PASSWORD);

  Serial.println("\nAccess Point started!");
  Serial.print("Dev Board IP: ");
  Serial.println(AP_LOCAL_IP);
  Serial.print("Connect to: ");
  Serial.println(AP_SSID);
  Serial.print("Then open: http://");
  Serial.println(AP_LOCAL_IP);

  // Initialize LEDs
  setupLEDs();

  // Initialize OLED
  setupOLED();
  showStartup();

  // Setup HTTP endpoints
  setupServer();

  // Start server
  server.begin();
  Serial.println("HTTP server started");

  // Show connected state on OLED
  showConnected(AP_LOCAL_IP.toString());
  delay(2000);

  // Set initial signal to RED
  setSignal(SIGNAL_RED, 10);
  showSpeedLimit(30);

  Serial.println("Ready to receive commands!");
  Serial.println("========================================");
}

// ============================================================
// MAIN LOOP
// ============================================================
void loop() {
  server.handleClient();
  updateSignal();
}

// ============================================================
// HTTP ENDPOINT HANDLERS
// ============================================================

// Handler: POST /cmd - Accept command JSON
void handleCommand() {
  Serial.println("Received command");

  // Check if body exists
  if (!server.hasArg("plain")) {
    server.send(400, "application/json", "{\"error\":\"No body\"}");
    return;
  }

  String body = server.arg("plain");
  Serial.println("Body: " + body);

  // Parse JSON
  DynamicJsonDocument doc(256);
  DeserializationError error = deserializeJson(doc, body);

  if (error) {
    Serial.println("JSON parse error: " + String(error.c_str()));
    server.send(400, "application/json", "{\"error\":\"Invalid JSON\"}");
    return;
  }

  // Extract values
  String signalStr = doc["signal"];
  int duration = doc["duration"];
  int speedLimit = doc["speed_limit"];

  // Validate signal
  signalStr.toUpperCase();
  SignalType signal;
  if (signalStr == "RED") {
    signal = SIGNAL_RED;
  } else if (signalStr == "YELLOW") {
    signal = SIGNAL_YELLOW;
  } else if (signalStr == "GREEN") {
    signal = SIGNAL_GREEN;
  } else {
    server.send(400, "application/json", "{\"error\":\"Invalid signal\"}");
    return;
  }

  // Validate speed limit
  if (speedLimit < 20 || speedLimit > 80) {
    server.send(400, "application/json", "{\"error\":\"Invalid speed_limit\"}");
    return;
  }

  // Set signal
  setSignal(signal, duration > 0 ? duration : 10);

  // Update OLED with speed limit
  showSpeedLimit(speedLimit);

  // Send response
  String response = "{\"status\":\"ok\",\"signal\":\"" + signalStr + "\"";
  response += ",\"duration\":" + String(duration);
  response += ",\"speed_limit\":" + String(speedLimit) + "}";

  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", response);

  Serial.println("Command executed: " + signalStr + " for " + String(duration) + "s, limit " + String(speedLimit) + "km/h");
}

// Handler: GET / - Root endpoint with system info
void handleRoot() {
  String json = getCurrentSignalState();
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", json);
}

// Handler: OPTIONS - CORS preflight
void handleOptions() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
  server.send(200);
}

// Handler: 404 Not Found
void handleNotFound() {
  server.send(404, "text/plain", "Not Found");
}

// ============================================================
// SERVER SETUP
// ============================================================
void setupServer() {
  // Register endpoints
  server.on("/cmd", HTTP_POST, handleCommand);
  server.on("/cmd", HTTP_OPTIONS, handleOptions);
  server.on("/", HTTP_GET, handleRoot);

  // 404 handler
  server.onNotFound(handleNotFound);

  // Enable CORS
  server.enableCORS(true);
}
