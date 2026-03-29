#ifndef OLED_DISPLAY_H
#define OLED_DISPLAY_H

#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "config.h"
#include "led_control.h"

// ============================================================
// OLED DISPLAY OBJECT
// ============================================================
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// ============================================================
// INITIALIZE OLED DISPLAY
// ============================================================
void setupOLED() {
  Wire.begin(OLED_SDA_PIN, OLED_SCL_PIN);

  if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDRESS)) {
    Serial.println("OLED initialization failed! Trying alternate address 0x3D...");
    // Try alternate address
    if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3D)) {
      Serial.println("OLED not found! Check wiring.");
      return;
    }
  }

  display.clearDisplay();
  display.setTextSize(2);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("TRAFFIC");
  display.println("SYSTEM");
  display.display();

  Serial.println("OLED display initialized");
}

// ============================================================
// SHOW SPEED LIMIT ON DISPLAY
// ============================================================
void showSpeedLimit(int speedLimit) {
  display.clearDisplay();

  // Draw border
  display.drawRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, SSD1306_WHITE);

  // Draw "SPEED" text at top
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(SCREEN_WIDTH / 2 - 20, 5);
  display.println("SPEED");

  // Draw speed limit (large number in center)
  display.setTextSize(3);
  display.setCursor(SCREEN_WIDTH / 2 - 15, 20);
  display.println(speedLimit);

  // Draw "km/h" text at bottom
  display.setTextSize(1);
  display.setCursor(SCREEN_WIDTH / 2 - 18, 50);
  display.println("km/h");

  display.display();
}

// ============================================================
// SHOW STARTUP SCREEN
// ============================================================
void showStartup() {
  display.clearDisplay();

  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("ADAPTIVE");
  display.println("TRAFFIC");
  display.println("SYSTEM");
  display.println("");
  display.println("Connecting...");

  display.display();
}

// ============================================================
// SHOW CONNECTION SUCCESSFUL
// ============================================================
void showConnected(String ipAddress) {
  display.clearDisplay();

  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("CONNECTED!");
  display.println("");
  display.print("IP:");
  display.println(ipAddress);
  display.println("");
  display.println("Ready...");

  display.display();
}

// ============================================================
// SHOW OFFLINE MESSAGE
// ============================================================
void showOffline() {
  display.clearDisplay();

  display.setTextSize(2);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 20);
  display.println("OFFLINE");

  display.display();
}

// ============================================================
// SHOW SIGNAL STATUS
// ============================================================
void showSignalStatus() {
  display.clearDisplay();

  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("SIGNAL:");

  display.setTextSize(2);
  display.setCursor(0, 15);

  String signalName = getSignalName(currentSignal);
  display.println(signalName);

  display.setTextSize(1);
  display.setCursor(0, 40);
  display.print("Duration: ");
  display.print(currentDuration);
  display.println("s");

  display.display();
}

#endif // OLED_DISPLAY_H
