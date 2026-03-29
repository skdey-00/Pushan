#ifndef IR_SENSORS_H
#define IR_SENSORS_H

#include <Arduino.h>
#include "config.h"

// ============================================================
// IR SENSOR STATE STRUCTURE
// ============================================================
struct SensorState {
  bool s25;  // Sensor at 25% distance (near lane)
  bool s50;  // Sensor at 50% distance (mid lane)
  bool s75;  // Sensor at 75% distance (far lane)
};

SensorState currentSensorState = {0, 0, 0};
unsigned long lastSensorRead = 0;

// Forward declaration
SensorState readIRSensors();

// ============================================================
// INITIALIZE IR SENSORS
// ============================================================
void setupIRSensors() {
  pinMode(IR_SENSOR_1_PIN, INPUT_PULLUP);
  pinMode(IR_SENSOR_2_PIN, INPUT_PULLUP);
  pinMode(IR_SENSOR_3_PIN, INPUT_PULLUP);

  Serial.println("========================================");
  Serial.println("IR Sensors configured:");
  Serial.printf("  Sensor 1 (25%%): GPIO %d\n", IR_SENSOR_1_PIN);
  Serial.printf("  Sensor 2 (50%%): GPIO %d\n", IR_SENSOR_2_PIN);
  Serial.printf("  Sensor 3 (75%%): GPIO %d\n", IR_SENSOR_3_PIN);
  Serial.println("Mode: PULLUP (LOW = vehicle detected)");
  Serial.println("========================================");

  // Read initial state
  SensorState initialState = readIRSensors();
  Serial.printf("Initial sensor state: s25=%d s50=%d s75=%d\n",
                initialState.s25, initialState.s50, initialState.s75);

  if (initialState.s50 == 1) {
    Serial.println(">>> NOTE: Sensor 2 reading HIGH (vehicle detected)");
    Serial.println("    If no sensor connected, this is normal (floating pin)");
  }
}

// ============================================================
// READ IR SENSORS WITH DEBOUNCING
// ============================================================
SensorState readIRSensors() {
  SensorState state;
  unsigned long currentTime = millis();

  // Only read at specified interval
  if (currentTime - lastSensorRead < SENSOR_READ_INTERVAL_MS) {
    return currentSensorState;
  }
  lastSensorRead = currentTime;

  // FC-51 IR sensor: LOW = vehicle detected, HIGH = clear
  // Using digitalRead() with PULLUP means:
  // - LOW (0) = sensor triggered (vehicle detected)
  // - HIGH (1) = sensor clear (no vehicle)

  int raw1 = digitalRead(IR_SENSOR_1_PIN);
  int raw2 = digitalRead(IR_SENSOR_2_PIN);
  int raw3 = digitalRead(IR_SENSOR_3_PIN);

  // Invert logic: LOW from sensor = vehicle detected (1)
  state.s25 = (raw1 == LOW) ? 1 : 0;
  state.s50 = (raw2 == LOW) ? 1 : 0;
  state.s75 = (raw3 == LOW) ? 1 : 0;

  currentSensorState = state;

  return state;
}

// ============================================================
// GET SENSOR STATE AS JSON STRING
// ============================================================
String getSensorsJSON() {
  SensorState state = readIRSensors();
  // Use snprintf for better memory efficiency
  char buffer[64];
  snprintf(buffer, sizeof(buffer), "{\"s25\":%d,\"s50\":%d,\"s75\":%d}",
           state.s25 ? 1 : 0, state.s50 ? 1 : 0, state.s75 ? 1 : 0);
  return String(buffer);
}

#endif // IR_SENSORS_H
