import mongoose from 'mongoose';

const visitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  parking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parking',
    required: [true, 'Parking is required']
  },
  visitDate: {
    type: Date,
    default: Date.now
  },
  coinsEarned: {
    type: Number,
    default: 0,
    min: [0, 'Coins earned cannot be negative']
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
    }
  },
  distance: {
    type: Number,
    required: true,
    min: [0, 'Distance cannot be negative']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationMethod: {
    type: String,
    enum: ['gps', 'qr_code', 'manual'],
    default: 'gps'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Indexes for better performance
visitSchema.index({ user: 1 });
visitSchema.index({ parking: 1 });
visitSchema.index({ visitDate: -1 });
visitSchema.index({ location: '2dsphere' });
visitSchema.index({ isVerified: 1 });

// Compound indexes
visitSchema.index({ user: 1, visitDate: -1 });
visitSchema.index({ parking: 1, visitDate: -1 });
visitSchema.index({ user: 1, parking: 1, visitDate: -1 });

// Static method to find visits by user
visitSchema.statics.findByUser = function(userId, filters = {}) {
  return this.find({
    user: userId,
    ...filters
  }).populate('parking', 'name location parkingType paymentType').sort({ visitDate: -1 });
};

// Static method to find visits by parking
visitSchema.statics.findByParking = function(parkingId, filters = {}) {
  return this.find({
    parking: parkingId,
    ...filters
  }).populate('user', 'name email phone').sort({ visitDate: -1 });
};

// Static method to find visits within date range
visitSchema.statics.findByDateRange = function(startDate, endDate, filters = {}) {
  return this.find({
    visitDate: {
      $gte: startDate,
      $lte: endDate
    },
    ...filters
  }).populate('user', 'name email phone').populate('parking', 'name location').sort({ visitDate: -1 });
};

// Static method to get visit statistics
visitSchema.statics.getStatistics = function(parkingId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        parking: new mongoose.Types.ObjectId(parkingId),
        visitDate: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: null,
        totalVisits: { $sum: 1 },
        totalCoinsEarned: { $sum: '$coinsEarned' },
        averageDistance: { $avg: '$distance' },
        verifiedVisits: {
          $sum: {
            $cond: ['$isVerified', 1, 0]
          }
        }
      }
    }
  ]);
};

// Static method to find nearby visits
visitSchema.statics.findNearby = function(coordinates, maxDistance = 10000, filters = {}) {
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
    ...filters
  };
  
  return this.find(query).populate('user', 'name email phone').populate('parking', 'name location');
};

// Instance method to verify visit
visitSchema.methods.verify = function(method = 'manual', notes = '') {
  this.isVerified = true;
  this.verificationMethod = method;
  if (notes) this.notes = notes;
  return this.save();
};

// Virtual for visit age in days
visitSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const visit = new Date(this.visitDate);
  const diffTime = Math.abs(now - visit);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for formatted visit date
visitSchema.virtual('formattedVisitDate').get(function() {
  return this.visitDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Ensure virtual fields are serialized
visitSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    return ret;
  }
});

export default mongoose.model('Visit', visitSchema);
