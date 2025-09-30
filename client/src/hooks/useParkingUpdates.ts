import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';

interface ParkingCountUpdate {
  parkingId: string;
  currentCount: {
    car: number;
    bus_truck: number;
    bike: number;
  };
  capacity: {
    car: number;
    bus_truck: number;
    bike: number;
  };
  lastUpdated: string;
  isFull: boolean;
  availableSpaces: {
    car: number;
    bus_truck: number;
    bike: number;
  };
  updatedBy?: 'cv_model' | 'staff';
}

interface UseParkingUpdatesOptions {
  parkingId?: string;
  autoJoin?: boolean;
}

export function useParkingUpdates(options: UseParkingUpdatesOptions = {}) {
  const { parkingId, autoJoin = true } = options;
  const { socket, isConnected, joinParkingRoom, leaveParkingRoom, onParkingCountUpdate, offParkingCountUpdate } = useSocket();
  const [parkingUpdates, setParkingUpdates] = useState<Map<string, ParkingCountUpdate>>(new Map());
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Handle parking count updates
  useEffect(() => {
    const handleParkingCountUpdate = (data: ParkingCountUpdate) => {
      setParkingUpdates(prev => {
        const newMap = new Map(prev);
        newMap.set(data.parkingId, data);
        return newMap;
      });
    };

    onParkingCountUpdate(handleParkingCountUpdate);
    setIsSubscribed(true);

    return () => {
      offParkingCountUpdate(handleParkingCountUpdate);
      setIsSubscribed(false);
    };
  }, [onParkingCountUpdate, offParkingCountUpdate]);

  // Auto-join parking room when parkingId is provided
  useEffect(() => {
    if (autoJoin && parkingId && isConnected && socket) {
      joinParkingRoom(parkingId);
      return () => {
        leaveParkingRoom(parkingId);
      };
    }
  }, [parkingId, autoJoin, isConnected, socket, joinParkingRoom, leaveParkingRoom]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (parkingId && isConnected) {
        leaveParkingRoom(parkingId);
      }
      // Clear all parking updates on unmount
      setParkingUpdates(new Map());
    };
  }, []);

  // Get specific parking update
  const getParkingUpdate = (id: string) => {
    return parkingUpdates.get(id);
  };

  // Get all parking updates
  const getAllParkingUpdates = () => {
    return Array.from(parkingUpdates.values());
  };

  // Check if parking has recent updates
  const hasRecentUpdate = (id: string, maxAgeMinutes = 5) => {
    const update = parkingUpdates.get(id);
    if (!update) return false;
    
    const updateTime = new Date(update.lastUpdated);
    const now = new Date();
    const ageMinutes = (now.getTime() - updateTime.getTime()) / (1000 * 60);
    
    return ageMinutes <= maxAgeMinutes;
  };

  return {
    parkingUpdates,
    getParkingUpdate,
    getAllParkingUpdates,
    hasRecentUpdate,
    isSubscribed,
    isConnected,
    joinParkingRoom,
    leaveParkingRoom,
  };
}
