import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, Marker, Polyline, useLoadScript } from '@react-google-maps/api';
import { db } from '../firebase';
import { collection, getDocs, onSnapshot, orderBy, query } from 'firebase/firestore';
import Navbar from '../components/Navbar';

const mapContainerStyle = { width: '100%', height: '500px' };

export default function DashboardHome() {
  const [owner, setOwner] = useState({});
  const [pet, setPet] = useState({});
  const [location, setLocation] = useState({ lat: 0, lng: 0 });
  const [path, setPath] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [contacts, setContacts] = useState([]);
  const navigate = useNavigate();
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyDP2vPp_dmDcCPLbPCHA47i7A5oGblvSKo',
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      const contactsSnap = await getDocs(collection(db, 'EmergencyContacts'));
      const petsSnap = await getDocs(query(collection(db, 'GPSData'), orderBy('timestamp', 'desc')));

      if (!contactsSnap.empty) {
        const contact = contactsSnap.docs[0].data();
        setOwner(contact);
        setContacts(contactsSnap.docs.map(doc => doc.data()));
      }

      if (!petsSnap.empty) {
        const all = petsSnap.docs.map(doc => doc.data());
        setPet({ id: 'pet1', device: 'Device-001' });
        setLocation({ lat: all[0].latitude, lng: all[0].longitude });
        setPath(all.map(p => ({ lat: p.latitude, lng: p.longitude })).reverse());
      }
    };

    fetchProfileData();

    const anomalyQuery = query(collection(db, 'Anomalies'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(anomalyQuery, (snapshot) => {
      setAnomalies(snapshot.docs.map(doc => doc.data()));
    });

    return () => unsub();
  }, []);

  const scrollToProfile = () => {
    const profileSection = document.getElementById('profile');
    if (profileSection) profileSection.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePetIdClick = () => {
    navigate('/profile-details');
  };

  const handleDogIdClick = () => {
    navigate('/map');
  };

  return (
    <div className="bg-gray-100 text-gray-800 min-h-screen overflow-x-hidden">
      <Navbar onDogClick={handleDogIdClick} />

      {/* Hero Section */}
      <section className="h-screen bg-cover bg-center flex flex-col justify-center items-center text-white relative" style={{ backgroundImage: "url('/homepage.jpeg')" }}>
        <div className="bg-black bg-opacity-50 w-full h-full absolute top-0 left-0"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl font-extrabold mb-4 drop-shadow-lg">Welcome to Pet Pulse</h1>
          <p className="text-xl drop-shadow-sm mb-6">Track your furry friend's safety and movements in real-time.</p>
          <button
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-full shadow-lg text-lg"
            onClick={scrollToProfile}
          >
            View Profile
          </button>
        </div>
      </section>

      {/* Profile Section */}
      <section id="profile" className="bg-white py-12 px-6 md:px-20">
        <h2 className="text-3xl font-bold text-pink-600 mb-6">👤 Owner & Pet Profile</h2>
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <h3 className="text-xl font-semibold mb-2">Owner Details</h3>
            <p><strong>Name:</strong> {owner.ownerName}</p>
            <p><strong>Email:</strong> {owner.email || 'example@email.com'}</p>
            <p><strong>Phone:</strong> {owner.phone}</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Pet Details</h3>
            <p>
              <strong>Pet ID:</strong>{' '}
              <span
                className="text-blue-600 underline cursor-pointer hover:text-blue-800"
                onClick={handlePetIdClick}
              >
                {pet.id}
              </span>
            </p>
            <p><strong>Device ID:</strong> {pet.device}</p>
          </div>
        </div>
      </section>

      {/* Real-Time Tracking */}
      <section className="py-10 px-6 md:px-20">
        <h2 className="text-3xl font-bold text-pink-600 mb-6">📍 Real-Time Movement</h2>
        {isLoaded && (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={16}
            center={location}
            mapTypeId="satellite"
          >
            <Polyline path={path} options={{ strokeColor: '#ff69b4', strokeOpacity: 0.6, strokeWeight: 3, icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 4 }, offset: '0', repeat: '20px' }] }} />
            <Marker
              position={location}
              icon={{ url: '/paw-logo.jpg', scaledSize: new window.google.maps.Size(45, 45) }}
            />
          </GoogleMap>
        )}
      </section>

      {/* AI Anomaly Reports */}
      <section className="bg-white py-10 px-6 md:px-20">
        <h2 className="text-2xl font-bold text-red-600 mb-4">🧠 AI Anomaly Reports</h2>
        {anomalies.length === 0 ? <p>No anomalies detected.</p> : anomalies.map((a, i) => (
          <div key={i} className="border-b border-gray-200 py-2">
            <p><strong>{a.petID}</strong> - {a.reason} (<span className="text-red-500">{a.severity}</span>)</p>
          </div>
        ))}
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

      {/* Support Section */}
      <section className="bg-white py-10 px-6 md:px-20 text-center">
        <h2 className="text-2xl font-bold text-purple-600 mb-4">📞 Get Support</h2>
        <p className="text-md">Need help? Contact our support team at <strong>support@petpulse.com</strong> or call <strong>+1-800-555-PAWS</strong></p>
      </section>

      {/* Logout Section */}
      <section className="bg-red-50 py-6 px-6 md:px-20 text-center">
        <button
          onClick={() => window.location.href = '/login'}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full shadow-lg text-lg"
        >
          🔒 Logout
        </button>
      </section>
    </div>
  );
}
