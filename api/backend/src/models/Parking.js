import mongoose from 'mongoose';
import { OWNERSHIP_TYPES, PARKING_TYPES, PAYMENT_TYPES, VEHICLE_TYPES } from '../constants.js';

const parkingSchema = new mongoose.Schema({
  parkingId: {
    type: String,
    // Not required; generated automatically if missing
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Parking name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(coords) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && 
                 coords[1] >= -90 && coords[1] <= 90;
        },
        message: 'Invalid coordinates'
      }
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String
    }
  },
  parkingType: {
    type: String,
    enum: Object.values(PARKING_TYPES),
    required: [true, 'Parking type is required']
  },
  paymentType: {
    type: String,
    enum: Object.values(PAYMENT_TYPES),
    required: [true, 'Payment type is required']
  },
  ownershipType: {
    type: String,
    enum: Object.values(OWNERSHIP_TYPES),
    required: [true, 'Ownership type is required']
  },
  capacity: {
    car: {
      type: Number,
      required: [true, 'Car capacity is required'],
      min: [0, 'Car capacity cannot be negative']
    },
    bus_truck: {
      type: Number,
      required: [true, 'Bus/Truck capacity is required'],
      min: [0, 'Bus/Truck capacity cannot be negative']
    },
    bike: {
      type: Number,
      required: [true, 'Bike capacity is required'],
      min: [0, 'Bike capacity cannot be negative']
    }
  },
  currentCount: {
    car: {
      type: Number,
      default: 0,
      min: [0, 'Car count cannot be negative']
    },
    bus_truck: {
      type: Number,
      default: 0,
      min: [0, 'Bus/Truck count cannot be negative']
    },
    bike: {
      type: Number,
      default: 0,
      min: [0, 'Bike count cannot be negative']
    }
  },
  hourlyRate: {
    car: {
      type: Number,
      default: 0,
      min: [0, 'Car hourly rate cannot be negative']
    },
    bus_truck: {
      type: Number,
      default: 0,
      min: [0, 'Bus/Truck hourly rate cannot be negative']
    },
    bike: {
      type: Number,
      default: 0,
      min: [0, 'Bike hourly rate cannot be negative']
    }
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required']
  },
  staff: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  images: [{
    url: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  amenities: [{
    type: String,
    enum: ['security', 'cctv', 'lighting', 'roof', 'valet', 'charging', 'disabled_access']
  }],
  operatingHours: {
    open: {
      type: String,
      default: '00:00'
    },
    close: {
      type: String,
      default: '23:59'
    },
    is24Hours: {
      type: Boolean,
      default: true
    }
  },
  statistics: {
    totalVisits: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    averageOccupancy: {
      type: Number,
      default: 0
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
parkingSchema.index({ location: '2dsphere' });
parkingSchema.index({ owner: 1 });
parkingSchema.index({ isActive: 1 });
parkingSchema.index({ isApproved: 1 });
parkingSchema.index({ parkingType: 1 });
parkingSchema.index({ paymentType: 1 });
parkingSchema.index({ ownershipType: 1 });

// Compound indexes
parkingSchema.index({ isActive: 1, isApproved: 1 });
parkingSchema.index({ location: '2dsphere', isActive: 1, isApproved: 1 });

// Pre-save middleware to generate parking ID if not provided
parkingSchema.pre('validate', function(next) {
  if (!this.parkingId) {
    this.parkingId = this._id ? this._id.toString().slice(-8) : undefined;
  }
  next();
});

// Instance method to get total capacity
parkingSchema.methods.getTotalCapacity = function() {
  return this.capacity.car + this.capacity.bus_truck + this.capacity.bike;
};

// Instance method to get current total count
parkingSchema.methods.getCurrentTotalCount = function() {
  return this.currentCount.car + this.currentCount.bus_truck + this.currentCount.bike;
};

// Instance method to get available spaces
parkingSchema.methods.getAvailableSpaces = function() {
  return {
    car: Math.max(0, this.capacity.car - this.currentCount.car),
    bus_truck: Math.max(0, this.capacity.bus_truck - this.currentCount.bus_truck),
    bike: Math.max(0, this.capacity.bike - this.currentCount.bike)
  };
};

// Instance method to check if parking is full
parkingSchema.methods.isFull = function() {
  return this.getCurrentTotalCount() >= this.getTotalCapacity();
};

// Instance method to update vehicle count
parkingSchema.methods.updateVehicleCount = function(vehicleType, count) {
  if (!Object.values(VEHICLE_TYPES).includes(vehicleType)) {
    throw new Error('Invalid vehicle type');
  }
  
  if (count < 0) {
    throw new Error('Count cannot be negative');
  }
  
  if (count > this.capacity[vehicleType]) {
    throw new Error('Count cannot exceed capacity');
  }
  
  this.currentCount[vehicleType] = count;
  this.lastUpdated = new Date();
  return this.save();
};

// Instance method to increment vehicle count
parkingSchema.methods.incrementVehicleCount = function(vehicleType, increment = 1) {
  if (!Object.values(VEHICLE_TYPES).includes(vehicleType)) {
    throw new Error('Invalid vehicle type');
  }
  
  const newCount = this.currentCount[vehicleType] + increment;
  if (newCount > this.capacity[vehicleType]) {
    throw new Error('Cannot exceed capacity');
  }
  
  this.currentCount[vehicleType] = newCount;
  this.lastUpdated = new Date();
  return this.save();
};

// Instance method to decrement vehicle count
parkingSchema.methods.decrementVehicleCount = function(vehicleType, decrement = 1) {
  if (!Object.values(VEHICLE_TYPES).includes(vehicleType)) {
    throw new Error('Invalid vehicle type');
  }
  
  const newCount = this.currentCount[vehicleType] - decrement;
  if (newCount < 0) {
    throw new Error('Count cannot be negative');
  }
  
  this.currentCount[vehicleType] = newCount;
  this.lastUpdated = new Date();
  return this.save();
};

// Static method to find nearby parkings
parkingSchema.statics.findNearby = function(coordinates, maxDistance = 10000, filters = {}) {
  const query = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates
        },
        $maxDistance: maxDistance
      }
    },
    isActive: true,
    isApproved: true,
    ...filters
  };
  
  return this.find(query).populate('owner', 'name email phone');
};

// Static method to find available parkings
parkingSchema.statics.findAvailable = function(coordinates, maxDistance = 10000, filters = {}) {
  return this.findNearby(coordinates, maxDistance, filters).then(parkings => {
    return parkings.filter(parking => !parking.isFull());
  });
};

// Static method to find parking by ID (handles both ObjectId and parkingId string)
parkingSchema.statics.findByIdOrParkingId = function(id, additionalFilters = {}) {
  const filters = { isActive: true, ...additionalFilters };
  
  // Check if id is a valid ObjectId
  if (mongoose.Types.ObjectId.isValid(id)) {
    return this.findOne({ _id: id, ...filters });
  }
  
  // If not a valid ObjectId, search by parkingId
  return this.findOne({ parkingId: id, ...filters });
};

// Virtual for occupancy percentage
parkingSchema.virtual('occupancyPercentage').get(function() {
  const totalCapacity = this.getTotalCapacity();
  const currentCount = this.getCurrentTotalCount();
  return totalCapacity > 0 ? Math.round((currentCount / totalCapacity) * 100) : 0;
});

// Ensure virtual fields are serialized
parkingSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.availableSpaces = doc.getAvailableSpaces();
    ret.isFull = doc.isFull();
    return ret;
  }
});

export default mongoose.model('Parking', parkingSchema);
