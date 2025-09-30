import mongoose from 'mongoose';
import { REQUEST_STATUS, REQUEST_TYPES } from '../constants.js';

const requestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  requestType: {
    type: String,
    enum: Object.values(REQUEST_TYPES),
    required: [true, 'Request type is required']
  },
  status: {
    type: String,
    enum: Object.values(REQUEST_STATUS),
    default: REQUEST_STATUS.PENDING
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
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
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // For parking requests
  parkingDetails: {
    name: String,
    capacity: {
      car: Number,
      bus_truck: Number,
      bike: Number
    },
    parkingType: {
      type: String,
      enum: ['opensky', 'closedsky']
    },
    paymentType: {
      type: String,
      enum: ['paid', 'free']
    },
    ownershipType: {
      type: String,
      enum: ['private', 'public']
    },
    hourlyRate: {
      car: Number,
      bus_truck: Number,
      bike: Number
    },
    amenities: [String],
    operatingHours: {
      open: String,
      close: String,
      is24Hours: Boolean
    }
  },
  // For no-parking requests
  noParkingDetails: {
    reason: {
      type: String,
      enum: ['construction', 'event', 'maintenance', 'safety', 'other']
    },
    duration: {
      startDate: Date,
      endDate: Date
    },
    affectedArea: {
      type: String,
      enum: ['partial', 'complete']
    }
  },
  adminNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Admin notes cannot exceed 500 characters']
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  deniedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deniedAt: {
    type: Date
  },
  coinsAwarded: {
    type: Number,
    default: 0,
    min: [0, 'Coins awarded cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
requestSchema.index({ user: 1 });
requestSchema.index({ requestType: 1 });
requestSchema.index({ status: 1 });
requestSchema.index({ location: '2dsphere' });
requestSchema.index({ createdAt: -1 });
requestSchema.index({ isActive: 1 });

// Compound indexes
requestSchema.index({ status: 1, requestType: 1 });
requestSchema.index({ user: 1, status: 1 });
requestSchema.index({ status: 1, createdAt: -1 });

// Pre-save middleware to validate request details
requestSchema.pre('save', function(next) {
  if (this.requestType === 'parking' && !this.parkingDetails) {
    return next(new Error('Parking details are required for parking requests'));
  }
  
  if (this.requestType === 'no_parking' && !this.noParkingDetails) {
    return next(new Error('No-parking details are required for no-parking requests'));
  }
  
  next();
});

// Instance method to approve request
requestSchema.methods.approve = function(adminId, coinsAwarded = 0, notes = '') {
  this.status = REQUEST_STATUS.APPROVED;
  this.approvedBy = adminId;
  this.approvedAt = new Date();
  this.coinsAwarded = coinsAwarded;
  if (notes) this.adminNotes = notes;
  return this.save();
};

// Instance method to deny request
requestSchema.methods.deny = function(adminId, notes = '') {
  this.status = REQUEST_STATUS.DENIED;
  this.deniedBy = adminId;
  this.deniedAt = new Date();
  if (notes) this.adminNotes = notes;
  return this.save();
};

// Static method to find pending requests
requestSchema.statics.findPending = function(filters = {}) {
  return this.find({
    status: REQUEST_STATUS.PENDING,
    isActive: true,
    ...filters
  }).populate('user', 'name email phone');
};

// Static method to find requests by user
requestSchema.statics.findByUser = function(userId, filters = {}) {
  return this.find({
    user: userId,
    isActive: true,
    ...filters
  }).sort({ createdAt: -1 });
};

// Static method to find nearby requests
requestSchema.statics.findNearby = function(coordinates, maxDistance = 10000, filters = {}) {
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
    ...filters
  };
  
  return this.find(query).populate('user', 'name email phone');
};

// Virtual for request age
requestSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now - created);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for is pending
requestSchema.virtual('isPending').get(function() {
  return this.status === REQUEST_STATUS.PENDING;
});

// Virtual for is approved
requestSchema.virtual('isApproved').get(function() {
  return this.status === REQUEST_STATUS.APPROVED;
});

// Virtual for is denied
requestSchema.virtual('isDenied').get(function() {
  return this.status === REQUEST_STATUS.DENIED;
});

// Ensure virtual fields are serialized
requestSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    return ret;
  }
});

export default mongoose.model('Request', requestSchema);
