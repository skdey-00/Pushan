/*
 * ============================================================
 * ADAPTIVE TRAFFIC SIGNAL SYSTEM - ESP32-CAM NODE
 * ============================================================
 * Functions:
 *  - Capture camera frames (OV2640)
 *  - Read IR sensors for queue detection
 *  - Serve MJPEG stream over HTTP
 *  - Provide sensor data via REST API
 *
 * Hardware: AI-Thinker ESP32-CAM + 3x FC-51 IR Sensors
 *
 * API Endpoints:
 *  GET  /stream  - Returns JPEG frame (image/jpeg)
 *  GET  /sensors - Returns JSON: {"s25":int, "s50":int, "s75":int}
 *
 * ============================================================
 */

#include "WiFi.h"
#include "WebServer.h"
#include "esp_camera.h"
#include "config.h"
#include "camera_config.h"
#include "ir_sensors.h"

// ============================================================
// WEB SERVER
// ============================================================
WebServer server(SERVER_PORT);

// ============================================================
// CAMERA STATUS
// ============================================================
bool cameraInitialized = false;

// ============================================================
// SETUP FUNCTION
// ============================================================
void setup() {
  Serial.begin(115200);
  delay(1000);  // Wait for Serial to settle
  Serial.println();
  Serial.println("========================================");
  Serial.println("Adaptive Traffic Signal - ESP32-CAM Node");
  Serial.println("========================================");
  Serial.println("Serial monitor: Set to 115200 baud");

  // Show free heap before WiFi
  Serial.printf("Free heap before WiFi: %u bytes\n", ESP.getFreeHeap());

  // Initialize WiFi as Station
  Serial.println("Starting WiFi...");
  Serial.print("Connecting to: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false);  // Disable WiFi sleep for stability

  Serial.println("Beginning WiFi connection...");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  // Connection loop with watchdog-friendly delays
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 40) {
    delay(100);
    yield();  // Feed watchdog
    if (attempts % 5 == 0) {
      Serial.print(".");
    }
    attempts++;
  }

  // Show connection result
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n========================================");
    Serial.println("WiFi connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.printf("Free heap after WiFi: %u bytes\n", ESP.getFreeHeap());
  } else {
    Serial.println("\nWiFi connection FAILED!");
    Serial.println("Check: 1) Dev Board is powered on");
    Serial.println("        2) Dev Board AP 'TrafficSignal_Dev' is visible");
    Serial.println("        3) Password is correct: 12345678");
    Serial.println("Continuing anyway...");
  }

  // Initialize camera
  Serial.println("========================================");
  setupCamera();

  // Initialize IR sensors
  setupIRSensors();

  // Setup HTTP endpoints
  setupServer();

  // Start server
  server.begin();
  Serial.println("HTTP server started");
  Serial.println("========================================");
  Serial.println("SERVER READY AND LISTENING");
  Serial.printf("Access via browser: http://%s/\n", WiFi.localIP().toString().c_str());
  Serial.println("Endpoints available:");
  Serial.println("  /         - Status page");
  Serial.println("  /sensors  - JSON sensor data");
  Serial.println("  /stream   - Camera feed (if available)");
  Serial.println("========================================");
}

// ============================================================
// MAIN LOOP
// ============================================================
void loop() {
  server.handleClient();

  // Read sensors (keeps state updated)
  SensorState state = readIRSensors();

  // Print sensor state every 5 seconds (using single printf to avoid buffer issues)
  static unsigned long lastPrint = 0;
  if (millis() - lastPrint > 5000) {
    Serial.printf("Sensors: s25=%d s50=%d s75=%d | Heap: %u bytes\n",
                  state.s25, state.s50, state.s75, ESP.getFreeHeap());
    lastPrint = millis();
  }
}

// ============================================================
// HTTP ENDPOINT HANDLERS
// ============================================================

// Handler: /stream - Returns single JPEG frame
void handleStream() {
  Serial.println("========================================");
  Serial.println(">>> Client connected to /stream endpoint");

  // Check if camera is initialized
  if (!cameraInitialized) {
    Serial.println(">>> ERROR: Camera not available");
    server.send(503, "text/plain", "Camera not available");
    return;
  }

  // Capture frame from camera
  Serial.println(">>> Capturing frame...");
  camera_fb_t * fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println(">>> ERROR: Camera capture failed - NULL framebuffer");
    server.send(500, "text/plain", "Camera capture failed");
    return;
  }

  Serial.printf(">>> Frame info:\n");
  Serial.printf("    - Size: %d bytes\n", fb->len);
  Serial.printf("    - Width: %d pixels\n", fb->width);
  Serial.printf("    - Height: %d pixels\n", fb->height);
  Serial.printf("    - Format: %d\n", fb->format);

  // Check if frame size is reasonable
  if (fb->len < 100) {
    Serial.println(">>> WARNING: Frame size too small, camera may not be working properly");
  }

  // Get client and send HTTP headers + body
  WiFiClient client = server.client();

  Serial.println(">>> Sending HTTP headers...");
  // Send HTTP response headers
  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: image/jpeg");
  client.println("Content-Disposition: inline; filename=capture.jpg");
  client.printf("Content-Length: %d\r\n", fb->len);
  client.println("Access-Control-Allow-Origin: *");
  client.println("Connection: close");
  client.println();

  Serial.println(">>> Sending JPEG data...");
  // Send JPEG binary data
  client.write(fb->buf, fb->len);
  client.flush();

  // Return frame buffer
  esp_camera_fb_return(fb);

  Serial.println(">>> Frame sent successfully!");
  Serial.println("========================================");
}

// Handler: /sensors - Returns JSON with sensor states
void handleSensors() {
  Serial.println(">>> Client connected to /sensors endpoint");
  String json = getSensorsJSON();
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", json);
  Serial.println(">>> Sensor data sent: " + json);
}

// Handler: / - Root endpoint with system info
void handleRoot() {
  Serial.println(">>> Client connected to / endpoint");
  String html = "<html><head><title>ESP32-CAM Traffic Node</title>";
  html += "<style>body{font-family:Arial;margin:40px;}h1{color:#333;}";
  html += ".info{background:#f0f0f0;padding:20px;border-radius:8px;margin:20px 0;}";
  html += "a{display:inline-block;padding:10px 20px;background:#007bff;";
  html += "color:white;text-decoration:none;border-radius:5px;margin:5px;}";
  html += "a:hover{background:#0056b3;}</style></head><body>";
  html += "<h1>ESP32-CAM Traffic Node</h1>";
  html += "<div class='info'>";
  html += "<p><strong>Status:</strong> Online</p>";
  html += "<p><strong>Camera:</strong> " + String(cameraInitialized ? "Ready" : "Not Available") + "</p>";
  html += "<p><strong>IP Address:</strong> " + WiFi.localIP().toString() + "</p>";
  html += "<p><strong>Free Memory:</strong> " + String(ESP.getFreeHeap() / 1024) + " KB</p>";
  html += "</div>";
  html += "<h3>Available Endpoints:</h3>";
  html += "<a href='/stream'>/stream</a> - Live video feed<br><br>";
  html += "<a href='/sensors'>/sensors</a> - IR sensor data (JSON)";
  html += "</body></html>";
  server.send(200, "text/html", html);
  Serial.println(">>> Response sent to client");
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
  server.on("/stream", HTTP_GET, handleStream);
  server.on("/sensors", HTTP_GET, handleSensors);
  server.on("/", HTTP_GET, handleRoot);

  // 404 handler
  server.onNotFound(handleNotFound);

  // Enable CORS for all requests
  server.enableCORS(true);
}
