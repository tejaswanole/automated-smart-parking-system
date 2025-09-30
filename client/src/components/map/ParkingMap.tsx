import { useQuery } from '@tanstack/react-query';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { useGeolocation } from '../../hooks/useGeolocation';
import { getAllParkings } from '../../services/parkingService';
import { getApprovedRequests } from '../../services/requestService';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom parking marker icons
const createParkingIcon = (isAvailable: boolean) => {
  return L.divIcon({
    className: 'custom-parking-marker',
    html: `<div class="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${
      isAvailable ? 'bg-green-500' : 'bg-red-500'
    }">
      <span class="text-white text-xs font-bold">P</span>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const createNoParkingIcon = () => {
  return L.divIcon({
    className: 'custom-no-parking-marker',
    html: `<div class="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center bg-red-600">
      <span class="text-white text-[10px] font-bold">NP</span>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Component to center map on user location
function MapCenter({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, 15);
    }
  }, [center, map]);
  
  return null;
}

interface ParkingMapProps {
  onParkingSelect?: (parking: any) => void;
  showUserLocation?: boolean;
  searchTerm?: string;
}

export default function ParkingMap({ onParkingSelect, showUserLocation = true, searchTerm = '' }: ParkingMapProps) {
  const { data: parkings, isLoading, error } = useQuery({
    queryKey: ['parkings'],
    queryFn: () => getAllParkings(),
  });
  const { data: noParkingData } = useQuery({
    queryKey: ['no-parking-requests', 'approved'],
    queryFn: () => getApprovedRequests({ requestType: 'no_parking', limit: 200 }),
  });
  

  const handleGoToMap = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, "_blank");
  };

  const { location: userLocation, loading: locationLoading } = useGeolocation();
  const [mapCenter, setMapCenter] = useState<[number, number]>([18.4636, 73.8682]); // San Francisco default
  
  useEffect(() => {
    if (userLocation && !locationLoading) {
      setMapCenter([userLocation.latitude, userLocation.longitude]);
    }
  }, [userLocation, locationLoading]);

  if (isLoading) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading parking locations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load parking data</p>
          <p className="text-gray-600 text-sm">Please check your network connection</p>
        </div>
      </div>
    );
  }

  const parkingListRaw = parkings?.parkings || [];
  const parkingList = searchTerm
    ? parkingListRaw.filter((p: any) =>
        (p.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (p.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (p.location?.address?.street?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      )
    : parkingListRaw;
  const noParkingList = (noParkingData?.requests ?? noParkingData ?? []).filter((r: any) => r.location?.coordinates?.length === 2);

  return (
    <div className="relative">
      <MapContainer
        center={mapCenter}
        zoom={13}
        className="h-96 w-full rounded-lg"
        style={{ zIndex: 1 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {showUserLocation && userLocation && !locationLoading && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={L.divIcon({
              className: 'user-location-marker',
              html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            })}
          >
            <Popup>
              <div className="text-center">
                <p className="font-medium">Your Location</p>
              </div>
            </Popup>
          </Marker>
        )}

        {parkingList.map((parking: any) => (
          <Marker
            key={parking._id}
            position={[parking.location.coordinates[1], parking.location.coordinates[0]]}
            icon={createParkingIcon(!parking.isFull)}
            eventHandlers={{
                click: () => {},
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg mb-2">{parking.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{parking.description}</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="capitalize">{parking.parkingType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment:</span>
                    <span className="capitalize">{parking.paymentType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={parking.isFull ? 'text-red-600' : 'text-green-600'}>
                      {parking.isFull ? 'Full' : 'Available'}
                    </span>
                  </div>
                  {parking.availableSpaces && (
                    <>
                    <div className="flex  ">
                        <span className="text-black">Available Car Slots:</span>
                        <span className="text-green-600 font-bold">- {parking.availableSpaces.car} cars</span>
                      </div>
                      <div className="flex  ">
                        <span className="text-black">Available Bike Slots:</span>
                        <span className="text-green-600 font-bold">- {parking.availableSpaces.bike} bikes</span>
                      </div>
                      <div className="flex  ">
                        <span className="text-black">Available Bus/Truck Slots:</span>
                        <span className="text-green-600 font-bold">- {parking.availableSpaces.bus_truck} bus/trucks</span>
                      </div>
                    </>
                  )}
                </div>
                {onParkingSelect && (
                  <>
                  <button
                    onClick={() => onParkingSelect(parking)}
                    className="mt-3 w-full bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </button>
                  <div className="my-2"></div>
                  <button
                    onClick={() => handleGoToMap(parking.location.coordinates[1], parking.location.coordinates[0])}
                    className="w-full bg-green-600 font-bold hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Go To
                  </button>
                </>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {noParkingList.map((req: any) => (
          <Marker
            key={req._id}
            position={[req.location.coordinates[1], req.location.coordinates[0]]}
            icon={createNoParkingIcon()}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg mb-1">No Parking Zone</h3>
                <p className="text-gray-600 text-sm mb-1">{req.title}</p>
                <p className="text-gray-600 text-xs">Approved on {new Date(req.approvedAt || req.updatedAt).toLocaleDateString()}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        <MapCenter center={mapCenter} />
      </MapContainer>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-10 space-y-2">
        <button
          onClick={() => {
            if (userLocation && !locationLoading) {
              setMapCenter([userLocation.latitude, userLocation.longitude]);
            }
          }}
          className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
          title="Center on my location"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-white bg-opacity-90 backdrop-blur-sm p-3 rounded-lg shadow-lg">
        <div className="text-sm font-medium mb-2">Legend</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Full</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <span>No Parking Zone</span>
          </div>
          {showUserLocation && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Your Location</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}