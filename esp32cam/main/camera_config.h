#ifndef CAMERA_CONFIG_H
#define CAMERA_CONFIG_H

#include "config.h"
#include "esp_camera.h"

// External flag to track camera status
extern bool cameraInitialized;

// ============================================================
// CAMERA CONFIGURATION
// ============================================================
// Configure camera settings for OV2640
void setupCamera() {
  Serial.println("Checking for camera module...");

  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  config.frame_size = FRAMESIZE_QVGA;
  config.jpeg_quality = 12;
  config.fb_count = 1;

  // Try to initialize camera
  Serial.println("Attempting camera initialization...");
  esp_err_t err = esp_camera_init(&config);

  if (err != ESP_OK) {
    Serial.printf("Camera not detected (error 0x%x)\n", err);
    Serial.println(">>> CAMERA MODULE NOT CONNECTED <<<");
    Serial.println("System will continue in sensor-only mode");
    Serial.println("To use camera: Connect OV2640 camera module to ESP32-CAM board");
    cameraInitialized = false;
    return;
  }

  // Camera detected - configure it
  Serial.println("Camera module detected!");
  cameraInitialized = true;

  sensor_t * s = esp_camera_sensor_get();
  if (s) {
    s->set_brightness(s, 0);
    s->set_contrast(s, 0);
    s->set_saturation(s, 0);
    s->set_whitebal(s, 1);
    s->set_awb_gain(s, 1);
    s->set_aec2(s, 1);
    s->set_aec_value(s, 300);
    s->set_gainceiling(s, GAINCEILING_8X);
    s->set_bpc(s, 0);
    s->set_wpc(s, 1);
    s->set_raw_gma(s, 1);
    s->set_lenc(s, 1);
    s->set_hmirror(s, 0);
    s->set_vflip(s, 0);
    s->set_dcw(s, 1);
    s->set_colorbar(s, 0);
  }

  Serial.println("Camera initialized successfully!");
}

#endif // CAMERA_CONFIG_H
