// Application Constants
export const APP_NAME = "Advanced Smart Parking System";
export const APP_VERSION = "1.0.0";

// JWT Configuration
export const JWT_EXPIRES_IN = "7d";
export const JWT_REFRESH_EXPIRES_IN = "30d";

// User Roles
export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
  OWNER: "owner",
  STAFF: "staff"
};

// Parking Types
export const PARKING_TYPES = {
  OPEN_SKY: "opensky",
  CLOSED_SKY: "closedsky"
};

// Payment Types
export const PAYMENT_TYPES = {
  PAID: "paid",
  FREE: "free"
};

// Ownership Types
export const OWNERSHIP_TYPES = {
  PRIVATE: "private",
  PUBLIC: "public"
};

// Vehicle Types
export const VEHICLE_TYPES = {
  CAR: "car",
  BUS_TRUCK: "bus_truck",
  BIKE: "bike"
};

// Request Types
export const REQUEST_TYPES = {
  PARKING: "parking",
  NO_PARKING: "no_parking"
};

// Request Status
export const REQUEST_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  DENIED: "denied"
};

// Coin Rewards
export const COIN_REWARDS = {
  PARKING_REQUEST_APPROVED: 50,
  NO_PARKING_REQUEST_APPROVED: 30,
  PARKING_VISIT: 10
};

// Staff Limits
export const MAX_STAFF_PER_PARKING = 5;

// File Upload Limits
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];

// Rate Limiting
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_MAX_REQUESTS = 100;

// Socket Events
export const SOCKET_EVENTS = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  PARKING_COUNT_UPDATE: "parking_count_update",
  STAFF_COUNT_UPDATE: "staff_count_update"
};

// Error Messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "Access forbidden",
  NOT_FOUND: "Resource not found",
  VALIDATION_ERROR: "Validation error",
  INTERNAL_SERVER_ERROR: "Internal server error",
  INVALID_CREDENTIALS: "Invalid credentials",
  USER_NOT_FOUND: "User not found",
  PARKING_NOT_FOUND: "Parking not found",
  INSUFFICIENT_COINS: "Insufficient coins",
  STAFF_LIMIT_EXCEEDED: "Staff limit exceeded"
};

// Success Messages
export const SUCCESS_MESSAGES = {
  USER_CREATED: "User created successfully",
  USER_UPDATED: "User updated successfully",
  USER_DELETED: "User deleted successfully",
  LOGIN_SUCCESS: "Login successful",
  LOGOUT_SUCCESS: "Logout successful",
  PARKING_CREATED: "Parking created successfully",
  PARKING_UPDATED: "Parking updated successfully",
  REQUEST_CREATED: "Request created successfully",
  REQUEST_APPROVED: "Request approved successfully",
  REQUEST_DENIED: "Request denied successfully",
  STAFF_CREATED: "Staff created successfully",
  STAFF_DELETED: "Staff deleted successfully",
  COINS_ADDED: "Coins added successfully"
};
