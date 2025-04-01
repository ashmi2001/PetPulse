// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAiW07DVil-H7A-kPYhKbyM8vyP6iTmi1w",
  authDomain: "petpulse17.firebaseapp.com",
  projectId: "petpulse17",
  storageBucket: "petpulse17.firebasestorage.app",
  messagingSenderId: "1015263179162",
  appId: "1:1015263179162:web:4e075b1f6cfc1079ab8a23",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Google Map Setup
let map;
let marker;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 16,
    center: { lat: 0, lng: 0 },
  });

  marker = new google.maps.Marker({
    position: { lat: 0, lng: 0 },
    map: map,
    title: "Pet Location",
  });

  db.collection("GPSData").orderBy("timestamp", "desc").limit(1).get().then(snapshot => {
    if (!snapshot.empty) {
      const latest = snapshot.docs[0].data();
      const latLng = { lat: latest.latitude, lng: latest.longitude };
      map.setCenter(latLng);
      marker.setPosition(latLng);
    }
  });
}

window.initMap = initMap;

// Live GPS Stream
db.collection("GPSData").orderBy("timestamp", "desc").limit(5)
  .onSnapshot(snapshot => {
    const gpsDiv = document.getElementById("gpsData");
    gpsDiv.innerHTML = "";

    snapshot.forEach((doc, index) => {
      const data = doc.data();
      const time = new Date(data.timestamp).toLocaleString();
      gpsDiv.innerHTML += `<p>${data.latitude}, ${data.longitude} @ ${time}</p>`;

      if (index === 0 && map && marker) {
        const position = { lat: data.latitude, lng: data.longitude };
        map.setCenter(position);
        marker.setPosition(position);
      }
    });
  });

// Anomalies
db.collection("Anomalies").orderBy("timestamp", "desc").limit(5)
  .onSnapshot(snapshot => {
    const anomaliesDiv = document.getElementById("anomalies");
    anomaliesDiv.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      anomaliesDiv.innerHTML += `<p>${data.petID}: ${data.reason} - ${data.severity}</p>`;
    });
  });

// Emergency Contacts
const contactsDiv = document.getElementById("contacts");
db.collection("EmergencyContacts").get().then(snapshot => {
  contactsDiv.innerHTML = "";
  snapshot.forEach(doc => {
    const data = doc.data();
    contactsDiv.innerHTML += `<p>${data.ownerName}: ${data.phone}</p>`;
  });
});

// 7-Day Location History with Reverse Geocoding
async function fetch7DayHistory() {
  const historyDiv = document.getElementById("history");
  historyDiv.innerHTML = "<h3>Past 7 Days Location History</h3><ul id='historyList'></ul>";

  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  try {
    const snapshot = await db.collection("GPSData")
      .where("timestamp", ">=", oneWeekAgo)
      .orderBy("timestamp", "desc")
      .get();

    const list = document.getElementById("historyList");

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const time = new Date(data.timestamp).toLocaleString();
      const locationName = await reverseGeocode(data.latitude, data.longitude);

      const item = document.createElement("li");
      item.innerHTML = `<strong>${locationName}</strong><br>${data.latitude}, ${data.longitude} @ ${time}`;
      item.style.cursor = "pointer";
      item.onclick = () => {
        const position = { lat: data.latitude, lng: data.longitude };
        if (map && marker) {
          map.setCenter(position);
          map.setZoom(18);
          marker.setPosition(position);
        }
      };

      list.appendChild(item);
    }

    historyDiv.innerHTML += `<br><a href="week-history.html" target="_blank"> View Full Week History</a>`;
  } catch (err) {
    console.error("Error loading history:", err);
    historyDiv.innerHTML += "<li>Error loading data</li></ul>";
  }
}

async function reverseGeocode(lat, lng) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyAiW07DVil-H7A-kPYhKbyM8vyP6iTmi1w`;
  try {
    const response = await fetch(url);
    const json = await response.json();
    return json.results[0]?.formatted_address || "Unknown location";
  } catch (err) {
    return "Failed to get location";
  }
}

window.addEventListener("load", fetch7DayHistory);
