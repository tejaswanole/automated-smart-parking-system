import jwt from 'jsonwebtoken';
import { ERROR_MESSAGES, JWT_EXPIRES_IN, USER_ROLES } from '../constants.js';
import User from '../models/User.js';

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Authentication middleware
export const authenticate = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
        error: 'No token provided'
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
        error: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
        error: 'User account is deactivated'
      });
    }

    // Attach user to request
    req.user = user;
    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: ERROR_MESSAGES.UNAUTHORIZED,
      error: error.message
    });
  }
};

// Role-based authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
        error: 'User not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: ERROR_MESSAGES.FORBIDDEN,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Admin authorization
export const authorizeAdmin = authorize(USER_ROLES.ADMIN);

// Owner authorization
export const authorizeOwner = authorize(USER_ROLES.OWNER);

// Staff authorization
export const authorizeStaff = authorize(USER_ROLES.STAFF);

// User authorization (any authenticated user)
export const authorizeUser = authorize(USER_ROLES.USER, USER_ROLES.OWNER, USER_ROLES.STAFF, USER_ROLES.ADMIN);

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Parking owner authorization
export const authorizeParkingOwner = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
        error: 'User not authenticated'
      });
    }

    const parkingId = req.params.parkingId || req.body.parkingId;
    
    if (!parkingId) {
      return res.status(400).json({
        success: false,
        message: 'Parking ID is required'
      });
    }

    // Admin can access any parking
    if (req.user.role === USER_ROLES.ADMIN) {
      return next();
    }

    // Check if user owns the parking
    const user = await User.findById(req.user._id).populate('ownedParkings');
    const isOwner = user.ownedParkings.some(parking => 
      parking._id.toString() === parkingId || parking.parkingId === parkingId
    );

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: ERROR_MESSAGES.FORBIDDEN,
        error: 'You are not the owner of this parking'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      error: error.message
    });
  }
};

// Staff authorization for specific parking
export const authorizeParkingStaff = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
        error: 'User not authenticated'
      });
    }

    const parkingId = req.params.parkingId || req.body.parkingId;
    
    if (!parkingId) {
      return res.status(400).json({
        success: false,
        message: 'Parking ID is required'
      });
    }

    // Admin can access any parking
    if (req.user.role === USER_ROLES.ADMIN) {
      return next();
    }

    // Load user with both staffParking and ownedParkings references
    const user = await User.findById(req.user._id)
      .populate('staffParking')
      .populate('ownedParkings');
    
    if (req.user.role === USER_ROLES.STAFF && user.staffParking) {
      const isStaff = user.staffParking._id.toString() === parkingId || 
                     user.staffParking.parkingId === parkingId;
      
      if (isStaff) {
        return next();
      }
    }

    // Check if user owns the parking
    const isOwner = Array.isArray(user.ownedParkings) && user.ownedParkings.some((parking) => {
      const idMatch = parking?._id?.toString && parking._id.toString() === parkingId;
      const pidMatch = parking?.parkingId && parking.parkingId === parkingId;
      return idMatch || pidMatch;
    });

    if (isOwner) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: ERROR_MESSAGES.FORBIDDEN,
      error: 'You are not authorized to access this parking'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      error: error.message
    });
  }
};
