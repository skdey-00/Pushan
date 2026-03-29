#ifndef LED_CONTROL_H
#define LED_CONTROL_H

#include <Arduino.h>
#include "config.h"

// ============================================================
// SIGNAL TYPE ENUM
// ============================================================
enum SignalType {
  SIGNAL_RED,
  SIGNAL_YELLOW,
  SIGNAL_GREEN
};

// ============================================================
// CURRENT STATE
// ============================================================
SignalType currentSignal = SIGNAL_RED;
int currentDuration = DEFAULT_DURATION_MS / 1000;  // in seconds
unsigned long signalStartTime = 0;
bool signalActive = true;

// ============================================================
// INITIALIZE LED PINS
// ============================================================
void setupLEDs() {
  pinMode(RED_LED_PIN, OUTPUT);
  pinMode(YELLOW_LED_PIN, OUTPUT);
  pinMode(GREEN_LED_PIN, OUTPUT);

  // Start with all LEDs off
  digitalWrite(RED_LED_PIN, LOW);
  digitalWrite(YELLOW_LED_PIN, LOW);
  digitalWrite(GREEN_LED_PIN, LOW);

  Serial.println("LEDs initialized (all off)");
}

// ============================================================
// TURN OFF ALL LEDs
// ============================================================
void allLEDsOff() {
  digitalWrite(RED_LED_PIN, LOW);
  digitalWrite(YELLOW_LED_PIN, LOW);
  digitalWrite(GREEN_LED_PIN, LOW);
}

// ============================================================
// SET TRAFFIC SIGNAL
// ============================================================
void setSignal(SignalType signal, int durationSeconds = 0) {
  allLEDsOff();

  currentSignal = signal;

  // Update duration if provided (non-zero)
  if (durationSeconds > 0) {
    currentDuration = durationSeconds;
  }

  signalStartTime = millis();
  signalActive = true;

  switch (signal) {
    case SIGNAL_RED:
      digitalWrite(RED_LED_PIN, HIGH);
      Serial.println("Signal: RED");
      break;
    case SIGNAL_YELLOW:
      digitalWrite(YELLOW_LED_PIN, HIGH);
      Serial.println("Signal: YELLOW");
      break;
    case SIGNAL_GREEN:
      digitalWrite(GREEN_LED_PIN, HIGH);
      Serial.println("Signal: GREEN");
      break;
  }
}

// ============================================================
// GET SIGNAL NAME AS STRING
// ============================================================
String getSignalName(SignalType signal) {
  switch (signal) {
    case SIGNAL_RED: return "RED";
    case SIGNAL_YELLOW: return "YELLOW";
    case SIGNAL_GREEN: return "GREEN";
    default: return "UNKNOWN";
  }
}

// ============================================================
// GET CURRENT SIGNAL STATE
// ============================================================
String getCurrentSignalState() {
  String json = "{\"signal\":\"";
  json += getSignalName(currentSignal);
  json += "\",\"duration\":";
  json += currentDuration;
  json += ",\"remaining\":";

  unsigned long elapsed = millis() - signalStartTime;
  int remaining = currentDuration - (elapsed / 1000);
  if (remaining < 0) remaining = 0;

  json += remaining;
  json += "}";
  return json;
}

// ============================================================
// UPDATE SIGNAL IN LOOP (auto-reset if duration expires)
// ============================================================
void updateSignal() {
  if (!signalActive) return;

  unsigned long elapsed = millis() - signalStartTime;

  // Check if duration has expired
  if (elapsed >= (currentDuration * 1000UL)) {
    // Default to RED when duration expires
    Serial.println("Signal duration expired, setting to RED");
    setSignal(SIGNAL_RED, currentDuration);
  }
}

#endif // LED_CONTROL_H
