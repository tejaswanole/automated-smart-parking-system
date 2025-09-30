import { useEffect, useState } from 'react';
import { useParkingUpdates } from '../../hooks/useParkingUpdates';

export default function RealTimeDemo() {
  const { getAllParkingUpdates, isConnected } = useParkingUpdates();
  const [updates, setUpdates] = useState<any[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentUpdates = getAllParkingUpdates();
      setUpdates(currentUpdates);
    }, 1000);

    return () => clearInterval(interval);
  }, [getAllParkingUpdates]);

  if (!isConnected) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong>Connection Status:</strong> Disconnected from real-time updates
      </div>
    );
  }

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
      <h3 className="text-xl font-bold text-black mb-4">Real-time Updates Demo</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-600 font-medium">Connected to real-time updates</span>
        </div>
        <p className="text-gray-600 text-sm">
          Active parking updates: {updates.length}
        </p>
        {updates.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="font-semibold text-black">Recent Updates:</h4>
            {updates.slice(0, 3).map((update, index) => (
              <div key={index} className="bg-white bg-opacity-20 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-black">{update.parkingId}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(update.lastUpdated).toLocaleTimeString()}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                  <div>Car: {update.availableSpaces.car}</div>
                  <div>Bike: {update.availableSpaces.bike}</div>
                  <div>Bus: {update.availableSpaces.bus_truck}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
