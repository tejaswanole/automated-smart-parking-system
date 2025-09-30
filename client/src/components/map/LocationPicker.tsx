import { useGeolocation } from '../../hooks/useGeolocation';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents, useMap } from 'react-leaflet';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
  onLocationSelect: (coordinates: [number, number]) => void;
  initialLocation?: [number, number];
  className?: string;
}

// Component to handle map clicks
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (coordinates: [number, number]) => void }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect([lng, lat]); // Note: coordinates are [longitude, latitude]
    },
  });
  return null;
}

// Component to center map on user location
function MapCenter({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView([center[1], center[0]], 15); // Note: Leaflet expects [lat, lng]
    }
  }, [center, map]);
  
  return null;
}

export default function LocationPicker({ onLocationSelect, initialLocation, className = "h-64" }: LocationPickerProps) {
  const { location: userLocation, loading: locationLoading } = useGeolocation();
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(
    initialLocation || null
  );
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.7749, -122.4194]); // San Francisco default

  // Set initial map center
  useEffect(() => {
    if (initialLocation) {
      setMapCenter([initialLocation[1], initialLocation[0]]); // Convert [lng, lat] to [lat, lng]
      setSelectedLocation(initialLocation);
    } else if (userLocation && !locationLoading) {
      const coords: [number, number] = [userLocation.longitude, userLocation.latitude];
      setMapCenter([userLocation.latitude, userLocation.longitude]);
      setSelectedLocation(coords);
      onLocationSelect(coords);
    }
  }, [userLocation, locationLoading, initialLocation, onLocationSelect]);

  const handleLocationSelect = (coordinates: [number, number]) => {
    setSelectedLocation(coordinates);
    onLocationSelect(coordinates);
  };

  const handleUseCurrentLocation = () => {
    if (userLocation && !locationLoading) {
      const coords: [number, number] = [userLocation.longitude, userLocation.latitude];
      setSelectedLocation(coords);
      setMapCenter([userLocation.latitude, userLocation.longitude]);
      onLocationSelect(coords);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-gray-500 text-sm font-medium">
          Select Location
        </label>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={locationLoading || !userLocation}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm transition-colors"
        >
          {locationLoading ? 'Getting Location...' : 'Use My Location'}
        </button>
      </div>
      
      <div className="relative">
        <MapContainer
          center={mapCenter}
          zoom={13}
          className={className}
          style={{ zIndex: 1 }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          <MapClickHandler onLocationSelect={handleLocationSelect} />
          
          {selectedLocation && (
            <Marker
              position={[selectedLocation[1], selectedLocation[0]]} // Convert [lng, lat] to [lat, lng]
              icon={L.divIcon({
                className: 'custom-location-marker',
                html: `<div class="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                  <span class="text-white text-xs font-bold">📍</span>
                </div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
              })}
            />
          )}

          <MapCenter center={mapCenter} />
        </MapContainer>

        {/* Instructions */}
        <div className="absolute bottom-2 left-2 z-10 bg-white bg-opacity-90 backdrop-blur-sm p-2 rounded shadow-lg">
          <p className="text-xs text-gray-600">
            Click on the map to select location
          </p>
        </div>
      </div>

      {selectedLocation && (
        <div className="text-sm text-gray-600">
          <p>Selected coordinates:</p>
          <p className="font-mono">
            Lat: {selectedLocation[1].toFixed(6)}, Lng: {selectedLocation[0].toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
}
