// src/pages/FullProfileMap.jsx
import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import Navbar from '../components/Navbar';

export default function FullProfileMap() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyDP2vPp_dmDcCPLbPCHA47i7A5oGblvSKo',
  });

  const [owner, setOwner] = useState({});
  const [pet, setPet] = useState({});
  const [location, setLocation] = useState({ lat: 0, lng: 0 });

  useEffect(() => {
    const fetchDetails = async () => {
      const contactsSnap = await getDocs(collection(db, 'EmergencyContacts'));
      const petsSnap = await getDocs(query(collection(db, 'GPSData'), orderBy('timestamp', 'desc'), limit(1)));

      if (!contactsSnap.empty) {
        const contact = contactsSnap.docs[0].data();
        setOwner(contact);
      }

      if (!petsSnap.empty) {
        const data = petsSnap.docs[0].data();
        setPet({ id: 'pet1', device: 'Device-001' });
        setLocation({ lat: data.latitude, lng: data.longitude });
      }
    };

    fetchDetails();
  }, []);

  if (!isLoaded) return <div className="p-10 text-center">Loading Map...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6 md:p-10 grid md:grid-cols-2 gap-10 mt-20">
        {/* Owner and Pet Info */}
        <div>
          <h2 className="text-3xl font-bold text-pink-600 mb-4">👤 Owner & Pet Profile</h2>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold mb-2">Owner</h3>
            <p><strong>Name:</strong> {owner.ownerName}</p>
            <p><strong>Email:</strong> {owner.email}</p>
            <p><strong>Phone:</strong> {owner.phone}</p>

            <h3 className="text-xl font-semibold mt-6 mb-2">Pet</h3>
            <p><strong>Pet ID:</strong> {pet.id}</p>
            <p><strong>Device ID:</strong> {pet.device}</p>
            <p><strong>Location:</strong> {location.lat}, {location.lng}</p>
          </div>
        </div>

        {/* Google Map */}
        <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-lg">
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            zoom={16}
            center={location}
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
        </div>
      </div>
    </div>
  );
}
