const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const serviceAccount = require('../firebaseConfig.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function exportGPSData(deviceId = 'esp32_test_yash') {
  const now = new Date();
  const lastWeek = new Date(now - 7 * 24 * 60 * 60 * 1000);

  const snapshot = await db.collection('GPSData')
    .where('deviceId', '==', deviceId)
    .where('timestamp', '>=', lastWeek.toISOString())
    .get();

  const rows = [];
  snapshot.forEach(doc => {
    const d = doc.data();
    rows.push(`${d.timestamp},${d.latitude},${d.longitude}`);
  });

  const csv = "timestamp,latitude,longitude\n" + rows.join("\n");
  fs.writeFileSync(path.join(__dirname, 'outcomes/last7days.csv'), csv);
  console.log("✅ GPS history saved to outcomes/last7days.csv");
}

exportGPSData();
