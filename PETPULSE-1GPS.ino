#include <WiFi.h>
#include <FirebaseESP32.h>
#include <TinyGPS++.h>
#include <HardwareSerial.h>

//  WiFi Credentials
const char* ssid = "173 South Apt 2";
const char* password = "Monkeys@7";

//  Firebase Credentials
#define FIREBASE_HOST "hhttps://petpulse-31f91-default-rtdb.firebaseio.com"
#define FIREBASE_API_KEY "AIzaSyD6753J_fU7XVssZiz4b-Dk_hQqDjzouMs"
#define FIREBASE_USER_EMAIL "ruchirarajage34@gmail.com"
#define FIREBASE_USER_PASSWORD "KrishnaLove@170901"

//  GPS Module on UART2
TinyGPSPlus gps;
HardwareSerial gpsSerial(2);

//  Firebase Objects
FirebaseData firebaseData;
FirebaseAuth auth;
FirebaseConfig config;

void setup() {
    Serial.begin(115200);
    gpsSerial.begin(9600, SERIAL_8N1, 16, 17);  //  Keep the correct baud rate for the GPS module

    //  Connect to WiFi
    Serial.print("Connecting to WiFi...");
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        Serial.print(".");
        delay(1000);
    }
    Serial.println("\n WiFi Connected!");

    //  Configure Firebase
    config.host = FIREBASE_HOST;
    config.api_key = FIREBASE_API_KEY;
    Firebase.begin(&config, &auth);
    Firebase.reconnectWiFi(true);

    if (Firebase.signUp(&config, &auth, FIREBASE_USER_EMAIL, FIREBASE_USER_PASSWORD)) {
        Serial.println(" Firebase Authentication Successful!");
    } else {
        Serial.println(" Firebase Authentication Failed: " + String(config.signer.signupError.message.c_str()));
    }
}

void loop() {
    while (gpsSerial.available()) {
        gps.encode(gpsSerial.read());
    }

    if (gps.location.isUpdated()) {
        float latitude = gps.location.lat();
        float longitude = gps.location.lng();

        Serial.print(" Latitude: "); Serial.println(latitude, 6);
        Serial.print(" Longitude: "); Serial.println(longitude, 6);

        //  Send GPS data to Firebase
        String path = "/GPS";
        if (Firebase.setFloat(firebaseData, (path + "/Latitude").c_str(), latitude)) {
            Serial.println(" Latitude uploaded!");
        } else {
            Serial.println(" Error sending Latitude: " + String(firebaseData.errorReason()));
        }

        if (Firebase.setFloat(firebaseData, (path + "/Longitude").c_str(), longitude)) {
            Serial.println(" Longitude uploaded!");
        } else {
            Serial.println(" Error sending Longitude: " + String(firebaseData.errorReason()));
        }

        Serial.println(" Data sent successfully!");
    } else {
        Serial.println(" Waiting for GPS signal...");
    }

    delay(20000);  //  Update every 20 seconds
}
