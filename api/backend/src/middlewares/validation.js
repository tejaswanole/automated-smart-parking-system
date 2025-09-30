import { body, param, query, validationResult } from 'express-validator';

// Validation result handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({
      success: false,
      message: errorMessages || 'Validation failed',
      errors: errorMessages
    });
  }
  next();
};

// User registration validation
export const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('phone')
    .matches(/^[0-9]{10}$/)
    .withMessage('Please provide a valid 10-digit phone number'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    // .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  
  handleValidationErrors
];

// User login validation
export const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// User update validation
export const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Please provide a valid 10-digit phone number'),
  
  body('location.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array with exactly 2 elements')
    .custom((value) => {
      if (value[0] < -180 || value[0] > 180) {
        throw new Error('Longitude must be between -180 and 180');
      }
      if (value[1] < -90 || value[1] > 90) {
        throw new Error('Latitude must be between -90 and 90');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Parking creation validation
export const validateParkingCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Parking name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array with exactly 2 elements')
    .custom((value) => {
      if (value[0] < -180 || value[0] > 180) {
        throw new Error('Longitude must be between -180 and 180');
      }
      if (value[1] < -90 || value[1] > 90) {
        throw new Error('Latitude must be between -90 and 90');
      }
      return true;
    }),
  
  body('parkingType')
    .isIn(['opensky', 'closedsky'])
    .withMessage('Parking type must be either opensky or closedsky'),
  
  body('paymentType')
    .isIn(['paid', 'free'])
    .withMessage('Payment type must be either paid or free'),
  
  body('ownershipType')
    .isIn(['private', 'public'])
    .withMessage('Ownership type must be either private or public'),
  
  body('capacity.car')
    .isInt({ min: 0 })
    .withMessage('Car capacity must be a non-negative integer'),
  
  body('capacity.bus_truck')
    .isInt({ min: 0 })
    .withMessage('Bus/Truck capacity must be a non-negative integer'),
  
  body('capacity.bike')
    .isInt({ min: 0 })
    .withMessage('Bike capacity must be a non-negative integer'),
  
  body('hourlyRate.car')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Car hourly rate must be a non-negative number'),
  
  body('hourlyRate.bus_truck')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Bus/Truck hourly rate must be a non-negative number'),
  
  body('hourlyRate.bike')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Bike hourly rate must be a non-negative number'),
  
  handleValidationErrors
];

// Parking update validation
export const validateParkingUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Parking name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('capacity.car')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Car capacity must be a non-negative integer'),
  
  body('capacity.bus_truck')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Bus/Truck capacity must be a non-negative integer'),
  
  body('capacity.bike')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Bike capacity must be a non-negative integer'),
  
  body('hourlyRate.car')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Car hourly rate must be a non-negative number'),
  
  body('hourlyRate.bus_truck')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Bus/Truck hourly rate must be a non-negative number'),
  
  body('hourlyRate.bike')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Bike hourly rate must be a non-negative number'),
  
  handleValidationErrors
];

// Request creation validation
export const validateRequestCreation = [
  body('requestType')
    .isIn(['parking', 'no_parking'])
    .withMessage('Request type must be either parking or no_parking'),
  
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array with exactly 2 elements')
    .custom((value) => {
      if (value[0] < -180 || value[0] > 180) {
        throw new Error('Longitude must be between -180 and 180');
      }
      if (value[1] < -90 || value[1] > 90) {
        throw new Error('Latitude must be between -90 and 90');
      }
      return true;
    }),
  
  body('parkingDetails')
    .optional()
    .custom((value, { req }) => {
      if (req.body.requestType === 'parking' && !value) {
        throw new Error('Parking details are required for parking requests');
      }
      return true;
    }),
  
  body('noParkingDetails')
    .optional()
    .custom((value, { req }) => {
      if (req.body.requestType === 'no_parking' && !value) {
        throw new Error('No-parking details are required for no-parking requests');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Request approval validation
export const validateRequestApproval = [
  body('coinsAwarded')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Coins awarded must be a non-negative integer'),
  
  body('adminNotes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Admin notes cannot exceed 500 characters'),
  
  handleValidationErrors
];

// Vehicle count update validation
export const validateVehicleCountUpdate = [
  body('vehicleType')
    .isIn(['car', 'bus_truck', 'bike'])
    .withMessage('Vehicle type must be car, bus_truck, or bike'),
  
  body('count')
    .isInt({ min: 0 })
    .withMessage('Count must be a non-negative integer'),
  
  handleValidationErrors
];

// Staff creation validation
export const validateStaffCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('phone')
    .matches(/^[0-9]{10}$/)
    .withMessage('Please provide a valid 10-digit phone number'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  handleValidationErrors
];

// Visit creation validation
export const validateVisitCreation = [
  body('parkingId')
    .notEmpty()
    .withMessage('Parking ID is required'),
  
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array with exactly 2 elements')
    .custom((value) => {
      if (value[0] < -180 || value[0] > 180) {
        throw new Error('Longitude must be between -180 and 180');
      }
      if (value[1] < -90 || value[1] > 90) {
        throw new Error('Latitude must be between -90 and 90');
      }
      return true;
    }),
  
  body('distance')
    .isFloat({ min: 0 })
    .withMessage('Distance must be a non-negative number'),
  
  handleValidationErrors
];

// Query parameter validation
export const validateQueryParams = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('maxDistance')
    .optional()
    .isFloat({ min: 0, max: 50000 })
    .withMessage('Max distance must be between 0 and 50000 meters'),
  
  handleValidationErrors
];

// ID parameter validation
export const validateId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  
  handleValidationErrors
];

// Parking ID parameter validation
export const validateParkingId = [
  param('parkingId')
    .notEmpty()
    .withMessage('Parking ID is required'),
  
  handleValidationErrors
];

// Request ID parameter validation
export const validateRequestId = [
  param('requestId')
    .isMongoId()
    .withMessage('Invalid request ID format'),
  
  handleValidationErrors
];

// Visit ID parameter validation
export const validateVisitId = [
  param('visitId')
    .isMongoId()
    .withMessage('Invalid visit ID format'),
  
  handleValidationErrors
];

// User ID parameter validation
export const validateUserId = [
  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID format'),
  
  handleValidationErrors
];
