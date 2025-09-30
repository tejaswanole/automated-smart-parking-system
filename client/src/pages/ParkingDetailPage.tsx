import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/common/Layout";
import { useAuth } from "../hooks/useAuth";
import { useGeolocation } from "../hooks/useGeolocation";
import { useParkingUpdates } from "../hooks/useParkingUpdates";
import { getParkingById } from "../services/parkingService";
import { getUserVisits, recordVisit } from "../services/visitService";

export default function ParkingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { location: userLocation } = useGeolocation();
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const { data: parking, isLoading, error } = useQuery({
    queryKey: ["parking", id],
    queryFn: () => getParkingById(id!),
    enabled: !!id,
  });
  
  // Real-time parking updates
  const { getParkingUpdate, hasRecentUpdate, isConnected } = useParkingUpdates({
    parkingId: parking?.parkingId,
    autoJoin: true
  });

  // Get real-time parking update
  const realTimeUpdate = getParkingUpdate(parking?.parkingId || '');
  
  // Merge real-time data with static data
  const currentParking = parking ? {
    ...parking,
    ...(realTimeUpdate && {
      currentCount: realTimeUpdate.currentCount,
      availableSpaces: realTimeUpdate.availableSpaces,
      isFull: realTimeUpdate.isFull,
      lastUpdated: realTimeUpdate.lastUpdated,
    })
  } : null;

  // Fetch user's visits for this parking to determine if already checked in
  const { data: userVisitsForParking } = useQuery({
    queryKey: ["userVisitsForParking", id, user?._id],
    queryFn: () => getUserVisits({ parkingId: id!, limit: 5 }),
    enabled: !!id && !!user,
  });

  const isAlreadyCheckedIn = !!userVisitsForParking?.some(
    (visit: any) => visit?.parking?._id === id && (visit?.coinsEarned ?? 0) > 0
  );

  const handleCheckIn = async () => {
    if (!user || !currentParking || !userLocation) {
      toast.error("Unable to check in. Please ensure location access is enabled.");
      return;
    }

    setIsCheckingIn(true);
    try {
      const visitData = {
        parkingId: currentParking._id,
        location: {
          type: "Point" as const,
          coordinates: [userLocation.longitude, userLocation.latitude] as [number, number],
        },
        distance: 0, // This would be calculated based on distance from parking
      };

      await recordVisit(visitData);
      toast.success("Successfully checked in! You earned 10 coins.");
      // Invalidate queries to refresh data instead of page reload
      // This will be handled by the query client automatically
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to check in");
    } finally {
      setIsCheckingIn(false);
    }
  };

  const calculateDistance = (parkingCoords: [number, number], userCoords: [number, number]) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (userCoords[0] - parkingCoords[0]) * Math.PI / 180;
    const dLon = (userCoords[1] - parkingCoords[1]) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(parkingCoords[0] * Math.PI / 180) * Math.cos(userCoords[0] * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c * 1000); // Convert to meters
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
                <p className="mt-4 text-white text-lg">Loading parking details...</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !currentParking) {
    return (
      <Layout>
        <div className="p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <p className="text-red-400 text-lg">Parking not found</p>
                <button
                  onClick={() => navigate('/parkings')}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Back to Parkings
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const distance = userLocation && currentParking?.location.coordinates 
    ? calculateDistance(
        [currentParking.location.coordinates[1], currentParking.location.coordinates[0]], 
        [userLocation.latitude, userLocation.longitude]
      )
    : null;

  return (
    <Layout>
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white border-opacity-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-black">{currentParking.name}</h1>
                  {isConnected && realTimeUpdate && hasRecentUpdate(parking?.parkingId || '', 2) && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600 font-medium">Live</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-500">{currentParking.description}</p>
              </div>
              <button
                onClick={() => navigate('/parkings')}
                className="bg-gray-600 hover:bg-gray-700 font-bold text-white px-4 py-2 rounded-lg transition-colors"
              >
                ← Back to Parkings
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Status Card */}
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-black">Parking Status</h2>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      currentParking.isFull 
                        ? 'bg-red-500 bg-opacity-20 text-white' 
                        : 'bg-green-500 bg-opacity-20 text-white'
                    }`}>
                      {currentParking.isFull ? 'Full' : 'Available'}
                    </span>
                    {realTimeUpdate && (
                      <span className="text-xs text-gray-500">
                        Updated {new Date(realTimeUpdate.lastUpdated).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>
                
                {/*Total & Availability*/}
                <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                  <div className="text-center"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-black">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-black">Available</div>
                  </div>
                  <div className="text-2xl font-bold text-black">Car</div>
                  <div className="text-center">
                    <div className="text-center text-2xl">{currentParking.capacity?.car || 0}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-center text-2xl font-bold text-green-600">{currentParking.availableSpaces?.car || 0}</div>
                  </div>
                  <div className="text-2xl font-bold text-black">Bike</div>
                  <div className="text-center">
                    <div className="text-center text-2xl">{currentParking.capacity?.bike || 0}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-center text-2xl font-bold text-green-600">{currentParking.availableSpaces?.bike || 0}</div>
                  </div>
                  <div className="text-2xl font-bold text-black">Bus/Truck</div>
                  <div className="text-center">
                    <div className="text-center text-2xl">{currentParking.capacity?.bus_truck || 0}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-center text-2xl font-bold text-green-600">{currentParking.availableSpaces?.bus_truck || 0}</div>
                  </div>
                </div>
              </div>

              {/* Details Card */}
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                <h2 className="text-xl font-bold text-black mb-4">Parking Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-black text-sm">Type</label>
                    <p className="text-gray-500 font-medium capitalize">{currentParking.parkingType}</p>
                  </div>
                  <div>
                    <label className="text-black text-sm">Payment</label>
                    <p className="text-gray-500 font-medium capitalize">{currentParking.paymentType}</p>
                  </div>
                  <div>
                    <label className="text-black text-sm">Ownership</label>
                    <p className="text-gray-500 font-medium capitalize">{currentParking.ownershipType}</p>
                  </div>
                  <div>
                    <label className="text-black text-sm">Last Updated</label>
                    <p className="text-gray-500 font-medium">
                      {new Date(currentParking.lastUpdated).toLocaleString()}
                    </p>
                  </div>
                </div>

                {currentParking.location.address && (
                  <div className="mt-4">
                    <label className="text-black text-sm">Address</label>
                    <p className="text-gray-500 font-medium">
                      {currentParking.location.address.street}, {currentParking.location.address.city}, {currentParking.location.address.state}
                    </p>
                  </div>
                )}

                {distance !== null && (
                  <div className="mt-4">
                    <label className="text-black text-sm">Distance from you</label>
                    <p className="text-gray-500 font-medium">{distance}m away</p>
                  </div>
                )}
              </div>

              {/* Rates Card */}
              {currentParking.paymentType === 'paid' && (
                <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                  <h2 className="text-xl font-semibold text-black mb-4">Hourly Rates</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-700">{currentParking.hourlyRate?.car || 0} Coins</div>
                      <div className="text-gray-500 text-sm">Per Hour (Car)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-700">{currentParking.hourlyRate?.bike || 0} Coins</div>
                      <div className="text-gray-500 text-sm">Per Hour (Bike)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-700">{currentParking.hourlyRate?.bus_truck || 0} Coins</div>
                      <div className="text-gray-500 text-sm">Per Hour (Bus/Truck)</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Check-in Card */}
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                <h2 className="text-xl font-bold text-black mb-4">Check In</h2>
                <p className="text-gray-500  mb-4">
                  Check in to earn coins and track your parking visits
                </p>
                <button
                  onClick={handleCheckIn}
                  disabled={
                    isCheckingIn ||
                    currentParking.isFull ||
                    !userLocation ||
                    isAlreadyCheckedIn
                  }
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg transition-colors"
                >
                  {isCheckingIn
                    ? 'Checking In...'
                    : isAlreadyCheckedIn
                    ? 'Already Checked In'
                    : 'Check In & Earn Coins'}
                </button>
                {!userLocation && (
                  <p className="text-red-400 text-xs mt-2">
                    Location access required for check-in
                  </p>
                )}
                {isAlreadyCheckedIn && (
                  <p className="text-gray-300 text-xs mt-2">
                    You have already earned coins for this parking.
                  </p>
                )}
              </div>

              {/* Owner Info */}
              {currentParking.owner && (
                <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                  <h2 className="text-xl font-semibold text-black mb-4">Parking Owner</h2>
                  <div className="space-y-2">
                    <div>
                      <label className="text-black text-sm">Name</label>
                      <p className="text-gray-500 font-medium">{currentParking.owner.name}</p>
                    </div>
                    <div>
                      <label className="text-black text-sm">Email</label>
                      <p className="text-gray-500 font-medium">{currentParking.owner.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Statistics */}
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                <h2 className="text-xl font-semibold text-black mb-4">Statistics</h2>
                <div className="space-y-3">
                  <div className="flex justify-items-end-safe">
                    <span className="text-gray-800">Total Visits :</span>
                    <span className="text-gray-500 font-medium">- {currentParking.statistics?.totalVisits || 0}</span>
                  </div>
                  <div className="flex justify-items-end-safe">
                    <span className="text-gray-800">Average Occupancy :</span>
                    <span className="text-gray-500 font-medium">- {currentParking.statistics?.averageOccupancy || 0}%</span>
                  </div>
                  <div className="flex justify-items-end-safe">
                    <span className="text-gray-800">Current Occupancy :</span>
                    <span className="text-gray-500 font-medium">- {currentParking.occupancyPercentage || 0}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}