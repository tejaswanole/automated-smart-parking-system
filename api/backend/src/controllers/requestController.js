import { COIN_REWARDS, SUCCESS_MESSAGES } from '../constants.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import { AppError, asyncHandler } from '../middlewares/errorHandler.js';
import Parking from '../models/Parking.js';
import Request from '../models/Request.js';
import User from '../models/User.js';

// @desc    Create a new request
// @route   POST /api/requests
// @access  Private
export const createRequest = asyncHandler(async (req, res) => {
  let requestData;
  
  // Handle both JSON and FormData requests
  if (req.body.requestData) {
    // FormData request with images
    requestData = JSON.parse(req.body.requestData);
  } else {
    // Regular JSON request
    requestData = req.body;
  }
  
  const {
    requestType,
    title,
    description,
    location,
    parkingDetails,
    noParkingDetails
  } = requestData;

  let uploadedImages = [];

  // Handle image uploads if files are present
  if (req.files && req.files.length > 0) {
    try {
      // Upload each image to Cloudinary
      for (const file of req.files) {
        const uploadResult = await uploadToCloudinary(file, 'parking-requests');
        
        if (uploadResult.success) {
          uploadedImages.push({
            url: uploadResult.data.url,
            publicId: uploadResult.data.publicId,
            caption: file.originalname
          });
        } else {
          console.error('Failed to upload image:', uploadResult.error);
        }
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      throw new AppError('Failed to upload images', 500);
    }
  }

  // Create request
  const request = await Request.create({
    user: req.user._id,
    requestType,
    title,
    description,
    location,
    images: uploadedImages,
    parkingDetails,
    noParkingDetails
  });

  res.status(201).json({
    success: true,
    message: SUCCESS_MESSAGES.REQUEST_CREATED,
    data: {
      request
    }
  });
});

// @desc    Get all requests (admin only)
// @route   GET /api/requests
// @access  Private (Admin)
export const getAllRequests = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    requestType,
    search
  } = req.query;

  const query = { isActive: true };

  if (status) query.status = status;
  if (requestType) query.requestType = requestType;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const requests = await Request.find(query)
    .populate('user', 'name email phone')
    .populate('approvedBy', 'name email')
    .populate('deniedBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Request.countDocuments(query);

  res.json({
    success: true,
    data: {
      requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get approved requests (public)
// @route   GET /api/requests/approved
// @access  Public
export const getApprovedRequests = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    requestType,
    search
  } = req.query;

  const query = { 
    isActive: true,
    status: 'approved'
  };

  if (requestType) query.requestType = requestType;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const requests = await Request.find(query)
    .populate('user', 'name email phone')
    .populate('approvedBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Request.countDocuments(query);

  res.json({
    success: true,
    data: {
      requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get pending requests (admin only)
// @route   GET /api/requests/pending
// @access  Private (Admin)
export const getPendingRequests = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, requestType } = req.query;

  const filters = {};
  if (requestType) filters.requestType = requestType;

  const requests = await Request.findPending(filters)
    .populate('approvedBy', 'name email')
    .populate('deniedBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Request.countDocuments({
    status: 'pending',
    isActive: true,
    ...filters
  });

  res.json({
    success: true,
    data: {
      requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get request by ID
// @route   GET /api/requests/:requestId
// @access  Private
export const getRequestById = asyncHandler(async (req, res) => {
  const { requestId } = req.params;

  const request = await Request.findById(requestId)
    .populate('user', 'name email phone')
    .populate('approvedBy', 'name email')
    .populate('deniedBy', 'name email');

  if (!request) {
    throw new AppError('Request not found', 404);
  }

  // Check if user is authorized to view this request
  if (req.user.role !== 'admin' && request.user._id.toString() !== req.user._id.toString()) {
    throw new AppError('You are not authorized to view this request', 403);
  }

  res.json({
    success: true,
    data: {
      request
    }
  });
});

// @desc    Get user's requests
// @route   GET /api/requests/user/me
// @access  Private
export const getUserRequests = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, requestType } = req.query;

  const filters = {};
  if (status) filters.status = status;
  if (requestType) filters.requestType = requestType;

  const requests = await Request.findByUser(req.user._id, filters)
    .populate('approvedBy', 'name email')
    .populate('deniedBy', 'name email')
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Request.countDocuments({
    user: req.user._id,
    isActive: true,
    ...filters
  });

  res.json({
    success: true,
    data: {
      requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Approve request (admin only)
// @route   PUT /api/requests/:requestId/approve
// @access  Private (Admin)
export const approveRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { coinsAwarded, adminNotes } = req.body;

  const request = await Request.findById(requestId)
    .populate('user', 'name email wallet');

  if (!request) {
    throw new AppError('Request not found', 404);
  }

  if (request.status !== 'pending') {
    throw new AppError('Request is not pending', 400);
  }

  // Determine coins to award based on request type
  let coinsToAward = coinsAwarded || 0;
  if (!coinsAwarded) {
    if (request.requestType === 'parking') {
      coinsToAward = COIN_REWARDS.PARKING_REQUEST_APPROVED;
    } else if (request.requestType === 'no_parking') {
      coinsToAward = COIN_REWARDS.NO_PARKING_REQUEST_APPROVED;
    }
  }

  // Approve request
  await request.approve(req.user._id, coinsToAward, adminNotes);

  // If it's a parking request, create the actual parking
  if (request.requestType === 'parking' && request.parkingDetails) {
    const parkingData = {
      name: request.parkingDetails.name || request.title,
      description: request.description,
      location: request.location,
      parkingType: request.parkingDetails.parkingType,
      paymentType: request.parkingDetails.paymentType,
      ownershipType: request.parkingDetails.ownershipType,
      capacity: request.parkingDetails.capacity,
      hourlyRate: request.parkingDetails.hourlyRate,
      amenities: request.parkingDetails.amenities || [],
      operatingHours: request.parkingDetails.operatingHours,
      owner: request.user._id,
      isApproved: true,
      approvedBy: req.user._id,
      approvedAt: new Date()
    };

    const parking = await Parking.create(parkingData);

    // Add parking to user's owned parkings
    await User.findByIdAndUpdate(request.user._id, {
      $push: { ownedParkings: parking._id }
    });
  }

  // Award coins to user
  if (coinsToAward > 0) {
    await request.user.addCoins(coinsToAward, `Request approved: ${request.title}`);
  }

  res.json({
    success: true,
    message: SUCCESS_MESSAGES.REQUEST_APPROVED,
    data: {
      request: {
        _id: request._id,
        status: request.status,
        coinsAwarded: request.coinsAwarded,
        approvedAt: request.approvedAt
      }
    }
  });
});

// @desc    Deny request (admin only)
// @route   PUT /api/requests/:requestId/deny
// @access  Private (Admin)
export const denyRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { adminNotes } = req.body;

  const request = await Request.findById(requestId);

  if (!request) {
    throw new AppError('Request not found', 404);
  }

  if (request.status !== 'pending') {
    throw new AppError('Request is not pending', 400);
  }

  // Deny request
  await request.deny(req.user._id, adminNotes);

  res.json({
    success: true,
    message: SUCCESS_MESSAGES.REQUEST_DENIED,
    data: {
      request: {
        _id: request._id,
        status: request.status,
        deniedAt: request.deniedAt
      }
    }
  });
});

// @desc    Update request
// @route   PUT /api/requests/:requestId
// @access  Private
export const updateRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const updateData = req.body;

  const request = await Request.findById(requestId);

  if (!request) {
    throw new AppError('Request not found', 404);
  }

  // Check if user is authorized to update this request
  if (req.user.role !== 'admin' && request.user.toString() !== req.user._id.toString()) {
    throw new AppError('You are not authorized to update this request', 403);
  }

  // Only allow updates if request is pending
  if (request.status !== 'pending') {
    throw new AppError('Cannot update non-pending request', 400);
  }

  // Update request
  Object.keys(updateData).forEach(key => {
    if (key !== 'user' && key !== 'status' && key !== 'approvedBy' && key !== 'deniedBy') {
      request[key] = updateData[key];
    }
  });

  await request.save();

  res.json({
    success: true,
    message: 'Request updated successfully',
    data: {
      request
    }
  });
});

// @desc    Delete request
// @route   DELETE /api/requests/:requestId
// @access  Private
export const deleteRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;

  const request = await Request.findById(requestId);

  if (!request) {
    throw new AppError('Request not found', 404);
  }

  // Check if user is authorized to delete this request
  if (req.user.role !== 'admin' && request.user.toString() !== req.user._id.toString()) {
    throw new AppError('You are not authorized to delete this request', 403);
  }

  // Only allow deletion if request is pending
  if (request.status !== 'pending') {
    throw new AppError('Cannot delete non-pending request', 400);
  }

  // Soft delete
  request.isActive = false;
  await request.save();

  res.json({
    success: true,
    message: 'Request deleted successfully'
  });
});

// @desc    Get nearby requests
// @route   GET /api/requests/nearby
// @access  Private
export const getNearbyRequests = asyncHandler(async (req, res) => {
  const { coordinates, maxDistance = 10000, status, requestType } = req.query;

  if (!coordinates) {
    throw new AppError('Coordinates are required', 400);
  }

  const coords = coordinates.split(',').map(Number);
  if (coords.length !== 2) {
    throw new AppError('Invalid coordinates format. Use "longitude,latitude"', 400);
  }

  const filters = {};
  if (status) filters.status = status;
  if (requestType) filters.requestType = requestType;

  const requests = await Request.findNearby(coords, parseInt(maxDistance), filters);

  res.json({
    success: true,
    data: {
      requests
    }
  });
});

// @desc    Get request statistics (admin only)
// @route   GET /api/requests/statistics
// @access  Private (Admin)
export const getRequestStatistics = asyncHandler(async (req, res) => {
  const { period = 'month' } = req.query;

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

  // Get statistics
  const totalRequests = await Request.countDocuments({
    createdAt: { $gte: startDate, $lte: now },
    isActive: true
  });

  const pendingRequests = await Request.countDocuments({
    status: 'pending',
    createdAt: { $gte: startDate, $lte: now },
    isActive: true
  });

  const approvedRequests = await Request.countDocuments({
    status: 'approved',
    createdAt: { $gte: startDate, $lte: now },
    isActive: true
  });

  const deniedRequests = await Request.countDocuments({
    status: 'denied',
    createdAt: { $gte: startDate, $lte: now },
    isActive: true
  });

  const parkingRequests = await Request.countDocuments({
    requestType: 'parking',
    createdAt: { $gte: startDate, $lte: now },
    isActive: true
  });

  const noParkingRequests = await Request.countDocuments({
    requestType: 'no_parking',
    createdAt: { $gte: startDate, $lte: now },
    isActive: true
  });

  // Get total coins awarded
  const approvedRequestsWithCoins = await Request.find({
    status: 'approved',
    createdAt: { $gte: startDate, $lte: now },
    isActive: true
  });

  const totalCoinsAwarded = approvedRequestsWithCoins.reduce((total, request) => {
    return total + (request.coinsAwarded || 0);
  }, 0);

  res.json({
    success: true,
    data: {
      statistics: {
        totalRequests,
        pendingRequests,
        approvedRequests,
        deniedRequests,
        parkingRequests,
        noParkingRequests,
        totalCoinsAwarded,
        approvalRate: totalRequests > 0 ? ((approvedRequests / totalRequests) * 100).toFixed(2) : 0
      },
      period,
      dateRange: {
        start: startDate,
        end: now
      }
    }
  });
});
