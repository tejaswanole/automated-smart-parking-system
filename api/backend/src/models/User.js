import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { USER_ROLES } from '../constants.js';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: Object.values(USER_ROLES),
    default: USER_ROLES.USER
  },
  wallet: {
    coins: {
      type: Number,
      default: 0,
      min: [0, 'Coins cannot be negative']
    },
    transactions: [{
      type: {
        type: String,
        enum: ['credit', 'debit'],
        required: true
      },
      amount: {
        type: Number,
        required: true
      },
      description: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  },
  ownedParkings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parking'
  }],
  staffParking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parking'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: false
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  profilePicture: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for better performance
userSchema.index({ location: '2dsphere' }, { sparse: true });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Pre-save middleware to handle location and password
userSchema.pre('save', async function(next) {
  // Handle location field - if coordinates are not provided, remove the location field
  if (this.location && (!this.location.coordinates || this.location.coordinates.length === 0)) {
    this.location = undefined;
  }
  
  // Handle password hashing
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to add coins
userSchema.methods.addCoins = function(amount, description) {
  this.wallet.coins += amount;
  this.wallet.transactions.push({
    type: 'credit',
    amount,
    description
  });
  return this.save();
};

// Instance method to deduct coins
userSchema.methods.deductCoins = function(amount, description) {
  if (this.wallet.coins < amount) {
    throw new Error('Insufficient coins');
  }
  this.wallet.coins -= amount;
  this.wallet.transactions.push({
    type: 'debit',
    amount,
    description
  });
  return this.save();
};

// Instance method to update location
userSchema.methods.updateLocation = function(coordinates) {
  if (!coordinates || coordinates.length !== 2) {
    throw new Error('Coordinates must be an array with exactly 2 elements');
  }
  
  this.location = {
    type: 'Point',
    coordinates: coordinates
  };
  return this.save();
};

// Static method to find nearby users
userSchema.statics.findNearby = function(coordinates, maxDistance = 10000) {
  return this.find({
    location: {
      $exists: true,
      $near: {
        $geometry: {
          type: 'Point',
          coordinates
        },
        $maxDistance: maxDistance
      }
    },
    isActive: true
  });
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.name}`;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    return ret;
  }
});

export default mongoose.model('User', userSchema);
