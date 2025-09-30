import { COIN_REWARDS, ERROR_MESSAGES } from '../constants.js';
import { AppError, asyncHandler } from '../middlewares/errorHandler.js';
import Parking from '../models/Parking.js';
import User from '../models/User.js';
import Visit from '../models/Visit.js';

// @desc    Create a new visit
// @route   POST /api/visits
// @access  Private
export const createVisit = asyncHandler(async (req, res) => {
  const { parkingId, location, distance } = req.body;

  // Find parking using the new helper method
  const parking = await Parking.findByIdOrParkingId(parkingId, { isApproved: true });

  if (!parking) {
    throw new AppError(ERROR_MESSAGES.PARKING_NOT_FOUND, 404);
  }

  // Check if user has already visited this parking today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const existingVisit = await Visit.findOne({
    user: req.user._id,
    parking: parking._id,
    visitDate: {
      $gte: today,
      $lt: tomorrow
    }
  });

  if (existingVisit) {
    throw new AppError('You have already visited this parking today', 400);
  }

  // Calculate coins to award based on distance
  let coinsEarned = COIN_REWARDS.PARKING_VISIT;
  if (distance > 5000) { // More than 5km
    coinsEarned = Math.floor(COIN_REWARDS.PARKING_VISIT * 1.5);
  }

  // Create visit
  const visit = await Visit.create({
    user: req.user._id,
    parking: parking._id,
    location,
    distance,
    coinsEarned
  });

  // Award coins to user
  await req.user.addCoins(coinsEarned, `Parking visit: ${parking.name}`);

  // Update parking statistics
  parking.statistics.totalVisits += 1;
  await parking.save();

  res.status(201).json({
    success: true,
    message: 'Visit recorded successfully',
    data: {
      visit: {
        _id: visit._id,
        parking: {
          _id: parking._id,
          name: parking.name,
          parkingId: parking.parkingId
        },
        visitDate: visit.visitDate,
        coinsEarned: visit.coinsEarned,
        distance: visit.distance
      }
    }
  });
});

// @desc    Get user's visits
// @route   GET /api/visits/user/me
// @access  Private
export const getUserVisits = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, parkingId } = req.query;

  const filters = {};
  if (parkingId) filters.parking = parkingId;

  const visits = await Visit.findByUser(req.user._id, filters)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Visit.countDocuments({
    user: req.user._id,
    ...filters
  });

  res.json({
    success: true,
    data: {
      visits,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get parking visits (owner/admin/staff)
// @route   GET /api/visits/parking/:parkingId
// @access  Private (Owner/Admin/Staff)
export const getParkingVisits = asyncHandler(async (req, res) => {
  const { parkingId } = req.params;
  const { page = 1, limit = 20, startDate, endDate } = req.query;

  // Find parking using the new helper method
  const parking = await Parking.findByIdOrParkingId(parkingId);

  if (!parking) {
    throw new AppError(ERROR_MESSAGES.PARKING_NOT_FOUND, 404);
  }

  const filters = {};
  if (startDate && endDate) {
    filters.visitDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const visits = await Visit.findByParking(parking._id, filters)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Visit.countDocuments({
    parking: parking._id,
    ...filters
  });

  res.json({
    success: true,
    data: {
      parking: {
        _id: parking._id,
        name: parking.name,
        parkingId: parking.parkingId
      },
      visits,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get visit by ID
// @route   GET /api/visits/:visitId
// @access  Private
export const getVisitById = asyncHandler(async (req, res) => {
  const { visitId } = req.params;

  const visit = await Visit.findById(visitId)
    .populate('user', 'name email phone')
    .populate('parking', 'name location parkingType paymentType');

  if (!visit) {
    throw new AppError('Visit not found', 404);
  }

  // Check if user is authorized to view this visit
  if (req.user.role !== 'admin' && visit.user._id.toString() !== req.user._id.toString()) {
    throw new AppError('You are not authorized to view this visit', 403);
  }

  res.json({
    success: true,
    data: {
      visit
    }
  });
});

// @desc    Verify visit (staff/owner/admin)
// @route   PUT /api/visits/:visitId/verify
// @access  Private (Staff/Owner/Admin)
export const verifyVisit = asyncHandler(async (req, res) => {
  const { visitId } = req.params;
  const { method = 'manual', notes } = req.body;

  const visit = await Visit.findById(visitId)
    .populate('parking', 'name owner staff');

  if (!visit) {
    throw new AppError('Visit not found', 404);
  }

  // Check if user is authorized to verify this visit
  const parking = visit.parking;
  const isAuthorized = req.user.role === 'admin' || 
                      parking.owner.toString() === req.user._id.toString() ||
                      parking.staff.includes(req.user._id);

  if (!isAuthorized) {
    throw new AppError('You are not authorized to verify this visit', 403);
  }

  // Verify visit
  await visit.verify(method, notes);

  res.json({
    success: true,
    message: 'Visit verified successfully',
    data: {
      visit: {
        _id: visit._id,
        isVerified: visit.isVerified,
        verificationMethod: visit.verificationMethod,
        notes: visit.notes
      }
    }
  });
});

// @desc    Get visit statistics
// @route   GET /api/visits/statistics
// @access  Private
export const getVisitStatistics = asyncHandler(async (req, res) => {
  const { period = 'month', parkingId } = req.query;

  // Calculate date range based on period
  const now = new Date();
  let startDate;
  
  switch (period) {
    case 'day':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const filters = {
    visitDate: {
      $gte: startDate,
      $lte: now
    }
  };

  if (parkingId) {
    const parking = await Parking.findByIdOrParkingId(parkingId);
    if (parking) {
      filters.parking = parking._id;
    }
  }

  // Get statistics
  const totalVisits = await Visit.countDocuments(filters);
  const verifiedVisits = await Visit.countDocuments({
    ...filters,
    isVerified: true
  });
  const totalCoinsEarned = await Visit.aggregate([
    { $match: filters },
    { $group: { _id: null, total: { $sum: '$coinsEarned' } } }
  ]);

  const averageDistance = await Visit.aggregate([
    { $match: filters },
    { $group: { _id: null, average: { $avg: '$distance' } } }
  ]);

  // Get visits by day for the last 7 days
  const dailyVisits = await Visit.aggregate([
    {
      $match: {
        visitDate: {
          $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          $lte: now
        },
        ...(parkingId && { parking: parkingId })
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$visitDate' }
        },
        count: { $sum: 1 },
        coinsEarned: { $sum: '$coinsEarned' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json({
    success: true,
    data: {
      statistics: {
        totalVisits,
        verifiedVisits,
        totalCoinsEarned: totalCoinsEarned[0]?.total || 0,
        averageDistance: averageDistance[0]?.average || 0,
        verificationRate: totalVisits > 0 ? ((verifiedVisits / totalVisits) * 100).toFixed(2) : 0
      },
      dailyVisits,
      period,
      dateRange: {
        start: startDate,
        end: now
      }
    }
  });
});

// @desc    Get nearby visits
// @route   GET /api/visits/nearby
// @access  Private
export const getNearbyVisits = asyncHandler(async (req, res) => {
  const { coordinates, maxDistance = 10000, startDate, endDate } = req.query;

  if (!coordinates) {
    throw new AppError('Coordinates are required', 400);
  }

  const coords = coordinates.split(',').map(Number);
  if (coords.length !== 2) {
    throw new AppError('Invalid coordinates format. Use "longitude,latitude"', 400);
  }

  const filters = {};
  if (startDate && endDate) {
    filters.visitDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const visits = await Visit.findNearby(coords, parseInt(maxDistance), filters);

  res.json({
    success: true,
    data: {
      visits
    }
  });
});

// @desc    Get user's visit history
// @route   GET /api/visits/history
// @access  Private
export const getVisitHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, startDate, endDate } = req.query;

  const filters = {};
  if (startDate && endDate) {
    filters.visitDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const visits = await Visit.findByUser(req.user._id, filters)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Visit.countDocuments({
    user: req.user._id,
    ...filters
  });

  // Calculate summary statistics
  const totalCoinsEarned = visits.reduce((sum, visit) => sum + visit.coinsEarned, 0);
  const totalDistance = visits.reduce((sum, visit) => sum + visit.distance, 0);
  const averageDistance = visits.length > 0 ? totalDistance / visits.length : 0;

  res.json({
    success: true,
    data: {
      visits,
      summary: {
        totalVisits: visits.length,
        totalCoinsEarned,
        averageDistance: Math.round(averageDistance * 100) / 100
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Delete visit (admin only)
// @route   DELETE /api/visits/:visitId
// @access  Private (Admin)
export const deleteVisit = asyncHandler(async (req, res) => {
  const { visitId } = req.params;

  const visit = await Visit.findById(visitId);

  if (!visit) {
    throw new AppError('Visit not found', 404);
  }

  // Remove coins from user
  if (visit.coinsEarned > 0) {
    await User.findByIdAndUpdate(visit.user, {
      $inc: { 'wallet.coins': -visit.coinsEarned }
    });
  }

  await Visit.findByIdAndDelete(visitId);

  res.json({
    success: true,
    message: 'Visit deleted successfully'
  });
});
