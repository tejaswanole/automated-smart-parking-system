import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

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

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  joinParkingRoom: (parkingId: string) => void;
  leaveParkingRoom: (parkingId: string) => void;
  onParkingCountUpdate: (callback: (data: ParkingCountUpdate) => void) => void;
  offParkingCountUpdate: (callback: (data: ParkingCountUpdate) => void) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();
  const [parkingCountCallbacks, setParkingCountCallbacks] = useState<Set<(data: ParkingCountUpdate) => void>>(new Set());

  const connect = () => {
    if (!user || socket) return;

    const newSocket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000', {
      auth: {
        userId: user._id,
        role: user.role
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
      autoConnect: true
    });

    newSocket.on('connect', () => {
      console.log('Connected to socket server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setIsConnected(false);
    });

    newSocket.on('authenticated', (data) => {
      console.log('Socket authenticated:', data);
    });

    newSocket.on('joined_parking_room', (data) => {
      console.log('Joined parking room:', data);
    });

    newSocket.on('parking_count_updated', (data: ParkingCountUpdate) => {
      console.log('Parking count updated:', data);
      // Notify all registered callbacks
      parkingCountCallbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in parking count callback:', error);
        }
      });
      // Also emit a custom event for backward compatibility
      window.dispatchEvent(new CustomEvent('parkingCountUpdated', { detail: data }));
    });

    setSocket(newSocket);
  };

  const disconnect = () => {
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  };

  const joinParkingRoom = (parkingId: string) => {
    if (socket && isConnected) {
      socket.emit('join_parking_room', parkingId);
    }
  };

  const leaveParkingRoom = (parkingId: string) => {
    if (socket && isConnected) {
      socket.emit('leave_parking_room', parkingId);
    }
  };

  const onParkingCountUpdate = (callback: (data: ParkingCountUpdate) => void) => {
    setParkingCountCallbacks(prev => new Set([...prev, callback]));
  };

  const offParkingCountUpdate = (callback: (data: ParkingCountUpdate) => void) => {
    setParkingCountCallbacks(prev => {
      const newSet = new Set(prev);
      newSet.delete(callback);
      return newSet;
    });
  };

  useEffect(() => {
    if (user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [user?._id]); // Only depend on user ID to prevent unnecessary reconnections

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const value: SocketContextType = {
    socket,
    isConnected,
    connect,
    disconnect,
    joinParkingRoom,
    leaveParkingRoom,
    onParkingCountUpdate,
    offParkingCountUpdate,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}