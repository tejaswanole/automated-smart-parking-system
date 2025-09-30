import express from 'express';
import {
    addStaffToParking,
    approveParking,
    createParking,
    decrementVehicleCount,
    deleteParking,
    getAllParkings,
    getAvailableParkings,
    getNearbyParkings,
    getOwnedParkings,
    getParkingById,
    getParkingStaff,
    getParkingStatistics,
    getStaffParking,
    incrementVehicleCount,
    removeStaffFromParking,
    updateParking,
    updateVehicleCount
} from '../controllers/parkingController.js';
import {
    authenticate,
    authorizeAdmin,
    authorizeOwner,
    authorizeParkingOwner,
    authorizeParkingStaff,
    optionalAuth
} from '../middlewares/auth.js';
import {
    validateParkingCreation,
    validateParkingId,
    validateParkingUpdate,
    validateQueryParams,
    validateVehicleCountUpdate
} from '../middlewares/validation.js';

const router = express.Router();

// Public routes (with optional authentication)
router.get('/', optionalAuth, validateQueryParams, getAllParkings);
router.get('/nearby', optionalAuth, validateQueryParams, getNearbyParkings);
router.get('/available', optionalAuth, validateQueryParams, getAvailableParkings);
router.get('/:parkingId', optionalAuth, validateParkingId, getParkingById);

// Protected routes
router.use(authenticate);

// Parking management routes
router.post('/', authorizeOwner, validateParkingCreation, createParking);
router.put('/:parkingId', authorizeParkingOwner, validateParkingUpdate, updateParking);
// router.delete('/:parkingId', authorizeParkingOwner, deleteParking);
router.delete('/:parkingId',  deleteParking);

// Vehicle count management routes
router.put('/:parkingId/vehicle-count', authorizeParkingStaff, validateVehicleCountUpdate, updateVehicleCount);
router.post('/:parkingId/vehicle-count/increment', authorizeParkingStaff, validateVehicleCountUpdate, incrementVehicleCount);
router.post('/:parkingId/vehicle-count/decrement', authorizeParkingStaff, validateVehicleCountUpdate, decrementVehicleCount);

// Staff management routes
router.post('/:parkingId/staff', authorizeParkingOwner, addStaffToParking);
router.delete('/:parkingId/staff/:userId', authorizeParkingOwner, removeStaffFromParking);
router.get('/:parkingId/staff', authorizeParkingStaff, getParkingStaff);

// Statistics routes
router.get('/:parkingId/statistics', authorizeParkingOwner, getParkingStatistics);

// User-specific parking routes
router.get('/owned', authorizeOwner, getOwnedParkings);
router.get('/staff', getStaffParking);

// Admin routes
router.put('/:parkingId/approve', authorizeAdmin, validateParkingId, approveParking);

export default router;
