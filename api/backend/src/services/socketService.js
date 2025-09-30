import { Server } from 'socket.io';
import Parking from '../models/Parking.js';

class SocketService {
  constructor() {
    this.io = null;
    this.connectedClients = new Map();
    this.cvModelConnections = new Map();
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: '*',
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.setupEventHandlers();
    console.log('✅ Socket.IO server initialized');
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);

      // Handle client authentication
      socket.on('authenticate', (data) => {
        this.handleAuthentication(socket, data);
      });

      // Handle CV model connection
      socket.on('cv_model_connect', (data) => {
        this.handleCVModelConnection(socket, data);
      });

      // Handle parking count updates from CV model
      socket.on('parking_count_update', (data) => {
        this.handleParkingCountUpdate(socket, data);
      });

      // Handle staff count updates
      socket.on('staff_count_update', (data) => {
        this.handleStaffCountUpdate(socket, data);
      });

      // Handle client joining parking room
      socket.on('join_parking_room', (parkingId) => {
        this.handleJoinParkingRoom(socket, parkingId);
      });

      // Handle client leaving parking room
      socket.on('leave_parking_room', (parkingId) => {
        this.handleLeaveParkingRoom(socket, parkingId);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  handleAuthentication(socket, data) {
    try {
      const { userId, role } = data;
      
      if (!userId) {
        socket.emit('error', { message: 'Authentication failed: User ID required' });
        return;
      }

      // Store client information
      this.connectedClients.set(socket.id, {
        userId,
        role,
        socketId: socket.id,
        connectedAt: new Date()
      });

      // Join user-specific room
      socket.join(`user_${userId}`);

      socket.emit('authenticated', {
        message: 'Successfully authenticated',
        userId,
        role
      });

      console.log(`✅ Client authenticated: ${userId} (${role})`);
    } catch (error) {
      console.error('Authentication error:', error);
      socket.emit('error', { message: 'Authentication failed' });
    }
  }

  handleCVModelConnection(socket, data) {
    try {
      const { parkingId, modelId } = data;
      
      if (!parkingId || !modelId) {
        socket.emit('error', { message: 'CV model connection failed: Parking ID and Model ID required' });
        return;
      }

      // Store CV model connection
      this.cvModelConnections.set(parkingId, {
        socketId: socket.id,
        modelId,
        parkingId,
        connectedAt: new Date()
      });

      // Join parking-specific room
      socket.join(`parking_${parkingId}`);

      socket.emit('cv_model_connected', {
        message: 'CV model successfully connected',
        parkingId,
        modelId
      });

      console.log(`🤖 CV model connected for parking: ${parkingId}`);
    } catch (error) {
      console.error('CV model connection error:', error);
      socket.emit('error', { message: 'CV model connection failed' });
    }
  }

  async handleParkingCountUpdate(socket, data) {
    try {
      const { parking_id, counts, capacity } = data;
      
      if (!parking_id || !counts) {
        socket.emit('error', { message: 'Invalid parking count update data' });
        return;
      }

      // Find parking by ID using the new helper method
      const parking = await Parking.findByIdOrParkingId(parking_id, { isActive: true });

      if (!parking) {
        socket.emit('error', { message: 'Parking not found' });
        return;
      }

      // Update parking counts
      parking.currentCount = {
        car: counts.car || 0,
        bus_truck: counts.bus_truck || 0,
        bike: counts.bike || 0
      };

      // Update capacity if provided
      if (capacity) {
        parking.capacity = {
          car: capacity.car || parking.capacity.car,
          bus_truck: capacity.bus_truck || parking.capacity.bus_truck,
          bike: capacity.bike || parking.capacity.bike
        };
      }

      parking.lastUpdated = new Date();
      await parking.save();

      // Broadcast update to all clients in the parking room
      this.io.to(`parking_${parking.parkingId}`).emit('parking_count_updated', {
        parkingId: parking.parkingId,
        currentCount: parking.currentCount,
        capacity: parking.capacity,
        lastUpdated: parking.lastUpdated,
        isFull: parking.isFull(),
        availableSpaces: parking.getAvailableSpaces()
      });

      console.log(`Parking count updated for ${parking.parkingId}:`, parking.currentCount);
    } catch (error) {
      console.error('Parking count update error:', error);
      socket.emit('error', { message: 'Failed to update parking count' });
    }
  }

  async handleStaffCountUpdate(socket, data) {
    try {
      const { parkingId, vehicleType, count, action } = data;
      
      if (!parkingId || !vehicleType || count === undefined) {
        socket.emit('error', { message: 'Invalid staff count update data' });
        return;
      }

      // Find parking by ID using the new helper method
      const parking = await Parking.findByIdOrParkingId(parkingId, { isActive: true });

      if (!parking) {
        socket.emit('error', { message: 'Parking not found' });
        return;
      }

      // Update count based on action
      if (action === 'increment') {
        await parking.incrementVehicleCount(vehicleType, count);
      } else if (action === 'decrement') {
        await parking.decrementVehicleCount(vehicleType, count);
      } else {
        await parking.updateVehicleCount(vehicleType, count);
      }

      // Broadcast update to all clients in the parking room
      this.io.to(`parking_${parking.parkingId}`).emit('parking_count_updated', {
        parkingId: parking.parkingId,
        currentCount: parking.currentCount,
        capacity: parking.capacity,
        lastUpdated: parking.lastUpdated,
        isFull: parking.isFull(),
        availableSpaces: parking.getAvailableSpaces(),
        updatedBy: 'staff'
      });

      // Notify CV model if connected
      const cvConnection = this.cvModelConnections.get(parking.parkingId);
      if (cvConnection) {
        this.io.to(cvConnection.socketId).emit('staff_count_update', {
          parkingId: parking.parkingId,
          currentCount: parking.currentCount,
          updatedBy: 'staff'
        });
      }

      console.log(`Staff count updated for ${parking.parkingId}: ${vehicleType} = ${parking.currentCount[vehicleType]}`);
    } catch (error) {
      console.error('Staff count update error:', error);
      socket.emit('error', { message: 'Failed to update parking count' });
    }
  }

  handleJoinParkingRoom(socket, parkingId) {
    try {
      socket.join(`parking_${parkingId}`);
      console.log(`🏠 Client ${socket.id} joined parking room: ${parkingId}`);
      
      socket.emit('joined_parking_room', {
        parkingId,
        message: `Joined parking room: ${parkingId}`
      });
    } catch (error) {
      console.error('Join parking room error:', error);
      socket.emit('error', { message: 'Failed to join parking room' });
    }
  }

  handleLeaveParkingRoom(socket, parkingId) {
    try {
      socket.leave(`parking_${parkingId}`);
      console.log(`Client ${socket.id} left parking room: ${parkingId}`);
      
      socket.emit('left_parking_room', {
        parkingId,
        message: `Left parking room: ${parkingId}`
      });
    } catch (error) {
      console.error('Leave parking room error:', error);
      socket.emit('error', { message: 'Failed to leave parking room' });
    }
  }

  handleDisconnect(socket) {
    console.log(`🔌 Client disconnected: ${socket.id}`);

    // Remove from connected clients
    this.connectedClients.delete(socket.id);

    // Remove from CV model connections if applicable
    for (const [parkingId, connection] of this.cvModelConnections.entries()) {
      if (connection.socketId === socket.id) {
        this.cvModelConnections.delete(parkingId);
        console.log(`CV model disconnected for parking: ${parkingId}`);
        break;
      }
    }
  }

  // Utility methods for external use
  getConnectedClients() {
    return Array.from(this.connectedClients.values());
  }

  getCVModelConnections() {
    return Array.from(this.cvModelConnections.values());
  }

  sendToUser(userId, event, data) {
    this.io.to(`user_${userId}`).emit(event, data);
  }

  sendToParking(parkingId, event, data) {
    this.io.to(`parking_${parkingId}`).emit(event, data);
  }

  broadcastToAll(event, data) {
    this.io.emit(event, data);
  }

  getIO() {
    return this.io;
  }
}

export default new SocketService();
