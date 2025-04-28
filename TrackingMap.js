// TrackingMap.js
import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { trackPetLocation } from './petService';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const TrackingMap = ({ userId, petId }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY"
  });

  const [location, setLocation] = useState(null);

  useEffect(() => {
    if (userId &&
