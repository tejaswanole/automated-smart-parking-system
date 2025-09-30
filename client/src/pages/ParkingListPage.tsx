import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/common/Layout";
import ParkingMap from "../components/map/ParkingMap";
import { useDebounce } from "../hooks/useDebounce";
import { useParkingUpdates } from "../hooks/useParkingUpdates";
import { getAllParkings } from "../services/parkingService";
import { getApprovedRequests } from "../services/requestService";

export default function ParkingListPage() {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [filters, setFilters] = useState({
    parkingType: '',
    paymentType: '',
    isFull: '',
    search: ''
  });
  const navigate = useNavigate();
  
  // Debounce search to prevent excessive API calls
  const debouncedSearch = useDebounce(filters.search, 300);
  
  // Real-time parking updates for all parkings
  const { getAllParkingUpdates, isConnected } = useParkingUpdates();

  const { data, isLoading, error } = useQuery({
    queryKey: ["parkings"],
    queryFn: () => getAllParkings()
  });

  const { data: noParkingData } = useQuery({
    queryKey: ["no-parking-requests", "approved-cards"],
    queryFn: () => getApprovedRequests({ requestType: "no_parking", limit: 200 }),
  });

  // Get real-time updates
  const realTimeUpdates = getAllParkingUpdates();
  
  // Merge real-time data with static data
  const enhancedParkings = data?.parkings?.map((parking: any) => {
    const realTimeUpdate = realTimeUpdates.find(update => update.parkingId === parking.parkingId);
    return {
      ...parking,
      ...(realTimeUpdate && {
        currentCount: realTimeUpdate.currentCount,
        availableSpaces: realTimeUpdate.availableSpaces,
        isFull: realTimeUpdate.isFull,
        lastUpdated: realTimeUpdate.lastUpdated,
      })
    };
  }) || [];

  const handleParkingSelect = (parking: any) => {
    navigate(`/parkings/${parking._id}`);
  };

  const handleGoToMap = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, "_blank");
  };

  const filteredParkings = enhancedParkings.filter((parking: any) => {
    if (filters.parkingType && parking.parkingType !== filters.parkingType) return false;
    if (filters.paymentType && parking.paymentType !== filters.paymentType) return false;
    if (filters.isFull === 'true' && !parking.isFull) return false;
    if (filters.isFull === 'false' && parking.isFull) return false;
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      return (
        parking.name.toLowerCase().includes(searchLower) ||
        parking.description?.toLowerCase().includes(searchLower) ||
        parking.location.address?.street?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
                <p className="mt-4 text-white text-lg">Loading parking spaces...</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <p className="text-red-400 text-lg">Error loading parking spaces</p>
                <p className="text-gray-300">Please try again later</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white ring-1 bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-black border-opacity-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-black mb-2">Parking Spaces</h1>
                <p className="text-gray-500">Find the perfect parking spot for your vehicle</p>
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex bg-white bg-opacity-10 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-4 py-2 rounded-md transition-colors m-1 ${
                    viewMode === 'map'
                      ? ' bg-opacity-20 text-black '
                      : 'text-gray-500 hover:font-bold hover:text-black hover:bg-gray-300 ' 
                  } ${viewMode=='map'? 'bg-gray-300 ring-1':'bg-white'}`}
                >
                  🗺️ Map
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? ' bg-opacity-20 text-black'
                      : 'text-gray-500 hover:font-bold hover:text-black hover:bg-gray-300 active:bg-gray-300'
                  } ${viewMode=='list'? 'bg-gray-300 ring-1':'bg-white'} ` }
                >
                  📋 List
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white ring-1 bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-black border-opacity-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <input
                type="text"
                placeholder="Search parkings..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="px-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-black placeholder-gray-500 ring-1 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white focus:bg-opacity-30"
              />
              
              <select
                value={filters.parkingType}
                onChange={(e) => setFilters({ ...filters, parkingType: e.target.value })}
                className="px-4 py-2 ring-1 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="opensky">Open Sky</option>
                <option value="closedsky">Closed Sky</option>
              </select>
              
              <select
                value={filters.paymentType}
                onChange={(e) => setFilters({ ...filters, paymentType: e.target.value })}
                className="px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-black ring-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Payment</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
              
              <select
                value={filters.isFull}
                onChange={(e) => setFilters({ ...filters, isFull: e.target.value })}
                className="px-4 py-2  ring-1 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="false">Available</option>
                <option value="true">Full</option>
              </select>
              
              <button
                onClick={() => setFilters({ parkingType: '', paymentType: '', isFull: '', search: '' })}
                className="px-4 py-2  bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-white font-bold ">
              Found {filteredParkings.length} parking space{filteredParkings.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Content MAP or LIST*/}
          {viewMode === 'map' ? (
            <div className="bg-white ring-1 bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-black border-opacity-20">
              <ParkingMap onParkingSelect={handleParkingSelect} searchTerm={debouncedSearch} />
            </div>
          ) : (
            <div className="bg-white ring-1 bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-black border-opacity-20">
              {filteredParkings.map((parking: any) => (
                <div key={parking._id} className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20 hover:bg-opacity-20 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-black">{parking.name}</h3>
                      {isConnected && realTimeUpdates.find(update => update.parkingId === parking.parkingId) && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-green-600 font-medium">Live</span>
                        </div>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      parking.isFull ? 'bg-red-500 bg-opacity-20 text-white ' : 'bg-green-500 bg-opacity-20 text-white'
                    }`}>
                      {parking.isFull ? 'Full' : 'Available'}
                    </span>
                  </div>
                  
                  <p className="text-gray-500  mb-4 line-clamp-2">{parking.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex   ">
                      <span className="text-black">Type :</span>
                      <span className="text-gray-800 capitalize">- {parking.parkingType}</span>
                    </div>
                    <div className="flex  ">
                      <span className="text-black">Payment :</span>
                      <span className="text-gray-800 capitalize">- {parking.paymentType}</span>
                    </div>
                    <div className="flex  ">
                      <span className="text-black">Capacities :</span>
                      <span className="text-gray-800">- {parking.capacity?.car || 0} cars, {parking.capacity?.bike || 0} bikes & {parking.capacity?.bus_truck || 0} bus/trucks.</span>
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
                  
                  <button
                    onClick={() => navigate(`/parkings/${parking._id}`)}
                    className="w-full bg-blue-600 font-bold hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
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
                </div>
              ))}

              {/* Approved No-Parking Zones */}
              {(noParkingData?.requests ?? noParkingData ?? []).map((req: any) => (
                <div key={req._id} className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20 hover:bg-opacity-20 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-white">No Parking: {req.title}</h3>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500 bg-opacity-20 text-red-300">
                      No Parking
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">{req.description}</p>
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Approved</span>
                      <span className="text-white">{new Date(req.approvedAt || req.updatedAt).toLocaleDateString()}</span>
                    </div>
                    {req.noParkingDetails?.reason && (
                      <div className="flex justify-between">
                        <span className="text-gray-300">Reason</span>
                        <span className="text-white capitalize">{req.noParkingDetails.reason}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredParkings.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚗</div>
              <p className="text-xl text-white mb-2">No parking spaces found</p>
              <p className="text-gray-300">Try adjusting your filters or search terms</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}