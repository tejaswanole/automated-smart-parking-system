import { ERROR_MESSAGES, MAX_STAFF_PER_PARKING, SUCCESS_MESSAGES, USER_ROLES } from '../constants.js';
import { AppError, asyncHandler } from '../middlewares/errorHandler.js';
import Parking from '../models/Parking.js';
import User from '../models/User.js';

// @desc    Create a new parking
// @route   POST /api/parkings
// @access  Private (Admin/Owner)
export const createParking = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    location,
    parkingType,
    paymentType,
    ownershipType,
    capacity,
    hourlyRate,
    amenities,
    operatingHours
  } = req.body;

  // Create parking
  const parking = await Parking.create({
    name,
    description,
    location,
    parkingType,
    paymentType,
    ownershipType,
    capacity,
    hourlyRate,
    amenities,
    operatingHours,
    owner: req.user._id
  });

  // Add parking to user's owned parkings
  await User.findByIdAndUpdate(req.user._id, {
    $push: { ownedParkings: parking._id }
  });

  res.status(201).json({
    success: true,
    message: SUCCESS_MESSAGES.PARKING_CREATED,
    data: {
      parking
    }
  });
});

// @desc    Get all parkings
// @route   GET /api/parkings
// @access  Public
export const getAllParkings = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    parkingType,
    paymentType,
    ownershipType,
    search,
    isFull
  } = req.query;

  const query = { isActive: true, isApproved: true };

  if (parkingType) query.parkingType = parkingType;
  if (paymentType) query.paymentType = paymentType;
  if (ownershipType) query.ownershipType = ownershipType;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const parkings = await Parking.find(query)
    .populate('owner', 'name email phone')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  // Filter by availability if requested
  let filteredParkings = parkings;
  if (isFull === 'false') {
    filteredParkings = parkings.filter(parking => !parking.isFull());
  } else if (isFull === 'true') {
    filteredParkings = parkings.filter(parking => parking.isFull());
  }

  const total = await Parking.countDocuments(query);

  res.json({
    success: true,
    data: {
      parkings: filteredParkings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get nearby parkings
// @route   GET /api/parkings/nearby
// @access  Public
export const getNearbyParkings = asyncHandler(async (req, res) => {
  const { coordinates, maxDistance = 10000, filters = {} } = req.query;

  if (!coordinates) {
    throw new AppError('Coordinates are required', 400);
  }

  const coords = coordinates.split(',').map(Number);
  if (coords.length !== 2) {
    throw new AppError('Invalid coordinates format. Use "longitude,latitude"', 400);
  }

  // Parse filters
  const parkingFilters = {};
  if (filters.parkingType) parkingFilters.parkingType = filters.parkingType;
  if (filters.paymentType) parkingFilters.paymentType = filters.paymentType;
  if (filters.ownershipType) parkingFilters.ownershipType = filters.ownershipType;

  const parkings = await Parking.findNearby(coords, parseInt(maxDistance), parkingFilters);

  res.json({
    success: true,
    data: {
      parkings
    }
  });
});

// @desc    Get available parkings
// @route   GET /api/parkings/available
// @access  Public
export const getAvailableParkings = asyncHandler(async (req, res) => {
  const { coordinates, maxDistance = 10000, filters = {} } = req.query;

  if (!coordinates) {
    throw new AppError('Coordinates are required', 400);
  }

  const coords = coordinates.split(',').map(Number);
  if (coords.length !== 2) {
    throw new AppError('Invalid coordinates format. Use "longitude,latitude"', 400);
  }

  const parkings = await Parking.findAvailable(coords, parseInt(maxDistance), filters);

  res.json({
    success: true,
    data: {
      parkings
    }
  });
});

// @desc    Get parking by ID
// @route   GET /api/parkings/:parkingId
// @access  Public
export const getParkingById = asyncHandler(async (req, res) => {
  const { parkingId } = req.params;

  const parking = await Parking.findByIdOrParkingId(parkingId)
    .populate('owner', 'name email phone')
    .populate('staff', 'name email phone');

  if (!parking) {
    throw new AppError(ERROR_MESSAGES.PARKING_NOT_FOUND, 404);
  }

  res.json({
    success: true,
    data: {
      parking
    }
  });
});

// @desc    Update parking
// @route   PUT /api/parkings/:parkingId
// @access  Private (Owner/Admin)
export const updateParking = asyncHandler(async (req, res) => {
  const { parkingId } = req.params;
  const updateData = req.body;

  const parking = await Parking.findByIdOrParkingId(parkingId);

  if (!parking) {
    throw new AppError(ERROR_MESSAGES.PARKING_NOT_FOUND, 404);
  }

  // Check if user is owner or admin
  if (req.user.role !== USER_ROLES.ADMIN && parking.owner.toString() !== req.user._id.toString()) {
    throw new AppError('You are not authorized to update this parking', 403);
  }

  // Update parking
  Object.keys(updateData).forEach(key => {
    if (key !== 'owner' && key !== 'parkingId') {
      parking[key] = updateData[key];
    }
  });

  await parking.save();

  res.json({
    success: true,
    message: SUCCESS_MESSAGES.PARKING_UPDATED,
    data: {
      parking
    }
  });
});

// @desc    Delete parking
// @route   DELETE /api/parkings/:parkingId
// @access  Private (Owner/Admin)
export const deleteParking = asyncHandler(async (req, res) => {
  const { parkingId } = req.params;


  const parking = await Parking.findOne(parkingId);

  if (!parking) {
    throw new AppError(ERROR_MESSAGES.PARKING_NOT_FOUND, 404);
  }

  // Check if user is owner or admin
  if (req.user.role !== USER_ROLES.ADMIN && parking.owner.toString() !== req.user._id.toString()) {
    throw new AppError('You are not authorized to delete this parking', 403);
  }

  // Soft delete
  parking.isActive = false;
  await parking.save();

  res.json({
    success: true,
    message: 'Parking deleted successfully'
  });
});

// @desc    Update vehicle count (for CV model and staff)
// @route   PUT /api/parkings/:parkingId/vehicle-count
// @access  Private (Staff/Owner/Admin)
export const updateVehicleCount = asyncHandler(async (req, res) => {
  const { parkingId } = req.params;
  const { vehicleType, count } = req.body;

  const parking = await Parking.findByIdOrParkingId(parkingId);

  if (!parking) {
    throw new AppError(ERROR_MESSAGES.PARKING_NOT_FOUND, 404);
  }

  // Update vehicle count
  await parking.updateVehicleCount(vehicleType, count);

  res.json({
    success: true,
    message: 'Vehicle count updated successfully',
    data: {
      parking: {
        _id: parking._id,
        parkingId: parking.parkingId,
        currentCount: parking.currentCount,
        lastUpdated: parking.lastUpdated
      }
    }
  });
});

// @desc    Increment vehicle count
// @route   POST /api/parkings/:parkingId/vehicle-count/increment
// @access  Private (Staff/Owner/Admin)
export const incrementVehicleCount = asyncHandler(async (req, res) => {
  const { parkingId } = req.params;
  const { vehicleType, increment = 1 } = req.body;

  const parking = await Parking.findByIdOrParkingId(parkingId);

  if (!parking) {
    throw new AppError(ERROR_MESSAGES.PARKING_NOT_FOUND, 404);
  }

  // Increment vehicle count
  await parking.incrementVehicleCount(vehicleType, increment);

  res.json({
    success: true,
    message: 'Vehicle count incremented successfully',
    data: {
      parking: {
        _id: parking._id,
        parkingId: parking.parkingId,
        currentCount: parking.currentCount,
        lastUpdated: parking.lastUpdated
      }
    }
  });
});

// @desc    Decrement vehicle count
// @route   POST /api/parkings/:parkingId/vehicle-count/decrement
// @access  Private (Staff/Owner/Admin)
export const decrementVehicleCount = asyncHandler(async (req, res) => {
  const { parkingId } = req.params;
  const { vehicleType, decrement = 1 } = req.body;

  const parking = await Parking.findByIdOrParkingId(parkingId);

  if (!parking) {
    throw new AppError(ERROR_MESSAGES.PARKING_NOT_FOUND, 404);
  }

  // Decrement vehicle count
  await parking.decrementVehicleCount(vehicleType, decrement);

  res.json({
    success: true,
    message: 'Vehicle count decremented successfully',
    data: {
      parking: {
        _id: parking._id,
        parkingId: parking.parkingId,
        currentCount: parking.currentCount,
        lastUpdated: parking.lastUpdated
      }
    }
  });
});

// @desc    Get parking statistics
// @route   GET /api/parkings/:parkingId/statistics
// @access  Private (Owner/Admin)
export const getParkingStatistics = asyncHandler(async (req, res) => {
  const { parkingId } = req.params;
  const { period = 'month' } = req.query;

  const parking = await Parking.findByIdOrParkingId(parkingId);

  if (!parking) {
    throw new AppError(ERROR_MESSAGES.PARKING_NOT_FOUND, 404);
  }

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

  // Get statistics from Visit model
  const Visit = (await import('../models/Visit.js')).default;
  const statistics = await Visit.getStatistics(parking._id, startDate, now);

  res.json({
    success: true,
    data: {
      parking: {
        _id: parking._id,
        name: parking.name,
        parkingId: parking.parkingId
      },
      statistics: statistics[0] || {
        totalVisits: 0,
        totalCoinsEarned: 0,
        averageDistance: 0,
        verifiedVisits: 0
      },
      period,
      dateRange: {
        start: startDate,
        end: now
      }
    }
  });
});

// @desc    Add staff to parking
// @route   POST /api/parkings/:parkingId/staff
// @access  Private (Owner/Admin)
export const addStaffToParking = asyncHandler(async (req, res) => {
  const { parkingId } = req.params;
  const { userId } = req.body;

  const parking = await Parking.findByIdOrParkingId(parkingId);

  if (!parking) {
    throw new AppError(ERROR_MESSAGES.PARKING_NOT_FOUND, 404);
  }

  // Check if user is owner or admin
  if (req.user.role !== USER_ROLES.ADMIN && parking.owner.toString() !== req.user._id.toString()) {
    throw new AppError('You are not authorized to manage staff for this parking', 403);
  }

  // Check staff limit
  if (parking.staff.length >= MAX_STAFF_PER_PARKING) {
    throw new AppError('Staff limit exceeded for this parking', 400);
  }

  // Check if user is already staff
  if (parking.staff.includes(userId)) {
    throw new AppError('User is already staff for this parking', 400);
  }

  // Add user to staff
  parking.staff.push(userId);
  await parking.save();

  // Update user's staff parking
  await User.findByIdAndUpdate(userId, {
    role: USER_ROLES.STAFF,
    staffParking: parking._id
  });

  res.json({
    success: true,
    message: 'Staff added successfully',
    data: {
      parking: {
        _id: parking._id,
        parkingId: parking.parkingId,
        staff: parking.staff
      }
    }
  });
});

// @desc    Remove staff from parking
// @route   DELETE /api/parkings/:parkingId/staff/:userId
// @access  Private (Owner/Admin)
export const removeStaffFromParking = asyncHandler(async (req, res) => {
  const { parkingId, userId } = req.params;

  const parking = await Parking.findByIdOrParkingId(parkingId);

  if (!parking) {
    throw new AppError(ERROR_MESSAGES.PARKING_NOT_FOUND, 404);
  }

  // Check if user is owner or admin
  if (req.user.role !== USER_ROLES.ADMIN && parking.owner.toString() !== req.user._id.toString()) {
    throw new AppError('You are not authorized to manage staff for this parking', 403);
  }

  // Remove user from staff
  parking.staff = parking.staff.filter(staffId => staffId.toString() !== userId);
  await parking.save();

  // Update user's role and remove staff parking
  await User.findByIdAndUpdate(userId, {
    role: USER_ROLES.USER,
    $unset: { staffParking: 1 }
  });

  res.json({
    success: true,
    message: 'Staff removed successfully',
    data: {
      parking: {
        _id: parking._id,
        parkingId: parking.parkingId,
        staff: parking.staff
      }
    }
  });
});

// @desc    Get parking staff
// @route   GET /api/parkings/:parkingId/staff
// @access  Private (Owner/Admin/Staff)
export const getParkingStaff = asyncHandler(async (req, res) => {
  const { parkingId } = req.params;

  const parking = await Parking.findByIdOrParkingId(parkingId)
    .populate('staff', 'name email phone role');

  if (!parking) {
    throw new AppError(ERROR_MESSAGES.PARKING_NOT_FOUND, 404);
  }

  res.json({
    success: true,
    data: {
      staff: parking.staff
    }
  });
});

// @desc    Approve parking (admin only)
// @route   PUT /api/parkings/:parkingId/approve
// @access  Private (Admin)
export const approveParking = asyncHandler(async (req, res) => {
  const { parkingId } = req.params;

  const parking = await Parking.findByIdOrParkingId(parkingId);

  if (!parking) {
    throw new AppError(ERROR_MESSAGES.PARKING_NOT_FOUND, 404);
  }

  if (parking.isApproved) {
    throw new AppError('Parking is already approved', 400);
  }

  parking.isApproved = true;
  parking.approvedBy = req.user._id;
  parking.approvedAt = new Date();
  await parking.save();

  res.json({
    success: true,
    message: 'Parking approved successfully',
    data: {
      parking: {
        _id: parking._id,
        parkingId: parking.parkingId,
        isApproved: parking.isApproved,
        approvedAt: parking.approvedAt
      }
    }
  });
});

// @desc    Get user's owned parkings
// @route   GET /api/parkings/owned
// @access  Private (Owner)
export const getOwnedParkings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('ownedParkings');

  res.json({
    success: true,
    data: {
      parkings: user.ownedParkings
    }
  });
});

// @desc    Get staff parking
// @route   GET /api/parkings/staff
// @access  Private (Staff)
export const getStaffParking = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('staffParking');

  if (!user.staffParking) {
    throw new AppError('You are not assigned to any parking', 404);
  }

  res.json({
    success: true,
    data: {
      parking: user.staffParking
    }
  });
});
