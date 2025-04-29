import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, Polyline, useLoadScript } from '@react-google-maps/api';
import { db } from '../firebase';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import Chatbot from '../components/Chatbot';

const mapContainerStyle = { width: '100%', height: '500px' };

export default function DashboardHome() {
  const [location, setLocation] = useState({ lat: 0, lng: 0 });
  const [path, setPath] = useState([]);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyAiW07DVil-H7A-kPYhKbyM8vyP6iTmi1w',
  });

  useEffect(() => {
    const fetchTrackingData = async () => {
      const twelveHoursAgo = Date.now() - 12 * 60 * 60 * 1000;
      const gpsSnap = await getDocs(
        query(collection(db, 'GPSData'), where('timestamp', '>=', twelveHoursAgo), orderBy('timestamp'))
      );
      const all = gpsSnap.docs.map(doc => doc.data());
      if (all.length) {
        setLocation({ lat: all[all.length - 1].latitude, lng: all[all.length - 1].longitude });
        setPath(all.map(p => ({ lat: p.latitude, lng: p.longitude })));
      }
    };

    fetchTrackingData();
  }, []);

  const scrollToMap = () => {
    const section = document.getElementById('tracking');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-gray-100 text-gray-800 min-h-screen overflow-y-auto">
      <Navbar />

      {/* ✅ Fixed Hero Section */}
      <section
        className="min-h-[80vh] bg-cover bg-center flex flex-col justify-center items-center text-white relative"
        style={{ backgroundImage: "url('/homepage.jpeg')" }}
      >
        <div className="absolute inset-0 bg-black/40 z-0" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl font-extrabold mb-4 drop-shadow-lg">Welcome to Pet Pulse</h1>
          <p className="text-xl drop-shadow-sm mb-6">Real-time dog safety & activity tracker.</p>
          <button
            onClick={scrollToMap}
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-full shadow-lg mt-4"
          >
            ↓ View Tracking
          </button>
        </div>
      </section>

      {/* ✅ Tracking Section Anchored */}
      <section id="tracking" className="py-10 px-6 md:px-20 bg-white">
        <h2 className="text-3xl font-bold text-pink-600 mb-6">📍 Real-Time Movement (Last 12 Hours)</h2>
        {isLoaded && (
          <GoogleMap mapContainerStyle={mapContainerStyle} zoom={16} center={location} mapTypeId="satellite">
            <Polyline path={path} options={{ strokeColor: '#ff69b4', strokeOpacity: 0.6, strokeWeight: 3 }} />
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
        )}
      </section>

      <Chatbot />
    </div>
  );
}
