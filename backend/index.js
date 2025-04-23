const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const fs = require("fs");

const serviceAccount = require("./firebaseConfig.json");
const { sendSMS } = require("./alertService"); // ✅ Import Twilio SMS alert handler

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const app = express();
app.use(cors());
app.use(express.json());

// ✅ Define safe zone
const SAFE_ZONE_CENTER = { lat: 40.7425, lng: -74.0260 }; // Replace with your base location
const SAFE_RADIUS_METERS = 300; // 300 meter radius

function calculateDistanceMeters(coord1, coord2) {
  const R = 6371e3;
  const φ1 = (coord1.lat * Math.PI) / 180;
  const φ2 = (coord2.lat * Math.PI) / 180;
  const Δφ = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const Δλ = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

app.post("/storeGPS", async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    console.log("📡 Received GPS data:", latitude, longitude);

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: "Missing latitude or longitude" });
    }

    const timestamp = Date.now();
    const position = { lat: latitude, lng: longitude };
    const distance = calculateDistanceMeters(SAFE_ZONE_CENTER, position);

    // Store to GPSData
    await db.collection("GPSData").add({
      latitude,
      longitude,
      timestamp,
    });

    // Anomaly + SMS
    if (distance > SAFE_RADIUS_METERS) {
      await db.collection("Anomalies").add({
        petID: "pet1",
        reason: "Exited safe zone",
        severity: "high",
        timestamp,
      });

      console.log("🚨 Pet exited safe zone – anomaly recorded.");

      const alertMsg = `🚨 Pet Alert:\nYour dog exited the safe zone!\nLocation:\nLat: ${latitude}, Lng: ${longitude}`;
      await sendSMS(alertMsg); // ✅ Trigger SMS alert
    }

    res.json({ success: true, message: "GPS Data Stored Successfully" });
  } catch (error) {
    console.error("❌ Error storing GPS data:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 PetPulse backend running on port ${PORT}`));