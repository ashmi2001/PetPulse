const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const fs = require("fs");

// Read Firebase Admin SDK Key
const serviceAccount = JSON.parse(fs.readFileSync("./firebaseConfig.json", "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const app = express();
app.use(cors());
app.use(express.json());

// app.post("/storeGPS", async (req, res) => {
//   try {
//     const { latitude, longitude } = req.body;

//     if (!latitude || !longitude) {
//       return res.status(400).json({ success: false, message: "Missing latitude or longitude" });
//     }

//     await db.collection("GPSData").add({
//       latitude,
//       longitude,
//       timestamp: Date.now(),
//     });

//     res.json({ success: true, message: "GPS Data Stored Successfully" });
//   } catch (error) {
//     console.error("Error storing GPS data:", error);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// });
app.post("/storeGPS", async (req, res) => {
    try {
      const { latitude, longitude } = req.body;
      console.log("Received GPS data:", latitude, longitude);
  
      if (!latitude || !longitude) {
        console.log("Missing lat/lng in request.");
        return res.status(400).json({ success: false, message: "Missing latitude or longitude" });
      }
  
      await db.collection("GPSData").add({
        latitude,
        longitude,
        timestamp: Date.now(),
      });
  
      res.json({ success: true, message: "GPS Data Stored Successfully" });
    } catch (error) {
      console.error("Error storing GPS data:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  });  
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
