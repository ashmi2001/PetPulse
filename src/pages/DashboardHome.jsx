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
    googleMapsApiKey: 'YOUR_API_KEY', // Replace with your actual API key
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

  return (
    <div className="bg-gray-100 text-gray-800 min-h-screen overflow-x-hidden">
      <Navbar />
      {/* Hero */}
      <section
        className="h-[85vh] bg-cover bg-center flex flex-col justify-center items-center text-white relative"
        style={{ backgroundImage: "url('/homepage.jpeg')" }}
      >
        <div className="bg-black bg-opacity-40 w-full h-full absolute top-0 left-0" />
        <div className="relative z-10 text-center">
          <h1 className="text-5xl font-extrabold mb-4 drop-shadow-lg">Welcome to Pet Pulse</h1>
          <p className="text-xl drop-shadow-sm mb-6">Real-time dog safety & activity tracker.</p>
        </div>
      </section>

      {/* Map */}
      <section className="py-10 px-6 md:px-20">
        <h2 className="text-3xl font-bold text-pink-600 mb-6">📍 Real-Time Movement (Last 12 Hours)</h2>
        {isLoaded && (
          <GoogleMap mapContainerStyle={mapContainerStyle} zoom={16} center={location} mapTypeId="satellite">
            <Polyline path={path} options={{ strokeColor: '#ff69b4', strokeOpacity: 0.6, strokeWeight: 3 }} />
            <Marker
              position={location}
              icon={{ url: '/paw-logo.jpg', scaledSize: window.google?.maps ? new window.google.maps.Size(45, 45) : undefined }}
            />
          </GoogleMap>
        )}
      </section>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}
