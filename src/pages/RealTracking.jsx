import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, Marker, Polyline, useLoadScript } from '@react-google-maps/api';
import { db } from '../firebase';
import { collection, getDocs, onSnapshot, orderBy, query } from 'firebase/firestore';
import Navbar from '../components/Navbar';

const mapContainerStyle = { width: '100%', height: '500px' };

export default function RealTracking() {
  const [location, setLocation] = useState({ lat: 0, lng: 0 });
  const [path, setPath] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [contacts, setContacts] = useState([]);
  const navigate = useNavigate();

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyAiW07DVil-H7A-kPYhKbyM8vyP6iTmi1w',
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      const contactsSnap = await getDocs(collection(db, 'EmergencyContacts'));
      const petsSnap = await getDocs(query(collection(db, 'GPSData'), orderBy('timestamp', 'desc')));

      if (!contactsSnap.empty) {
        setContacts(contactsSnap.docs.map(doc => doc.data()));
      }

      if (!petsSnap.empty) {
        const all = petsSnap.docs.map(doc => doc.data());
        if (all.length > 0) {
          setLocation({ lat: all[0].latitude, lng: all[0].longitude });
          setPath(all.map(p => ({ lat: p.latitude, lng: p.longitude })).reverse());
        }
      }
    };

    fetchProfileData();

    const anomalyQuery = query(collection(db, 'Anomalies'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(anomalyQuery, (snapshot) => {
      setAnomalies(snapshot.docs.map(doc => doc.data()));
    });

    return () => unsub();
  }, []);

  return (
    <div className="bg-gray-100 text-gray-800 min-h-screen overflow-x-hidden">
      <Navbar onDogClick={() => navigate('/map')} />

      {/* Hero Section */}
      <section className="h-screen bg-cover bg-center flex flex-col justify-center items-center text-white relative" style={{ backgroundImage: "url('/homepage.jpeg')" }}>
        <div className="bg-black bg-opacity-50 w-full h-full absolute top-0 left-0"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl font-extrabold mb-4 drop-shadow-lg">Welcome to Pet Pulse</h1>
          <p className="text-xl drop-shadow-sm mb-6">Track your furry friend's safety and movements in real-time.</p>
        </div>
      </section>

      {/* Real-Time Tracking */}
      <section className="py-10 px-6 md:px-20">
        <h2 className="text-3xl font-bold text-pink-600 mb-6">📍 Real-Time Movement</h2>
        <div className="w-full" style={{ minHeight: '500px' }}>
          {isLoaded && location.lat !== 0 && location.lng !== 0 ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              zoom={16}
              center={location}
              mapTypeId="satellite"
            >
              <Polyline
                path={path}
                options={{
                  strokeColor: '#ff69b4',
                  strokeOpacity: 0.6,
                  strokeWeight: 3,
                  icons: [{
                    icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 4 },
                    offset: '0',
                    repeat: '20px',
                  }],
                }}
              />
              <Marker
                position={location}
                icon={{
                  url: '/paw-logo.jpg',
                  scaledSize:
                    isLoaded && window.google
                      ? new window.google.maps.Size(45, 45)
                      : undefined,
                }}
              />
            </GoogleMap>
          ) : (
            <div className="text-center text-gray-500 py-10">
              Loading map...
            </div>
          )}
        </div>
      </section>

      {/* AI Anomaly Reports */}
      <section className="bg-white py-10 px-6 md:px-20">
        <h2 className="text-2xl font-bold text-red-600 mb-4">🧠 AI Anomaly Reports</h2>
        {anomalies.length === 0 ? (
          <p>No anomalies detected.</p>
        ) : (
          anomalies.map((a, i) => (
            <div key={i} className="border-b border-gray-200 py-2">
              <p><strong>{a.petID}</strong> - {a.reason} (<span className="text-red-500">{a.severity}</span>)</p>
            </div>
          ))
        )}
      </section>

      {/* Emergency Contact Section */}
      <section className="bg-gray-50 py-10 px-6 md:px-20">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">🚓 Emergency Contacts</h2>
        {contacts.map((c, i) => (
          <div key={i} className="border-b border-gray-300 py-2">
            <p><strong>Name:</strong> {c.ownerName}</p>
            <p><strong>Phone:</strong> {c.phone}</p>
            <p><strong>Location:</strong> {c.address || 'Not specified'}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
