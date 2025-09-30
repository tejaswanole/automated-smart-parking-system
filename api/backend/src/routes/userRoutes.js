import express from 'express';
import {
  activateUser,
  addCoinsToWallet,
  changePassword,
  deactivateUser,
  getAllUsers,
  getNearbyUsers,
  getProfile,
  getUserById,
  getWallet,
  getWalletTransactions,
  loginUser,
  logoutUser,
  registerUser,
  updateProfile,
  updateUserRole
} from '../controllers/userController.js';
import {
  authenticate,
  authorizeAdmin
} from '../middlewares/auth.js';
import {
  validateId,
  validateQueryParams,
  validateUserLogin,
  validateUserRegistration,
  validateUserUpdate
} from '../middlewares/validation.js';

const router = express.Router();

// Public routes
router.post('/register', validateUserRegistration, registerUser);
router.post('/login', validateUserLogin, loginUser);

// Protected routes
router.use(authenticate);

// User profile routes
router.get('/profile', getProfile);
router.put('/profile', validateUserUpdate, updateProfile);
router.put('/change-password', changePassword);

// Wallet routes
router.get('/wallet', getWallet);
router.get('/wallet/transactions', getWalletTransactions);

// User management routes (admin only)
router.get('/', authorizeAdmin, validateQueryParams, getAllUsers);
router.get('/nearby', validateQueryParams, getNearbyUsers);
router.get('/:userId', authorizeAdmin, validateId, getUserById);
router.put('/:userId/role', authorizeAdmin, validateId, updateUserRole);
router.put('/:userId/deactivate', authorizeAdmin, validateId, deactivateUser);
router.put('/:userId/activate', authorizeAdmin, validateId, activateUser);
router.post('/:userId/wallet/add-coins', authorizeAdmin, validateId, addCoinsToWallet);

// Logout route
router.post('/logout', logoutUser);

export default router;
