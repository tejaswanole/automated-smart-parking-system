import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants.js';
import { generateToken } from "../middlewares/auth.js";
import { AppError, asyncHandler } from '../middlewares/errorHandler.js';
import User from '../models/User.js';

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { phone }]
  });

  if (existingUser) {
    throw new AppError('User with this email or phone already exists', 400);
  }

  // Create new user
  const user = await User.create({
    name,
    email,
    phone,
    password
  });

  // Generate token
  const token = generateToken(user._id);

  // Set cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.status(201).json({
    success: true,
    message: SUCCESS_MESSAGES.USER_CREATED,
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        wallet: user.wallet
      },
      token
    }
  });
});

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
  }

  if (!user.isActive) {
    throw new AppError('Account is deactivated. Please contact support.', 401);
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const token = generateToken(user._id);

  // Set cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.json({
    success: true,
    message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        wallet: user.wallet,
        ownedParkings: user.ownedParkings,
        staffParking: user.staffParking,
        location: user.location
      },
      token
    }
  });
});

// @desc    Logout user
// @route   POST /api/users/logout
// @access  Private
export const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.json({
    success: true,
    message: SUCCESS_MESSAGES.LOGOUT_SUCCESS
  });
});

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('ownedParkings', 'name location parkingType paymentType')
    .populate('staffParking', 'name location parkingType paymentType');

  res.json({
    success: true,
    data: {
      user
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, location } = req.body;

  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (phone) {
    // Check if phone is already taken
    const existingUser = await User.findOne({ phone, _id: { $ne: user._id } });
    if (existingUser) {
      throw new AppError('Phone number is already in use', 400);
    }
    user.phone = phone;
  }
  if (location) user.location = location;

  await user.save();

  res.json({
    success: true,
    message: SUCCESS_MESSAGES.USER_UPDATED,
    data: {
      user
    }
  });
});

// @desc    Get user wallet
// @route   GET /api/users/wallet
// @access  Private
export const getWallet = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.json({
    success: true,
    data: {
      wallet: user.wallet
    }
  });
});

// @desc    Get wallet transactions
// @route   GET /api/users/wallet/transactions
// @access  Private
export const getWalletTransactions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const user = await User.findById(req.user._id);
  const transactions = user.wallet.transactions
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice((page - 1) * limit, page * limit);

  res.json({
    success: true,
    data: {
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: user.wallet.transactions.length,
        pages: Math.ceil(user.wallet.transactions.length / limit)
      }
    }
  });
});

// @desc    Add coins to user wallet (for admin/owner)
// @route   POST /api/users/:userId/wallet/add-coins
// @access  Private (Admin/Owner)
export const addCoinsToWallet = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { amount, description } = req.body;

  if (amount <= 0) {
    throw new AppError('Amount must be positive', 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
  }

  await user.addCoins(amount, description);

  res.json({
    success: true,
    message: SUCCESS_MESSAGES.COINS_ADDED,
    data: {
      wallet: user.wallet
    }
  });
});

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private (Admin)
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, search } = req.query;

  const query = { isActive: true };
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(query)
    .select('-password')
    .populate('ownedParkings', 'name location')
    .populate('staffParking', 'name location')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get user by ID (admin only)
// @route   GET /api/users/:userId
// @access  Private (Admin)
export const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId)
    .select('-password')
    .populate('ownedParkings', 'name location parkingType paymentType')
    .populate('staffParking', 'name location parkingType paymentType');

  if (!user) {
    throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
  }

  res.json({
    success: true,
    data: {
      user
    }
  });
});

// @desc    Update user role (admin only)
// @route   PUT /api/users/:userId/role
// @access  Private (Admin)
export const updateUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
  }

  user.role = role;
  await user.save();

  res.json({
    success: true,
    message: SUCCESS_MESSAGES.USER_UPDATED,
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }
  });
});

// @desc    Deactivate user (admin only)
// @route   PUT /api/users/:userId/deactivate
// @access  Private (Admin)
export const deactivateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
  }

  user.isActive = false;
  await user.save();

  res.json({
    success: true,
    message: 'User deactivated successfully',
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    }
  });
});

// @desc    Activate user (admin only)
// @route   PUT /api/users/:userId/activate
// @access  Private (Admin)
export const activateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
  }

  user.isActive = true;
  await user.save();

  res.json({
    success: true,
    message: 'User activated successfully',
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    }
  });
});

// @desc    Get nearby users
// @route   GET /api/users/nearby
// @access  Private
export const getNearbyUsers = asyncHandler(async (req, res) => {
  const { coordinates, maxDistance = 10000 } = req.query;

  if (!coordinates) {
    throw new AppError('Coordinates are required', 400);
  }

  const coords = coordinates.split(',').map(Number);
  if (coords.length !== 2) {
    throw new AppError('Invalid coordinates format. Use "longitude,latitude"', 400);
  }

  const users = await User.findNearby(coords, parseInt(maxDistance));

  res.json({
    success: true,
    data: {
      users: users.map(user => ({
        _id: user._id,
        name: user.name,
        location: user.location,
        distance: user.distance
      }))
    }
  });
});

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError('Current password is incorrect', 400);
  }

  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});
