
import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

const containerStyle = {
  width: '100vw',
  height: '100vh',
};

export default function MapDashboard() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyDP2vPp_dmDcCPLbPCHA47i7A5oGblvSKo',
  });

  const [location, setLocation] = useState({ lat: 0, lng: 0 });

  useEffect(() => {
    const q = query(collection(db, 'GPSData'), orderBy('timestamp', 'desc'), limit(1));
    const unsub = onSnapshot(q, (snapshot) => {
      const latest = snapshot.docs[0]?.data();
      if (latest) {
        setLocation({ lat: latest.latitude, lng: latest.longitude });
      }
    });

    return () => unsub();
  }, []);

  if (!isLoaded) return <div className="p-10 text-center text-gray-500">Loading map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={location}
      zoom={16}
      mapTypeId="satellite"
    >
      <Marker
        position={location}
        icon={{
          url: '/paw-logo.jpg',
          scaledSize: new window.google.maps.Size(50, 50),
        }}
      />
    </GoogleMap>
  );
}