import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { useEffect, useState } from 'react';

const mapContainerStyle = {
  width: '100vw',
  height: '100vh',
};

const center = {
  lat: 40.7128,
  lng: -74.0060,
};

export default function MapDashboard() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyDP2vPp_dmDcCPLbPCHA47i7A5oGblvSKo" // Replace with your key
  });

  const [location, setLocation] = useState(center);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition((pos) => {
      setLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      });
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  if (!isLoaded) return <div className="text-white text-center mt-10">Loading Map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      zoom={15}
      center={location}
    >
      <Marker position={location} icon="/logo.png" />
    </GoogleMap>
  );
}
