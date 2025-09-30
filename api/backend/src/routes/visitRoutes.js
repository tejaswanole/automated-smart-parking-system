import express from 'express';
import {
    createVisit,
    deleteVisit,
    getNearbyVisits,
    getParkingVisits,
    getUserVisits,
    getVisitById,
    getVisitHistory,
    getVisitStatistics,
    verifyVisit
} from '../controllers/visitController.js';
import {
    authenticate,
    authorizeAdmin,
    authorizeParkingStaff,
    authorizeUser
} from '../middlewares/auth.js';
import {
    validateId,
    validateParkingId,
    validateQueryParams,
    validateVisitCreation,
    validateVisitId
} from '../middlewares/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Visit management routes
router.post('/', authorizeUser, validateVisitCreation, createVisit);
router.get('/user/me', authorizeUser, validateQueryParams, getUserVisits);
router.get('/history', authorizeUser, validateQueryParams, getVisitHistory);
router.get('/statistics', authorizeUser, validateQueryParams, getVisitStatistics);
router.get('/nearby', authorizeUser, validateQueryParams, getNearbyVisits);

// Visit CRUD routes
router.get('/:visitId', authorizeUser, validateVisitId, getVisitById);
router.put('/:visitId/verify', authorizeParkingStaff, validateVisitId, verifyVisit);

// Parking-specific visit routes
router.get('/parking/:parkingId', authorizeParkingStaff, validateParkingId, validateQueryParams, getParkingVisits);

// Admin routes
router.delete('/:visitId', authorizeAdmin, validateVisitId, deleteVisit);

export default router;
