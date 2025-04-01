// #include <WiFi.h>
// #include <HTTPClient.h>
// #include <TinyGPS++.h>
// #include <HardwareSerial.h>

// // WiFi Credentials
// const char* ssid = "Hutton Bois";
// const char* password = "Hutton@61#3";

// // Server endpoint (change to your server IP)
// const char* serverURL = "http://192.168.1.205:3000/storeGPS";  // Replace with actual server IP

// // GPS module connection (use Serial2)
// #define RXD2 16
// #define TXD2 17
// #define GPS_BAUD 9600

// TinyGPSPlus gps;
// HardwareSerial gpsSerial(2);

// void connectToWiFi() {
//   Serial.println("Connecting to WiFi...");
//   WiFi.begin(ssid, password);

//   int retries = 20;
//   while (WiFi.status() != WL_CONNECTED && retries > 0) {
//     delay(1000);
//     Serial.print(".");
//     retries--;
//   }

//   if (WiFi.status() == WL_CONNECTED) {
//     Serial.println("\nWiFi Connected!");
//     Serial.print("📡 IP Address: ");
//     Serial.println(WiFi.localIP());
//   } else {
//     Serial.println("\n WiFi Connection Failed.");
//     ESP.restart();
//   }
// }

// void sendGPSData(float latitude, float longitude) {
//   if (WiFi.status() == WL_CONNECTED) {
//     HTTPClient http;
//     http.begin(serverURL);
//     http.addHeader("Content-Type", "application/json");

//     String payload = "{\"latitude\":" + String(latitude, 6) + ", \"longitude\":" + String(longitude, 6) + "}";
//     int responseCode = http.POST(payload);

//     Serial.print(" Sending GPS Data... Response Code: ");
//     Serial.println(responseCode);

//     http.end();
//   } else {
//     Serial.println(" Not connected to WiFi!");
//   }
// }

// void setup() {
//   Serial.begin(115200);
//   gpsSerial.begin(9600, SERIAL_8N1, 16, 17);
//   connectToWiFi();
//   Serial.println(" GPS Module ready.");
// }

// void loop() {
//   while (gpsSerial.available() > 0) {
//     gps.encode(gpsSerial.read());
//   }

//   if (gps.location.isUpdated()) {
//     float lat = gps.location.lat();
//     float lng = gps.location.lng();

//     Serial.println("\n New Location:");
//     Serial.print("Latitude: ");
//     Serial.println(lat, 6);
//     Serial.print("Longitude: ");
//     Serial.println(lng, 6);

//     sendGPSData(lat, lng);
//   } else {
//     Serial.println(" Waiting for GPS fix...");
//   }

//   delay(5000);  // Delay between updates
// }

#include <WiFi.h>
#include <HTTPClient.h>
#include <TinyGPS++.h>
#include <HardwareSerial.h>

// WiFi Credentials
const char* ssid = "Goldy8";
const char* password = "12345678";

// Server Endpoint
const char* serverURL = "http://172.20.10.2:3000/storeGPS";  

// GPS Settings
#define RXD2 16
#define TXD2 17
#define GPS_BAUD 9600

TinyGPSPlus gps;
HardwareSerial gpsSerial(2);

void connectToWiFi() {
  Serial.println(" Connecting to WiFi...");
  WiFi.begin(ssid, password);

  int retries = 20;
  while (WiFi.status() != WL_CONNECTED && retries-- > 0) {
    delay(1000);
    Serial.print(".");
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n WiFi Connected!");
    Serial.print(" IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n WiFi Connection Failed. Restarting...");
    delay(2000);
    ESP.restart();
  }
}

void sendGPSData(float lat, float lng) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");

    String payload = "{\"latitude\":" + String(lat, 6) + ", \"longitude\":" + String(lng, 6) + "}";
    int response = http.POST(payload);

    Serial.print(" Data sent to server. HTTP Response: ");
    Serial.println(response);
    
    http.end();
  } else {
    Serial.println(" WiFi not connected.");
  }
}

void setup() {
  Serial.begin(115200);
  gpsSerial.begin(GPS_BAUD, SERIAL_8N1, RXD2, TXD2);
  connectToWiFi();
  Serial.println(" GPS module ready...");
}

void loop() {
  while (gpsSerial.available()) {
    gps.encode(gpsSerial.read());
  }

  if (gps.location.isUpdated()) {
    float latitude = gps.location.lat();
    float longitude = gps.location.lng();

    Serial.println("\n GPS Fix Acquired:");
    Serial.print("Latitude: ");
    Serial.println(latitude, 6);
    Serial.print("Longitude: ");
    Serial.println(longitude, 6);

    sendGPSData(latitude, longitude);
  } else {
    Serial.println(" Waiting for GPS fix...");
  }

  delay(5000);
}

