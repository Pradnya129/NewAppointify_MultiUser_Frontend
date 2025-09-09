'use client'
import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

const center = {
  lat: 18.5204, // Pune as default
  lng: 73.8567,
};

const LocationPicker = ({ onLocationSelect }) => {
  const [markerPosition, setMarkerPosition] = useState(null);

  useEffect(() => {
    console.log(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY); // Log the API key for debugging
  }, []);
  const handleMapClick = useCallback((event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setMarkerPosition({ lat, lng });
    onLocationSelect({ latitude: lat, longitude: lng });
  }, [onLocationSelect]);

  return (
   <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={12}
        center={center}
        onClick={handleMapClick}
      >
        {markerPosition && <Marker position={markerPosition} />}
      </GoogleMap>
    </LoadScript>
  );
};

export default LocationPicker;
