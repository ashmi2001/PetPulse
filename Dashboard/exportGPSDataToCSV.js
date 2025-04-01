const admin = require("firebase-admin");
const fs = require("fs");
const { Parser } = require("json2csv");

// Initialize Firebase Admin SDK
const serviceAccount = require("./firebaseConfig.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function exportToCSV() {
  const gpsDataRef = db.collection("GPSData");
  const snapshot = await gpsDataRef.get();

  if (snapshot.empty) {
    console.log("No data found.");
    return;
  }

  const gpsArray = [];

  snapshot.forEach(doc => {
    const data = doc.data();
    gpsArray.push({
      id: doc.id,
      latitude: data.latitude,
      longitude: data.longitude,
      timestamp: new Date(data.timestamp).toISOString()
    });
  });

  const parser = new Parser();
  const csv = parser.parse(gpsArray);

  fs.writeFileSync("GPS_Report.csv", csv);
  console.log("CSV file generated: GPS_Report.csv");
}

exportToCSV();
