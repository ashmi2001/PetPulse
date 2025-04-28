const axios = require("axios");

const testData = {
  latitude: 40.712776,
  longitude: -74.005974,
  timestamp: new Date().toISOString(),
  deviceId: "esp32_test_yash"
};

axios.post("http://localhost:3000/storeGPS", testData)
  .then((res) => {
    console.log("✅ GPS Data sent successfully:", res.data);
  })
  .catch((err) => {
    console.error("❌ Error sending GPS Data:", err.message);
  });
