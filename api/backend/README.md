# Advanced Smart Parking System - Core Backend

A production-ready Node.js/Express backend for the Advanced Smart Parking System featuring real-time vehicle counting, comprehensive user management, parking analytics, and seamless integration with computer vision systems.

## 🚀 Current Features

### 🔐 Authentication & Authorization
- **JWT-based Authentication**: Secure token-based authentication with refresh capabilities
- **Role-based Access Control**: Granular permissions for Admin, Owner, Staff, and User roles
- **Secure Password Hashing**: bcrypt implementation for password security
- **Session Management**: Cookie-based session handling with automatic token refresh

### 🏢 Parking Management
- **Real-time Vehicle Counting**: Live updates via Socket.IO integration with CV backend
- **Multi-vehicle Support**: Comprehensive support for Car, Bus/Truck, and Bike parking
- **Capacity Management**: Dynamic parking capacity tracking and availability calculation
- **Location-based Search**: Geospatial queries for nearby parking discovery
- **Approval Workflow**: Complete parking location approval system with admin controls

### 👥 User Management
- **User Registration & Authentication**: Complete user lifecycle management
- **Wallet System**: In-app coin system with transaction tracking
- **Profile Management**: Comprehensive user profile with location tracking
- **Role Management**: Dynamic role assignment and permission management

### 📝 Request Management System
- **Parking Requests**: Submit and manage new parking location requests
- **No-parking Requests**: Request areas to be marked as no-parking zones
- **Admin Approval Workflow**: Complete approval/denial system with feedback
- **Coin Rewards**: Automatic coin distribution for approved requests

### 📊 Analytics & Statistics
- **Visit Tracking**: Comprehensive parking visit analytics
- **Occupancy Statistics**: Real-time parking occupancy monitoring
- **User Activity Metrics**: Detailed user engagement tracking
- **Revenue Analytics**: Parking usage and earnings analysis

### 🔌 Real-time Communication
- **Socket.IO Integration**: Bidirectional real-time communication
- **CV Model Integration**: Seamless communication with computer vision backend
- **Live Updates**: Real-time parking count and availability updates
- **Event-driven Architecture**: Efficient real-time data synchronization

## 🛠️ Tech Stack

### Core Technologies
- **Runtime**: Node.js 18+
- **Framework**: Express.js 5.x
- **Database**: MongoDB 6+ with Mongoose ODM
- **Authentication**: JWT + bcrypt for secure password hashing
- **Real-time Communication**: Socket.IO 4.x for bidirectional communication

### Security & Validation
- **Input Validation**: express-validator for comprehensive data validation
- **Security Headers**: Helmet for security middleware
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: API request throttling and abuse prevention

### Development & Monitoring
- **Logging**: Morgan for HTTP request logging
- **Environment Management**: dotenv for configuration management
- **File Uploads**: Multer for handling file uploads
- **Cookie Management**: cookie-parser for session handling

## 📋 Prerequisites

- **Node.js 18+** (recommended: latest LTS version)
- **MongoDB 6+** (for data persistence)
- **npm** (comes with Node.js)
- **Git** (for version control)

## 🚀 Installation & Setup

### 1. Clone and Navigate
```bash
git clone <repository-url>
cd automated-smart-parking-system-main/api/backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
# Create environment file
cp .env.example .env
# Or create manually if .env.example doesn't exist
```

**Configure `.env` file:**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/asps_db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
FRONTEND_URL=http://localhost:3000
CV_MODEL_URL=http://localhost:5001
```

### 4. Database Setup
```bash
# Start MongoDB service (if not already running)
mongod

# Or using MongoDB Compass/GUI
# Connect to: mongodb://localhost:27017
```

### 5. Start the Application
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### 6. Verify Installation
- Backend should be running on `http://localhost:5000`
- API documentation available at `http://localhost:5000/api`
- Socket.IO connection available for real-time features

## 🔧 API Endpoints

### Authentication & User Management
- `POST /api/users/register` - User registration with validation
- `POST /api/users/login` - User authentication
- `POST /api/users/logout` - User logout
- `GET /api/users/profile` - Get authenticated user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/wallet` - Get user wallet information
- `GET /api/users/wallet/transactions` - Get transaction history

### Parking Management
- `GET /api/parkings` - Get all parkings with filtering and pagination
- `GET /api/parkings/nearby` - Get nearby parkings based on coordinates
- `GET /api/parkings/available` - Get available parking spots
- `POST /api/parkings` - Create new parking (Owner/Admin only)
- `PUT /api/parkings/:parkingId` - Update parking information
- `PUT /api/parkings/:parkingId/vehicle-count` - Update vehicle count
- `GET /api/parkings/:parkingId/statistics` - Get parking statistics

### Request Management
- `POST /api/requests` - Create parking/no-parking requests
- `GET /api/requests/user/me` - Get user requests
- `PUT /api/requests/:requestId/approve` - Approve request (Admin)
- `PUT /api/requests/:requestId/deny` - Deny request (Admin)
- `GET /api/requests/statistics` - Get request statistics (Admin)

### Visit & Check-in System
- `POST /api/visits` - Record parking visit with GPS verification
- `GET /api/visits/user/me` - Get user visit history
- `GET /api/visits/statistics` - Get visit statistics
- `PUT /api/visits/:visitId/verify` - Verify visit (Staff/Owner/Admin)

### Admin Endpoints
- `GET /api/users` - Get all users (Admin)
- `PUT /api/users/:userId/role` - Update user role (Admin)
- `GET /api/requests` - Get all requests (Admin)
- `GET /api/requests/pending` - Get pending requests (Admin)

## 🔌 Socket.IO Events

### Client Authentication Events
- `authenticate` - Authenticate client with user credentials
- `authenticated` - Authentication confirmation response

### Parking Room Management
- `join_parking_room` - Join parking room for real-time updates
- `leave_parking_room` - Leave parking room
- `joined_parking_room` - Room join confirmation

### Real-time Updates
- `parking_count_updated` - Real-time parking count updates
- `parking_availability_changed` - Parking availability status changes
- `new_visit_recorded` - New parking visit notifications

### Computer Vision Integration
- `cv_model_connect` - CV model connection establishment
- `parking_count_update` - Receive count updates from CV model
- `staff_count_update` - Staff manual count updates
- `cv_model_disconnect` - CV model disconnection handling

## 📊 Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  role: String, // user, owner, staff, admin
  wallet: {
    coins: Number,
    transactions: [{
      type: String, // credit, debit
      amount: Number,
      description: String,
      timestamp: Date
    }]
  },
  location: {
    type: Point,
    coordinates: [Number, Number] // [longitude, latitude]
  },
  ownedParkings: [ObjectId],
  staffParking: ObjectId,
  isActive: Boolean,
  lastLogin: Date
}
```

### Parking Model
```javascript
{
  parkingId: String (unique),
  name: String,
  description: String,
  location: {
    type: Point,
    coordinates: [Number, Number],
    address: {
      street: String,
      city: String,
      state: String,
      country: String
    }
  },
  parkingType: String, // opensky, closedsky
  paymentType: String, // paid, free
  ownershipType: String, // private, public
  capacity: {
    car: Number,
    bus_truck: Number,
    bike: Number
  },
  currentCount: {
    car: Number,
    bus_truck: Number,
    bike: Number
  },
  hourlyRate: {
    car: Number,
    bus_truck: Number,
    bike: Number
  },
  isFull: Boolean,
  isActive: Boolean,
  isApproved: Boolean,
  owner: ObjectId,
  staff: [ObjectId],
  amenities: [String],
  operatingHours: {
    open: String,
    close: String,
    is24Hours: Boolean
  }
}
```

### Request Model
```javascript
{
  requestType: String, // parking, no_parking
  status: String, // pending, approved, denied
  title: String,
  description: String,
  location: {
    type: Point,
    coordinates: [Number, Number]
  },
  images: [{
    url: String,
    caption: String
  }],
  parkingDetails: Object, // For parking requests
  noParkingDetails: Object, // For no-parking requests
  user: ObjectId,
  adminNotes: String,
  coinsAwarded: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Visit Model
```javascript
{
  user: ObjectId,
  parking: ObjectId,
  visitDate: Date,
  location: {
    type: Point,
    coordinates: [Number, Number]
  },
  distance: Number,
  coinsEarned: Number,
  isVerified: Boolean,
  verificationMethod: String, // gps, manual
  verifiedBy: ObjectId,
  notes: String
}
```

## ⚙️ Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | Yes |
| `PORT` | Server port | `5000` | Yes |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/asps_db` | Yes |
| `JWT_SECRET` | JWT secret key for token signing | - | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` | Yes |
| `CV_MODEL_URL` | CV model backend URL | `http://localhost:5001` | No |

## 🔒 Security Features

### Authentication & Authorization
- **JWT Authentication**: Secure token-based authentication with refresh capabilities
- **Password Hashing**: bcrypt encryption for secure password storage
- **Role-based Access Control**: Granular permissions for different user types

### API Security
- **Helmet**: Security headers for protection against common vulnerabilities
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: API request throttling to prevent abuse
- **Input Validation**: Comprehensive request data validation using express-validator

### Data Protection
- **Environment Variables**: Sensitive configuration stored in environment variables
- **Error Handling**: Secure error responses without sensitive information exposure
- **Request Sanitization**: Input sanitization to prevent injection attacks

## 🛠️ Error Handling & Logging

### Error Handling
- **Centralized Error Handling**: Middleware-based error handling system
- **Custom Error Classes**: Structured error responses with appropriate HTTP status codes
- **Validation Errors**: Detailed validation error responses for better debugging
- **Graceful Error Recovery**: Proper error recovery and fallback mechanisms

### Logging System
- **Request Logging**: HTTP request logging with Morgan middleware
- **Error Logging**: Comprehensive error logging for debugging
- **Database Logging**: Database connection and query logging
- **Socket.IO Logging**: Real-time event logging for monitoring

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🚀 Deployment

### Production Deployment
```bash
# Set production environment
NODE_ENV=production
npm start

# Or use PM2 for process management
pm2 start src/index.js --name "asps-backend"
```

### Docker Deployment
```bash
# Build Docker image
docker build -t asps-backend .

# Run container
docker run -p 5000:5000 asps-backend
```

### Production Environment Variables
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-production-db-url
JWT_SECRET=your-strong-production-secret
FRONTEND_URL=https://your-frontend-domain.com
CV_MODEL_URL=https://your-cv-backend-domain.com
```

## 📚 API Documentation

### Request/Response Format

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

### Authentication

Include JWT token in request headers:
```
Authorization: Bearer <your-jwt-token>
```

### Pagination

Use query parameters for paginated endpoints:
```
?page=1&limit=20
```

### Filtering

Common filter parameters:
- `status`: Filter by status (pending, approved, denied)
- `requestType`: Filter by request type (parking, no_parking)
- `parkingType`: Filter by parking type (opensky, closedsky)
- `paymentType`: Filter by payment type (paid, free)
- `role`: Filter by user role (admin, owner, staff, user)

### Location-based Queries

For location-based endpoints:
```
?coordinates=73.8567,18.5204&maxDistance=5000
```

## 🤝 Contributing

We welcome contributions to the Advanced Smart Parking System backend! Please follow these guidelines:

1. **Fork the repository** and create a feature branch
2. **Follow coding standards** and existing code style
3. **Add tests** for new functionality
4. **Update documentation** for any API changes
5. **Submit a pull request** with a clear description

### Development Guidelines
- Use meaningful commit messages
- Ensure all tests pass before submitting
- Update API documentation for endpoint changes
- Add proper error handling and validation

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🆘 Support

For support and questions:
- **Issues**: Create an issue in the repository
- **API Documentation**: Check `API_DOCUMENTATION.md` for detailed API reference
- **Code Comments**: Review inline code comments for implementation details
- **Development Team**: Contact the development team for technical support

---

**Advanced Smart Parking System - Core Backend**  
*Making parking management smarter and more efficient.*
