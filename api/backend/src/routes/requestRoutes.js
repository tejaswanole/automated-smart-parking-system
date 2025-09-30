import express from 'express';
import multer from 'multer';
import path from 'path';
import {
    approveRequest,
    createRequest,
    deleteRequest,
    denyRequest,
    getAllRequests,
    getApprovedRequests,
    getNearbyRequests,
    getPendingRequests,
    getRequestById,
    getRequestStatistics,
    getUserRequests,
    updateRequest
} from '../controllers/requestController.js';
import {
    authenticate,
    authorizeAdmin,
    authorizeUser
} from '../middlewares/auth.js';
import {
    validateQueryParams,
    validateRequestApproval,
    validateRequestId
} from '../middlewares/validation.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Public routes (no authentication required)
router.get('/approved', validateQueryParams, getApprovedRequests);

// All other routes require authentication
router.use(authenticate);

// Request management routes
// router.post('/', authorizeUser, validateRequestCreation, createRequest);
router.post('/', authorizeUser, upload.array('images', 5), createRequest);
router.get('/user/me', authorizeUser, validateQueryParams, getUserRequests);
router.get('/nearby', authorizeUser, validateQueryParams, getNearbyRequests);

// Request CRUD routes
router.get('/:requestId', authorizeUser, validateRequestId, getRequestById);
router.put('/:requestId', authorizeUser, validateRequestId, updateRequest);
router.delete('/:requestId', authorizeUser, validateRequestId, deleteRequest);

// Admin routes
router.get('/', authorizeAdmin, validateQueryParams, getAllRequests);
router.get('/pending', authorizeAdmin, validateQueryParams, getPendingRequests);
router.get('/statistics', authorizeAdmin, validateQueryParams, getRequestStatistics);
router.put('/:requestId/approve', authorizeAdmin, validateRequestId, validateRequestApproval, approveRequest);
router.put('/:requestId/deny', authorizeAdmin, validateRequestId, validateRequestApproval, denyRequest);

export default router;
