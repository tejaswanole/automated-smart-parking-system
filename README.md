# 🚗 Advanced Smart Parking System (ASPS)

A comprehensive, production-ready parking management system with real-time vehicle counting, interactive maps, GPS-verified check-ins, and a reward system. Built with modern technologies including React, Node.js, MongoDB, and YOLOv8 computer vision.

## 🌟 Key Features

### 🗺️ Interactive Map & Location Services
- **Real-time Parking Visualization**: OpenStreetMap with Leaflet.js integration
- **GPS Location Tracking**: Automatic user location detection and validation
- **Smart Filtering**: Filter by parking type, payment method, availability, and distance
- **Interactive Markers**: Color-coded markers with detailed parking information
- **Distance Calculation**: Real-time distance from user to parking spots
- **Navigation Integration**: Direct integration with mapping services

### 🎯 Core Functionality
- **Real-time Vehicle Counting**: YOLOv8-powered computer vision for accurate vehicle detection
- **GPS-verified Check-ins**: Location-based verification for parking visits
- **Reward System**: Earn coins for verified parking visits and approved requests
- **Multi-role Support**: User, Owner, Staff, and Admin roles with appropriate permissions
- **Request Management**: Submit and approve parking location requests
- **Admin Dashboard**: Comprehensive management interface for system oversight

### 🎨 Modern UI/UX
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Real-time Updates**: Live parking availability updates via Socket.IO
- **Intuitive Navigation**: Clean, user-friendly interface
- **Toast Notifications**: Real-time feedback system
- **Loading States**: Proper loading indicators and error handling

## 🏗️ System Architecture

### Frontend (React + TypeScript)
- **React 19** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for responsive styling
- **React Query (TanStack Query)** for efficient data fetching and caching
- **React Router** for client-side navigation
- **Leaflet.js** for interactive map functionality
- **Socket.IO Client** for real-time updates
- **React Hot Toast** for user notifications

### Backend (Node.js + Express)
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM for data persistence
- **JWT Authentication** with bcrypt for secure password hashing
- **Socket.IO** for real-time bidirectional communication
- **Express Validator** for comprehensive input validation
- **Helmet** for security headers
- **CORS** for cross-origin request handling
- **Rate Limiting** for API protection

### Computer Vision Backend (Python + FastAPI)
- **FastAPI** for high-performance API framework
- **YOLOv8** (Ultralytics) for real-time vehicle detection
- **OpenCV** for video processing and image manipulation
- **Socket.IO** for real-time communication with core backend
- **Pydantic** for data validation and serialization
- **Real-time tracking** with advanced centroid tracking algorithms

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** (for backend and frontend)
- **MongoDB 6+** (for data persistence)
- **Python 3.8+** (for computer vision backend)
- **Git** (for version control)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd automated-smart-parking-system-main
```

### 2. Backend Setup
```bash
cd api/backend
npm install
```

Create a `.env` file in `api/backend/`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/asps_db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
FRONTEND_URL=http://localhost:3000
CV_MODEL_URL=http://localhost:5001
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
```

Create a `.env` file in `client/`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

### 4. Computer Vision Setup (Optional)
```bash
cd api/cv
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
# Or use the automated installer for Python 3.13+:
python install_dependencies.py
```

Create a `.env` file in `api/cv/`:
```env
NODE_BACKEND_URL=http://localhost:5000
CV_MODEL_ID=cv_model_001
YOLO_MODEL_PATH=yolov8n.pt
YOLO_CONFIDENCE=0.4
HOST=0.0.0.0
PORT=5001
```

Start the CV backend:
```bash
python cv-model.py
```

## 📱 User Guide

### For Regular Users
1. **Account Setup**: Register with name, email, phone, and password
2. **Find Parking**: Use the interactive map to locate nearby parking spots
3. **Check-in & Earn**: Visit parking locations and check-in to earn 10 coins
4. **Submit Requests**: Request new parking locations to earn 50 coins when approved
5. **Wallet Management**: Track coin balance and transaction history

### For Parking Owners
1. **Request Management**: Submit requests to add new parking locations
2. **Parking Management**: Update vehicle counts and parking information
3. **Analytics**: Monitor parking usage, occupancy rates, and earnings
4. **Staff Management**: Assign staff members to manage parking locations

### For Staff Members
1. **Vehicle Count Updates**: Manually update vehicle counts when needed
2. **Visit Verification**: Verify user check-ins for accurate reward distribution
3. **Parking Monitoring**: Monitor assigned parking locations in real-time

### For System Administrators
1. **Request Approval**: Review and approve/deny parking location requests
2. **User Management**: Oversee user accounts, roles, and permissions
3. **System Analytics**: View comprehensive system statistics and performance metrics
4. **Content Management**: Manage parking locations and system configuration

## 🗺️ Interactive Map Features

### Real-time Parking Visualization
- **GPS Location Tracking**: Automatic user location detection and display
- **Color-coded Markers**: Visual indicators for parking availability
  - 🟢 **Green**: Available parking spots
  - 🔵 **Blue**: Limited availability
  - 🔴 **Red**: Parking full
- **Smart Information Popups**: Click markers for detailed parking information
- **Distance Calculation**: Real-time distance from user to parking locations
- **Filtering Options**: Filter by parking type, payment method, and availability

### Map Controls & Navigation
- **Auto-refresh**: Real-time parking data updates
- **Location Centering**: Center map on current user position
- **Filter Panel**: Toggle advanced filtering options
- **Legend Display**: Clear understanding of marker meanings
- **Navigation Integration**: Direct links to external mapping services

## 🔧 API Documentation

### Authentication Endpoints
- `POST /api/users/register` - User registration with validation
- `POST /api/users/login` - User authentication
- `POST /api/users/logout` - User logout
- `GET /api/users/profile` - Get authenticated user profile
- `PUT /api/users/profile` - Update user profile

### Parking Management
- `GET /api/parkings` - Get all parkings with filtering and pagination
- `GET /api/parkings/nearby` - Get nearby parkings based on coordinates
- `GET /api/parkings/available` - Get available parking spots
- `POST /api/parkings` - Create new parking (Owner/Admin only)
- `PUT /api/parkings/:parkingId/vehicle-count` - Update vehicle count
- `GET /api/parkings/:parkingId/statistics` - Get parking statistics

### Visit & Check-in System
- `POST /api/visits` - Record parking visit with GPS verification
- `GET /api/visits/user/me` - Get user visit history
- `GET /api/visits/statistics` - Get visit statistics
- `PUT /api/visits/:visitId/verify` - Verify visit (Staff/Owner/Admin)

### Request Management
- `POST /api/requests` - Create parking/no-parking requests
- `GET /api/requests/user/me` - Get user requests
- `PUT /api/requests/:requestId/approve` - Approve request (Admin)
- `PUT /api/requests/:requestId/deny` - Deny request (Admin)
- `GET /api/requests/statistics` - Get request statistics (Admin)

### Wallet & Rewards
- `GET /api/users/wallet` - Get user wallet information
- `GET /api/users/wallet/transactions` - Get transaction history

## 🎨 Frontend Components

### Core UI Components
- **Layout System**: Responsive layout with navigation and sidebar
- **Authentication Forms**: Login and registration with validation
- **Parking Cards**: Information display with real-time updates
- **Interactive Maps**: Leaflet-based parking visualization
- **Admin Dashboard**: Comprehensive management interface
- **Request Management**: Submit and track parking requests
- **Wallet Interface**: Coin balance and transaction history

### Real-time Features
- **Socket.IO Integration**: Live updates for parking availability
- **Toast Notifications**: User feedback and status updates
- **Loading States**: Proper loading indicators throughout the app
- **Error Handling**: Graceful error management and user feedback

## 🔒 Security & Performance

### Security Features
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Comprehensive validation using express-validator
- **CORS Protection**: Configurable cross-origin request handling
- **Rate Limiting**: API request throttling to prevent abuse
- **Helmet**: Security headers for protection against common vulnerabilities
- **Role-based Access Control**: Granular permissions for different user types

### Performance Optimizations
- **React Query Caching**: Efficient data fetching and caching
- **Real-time Updates**: Socket.IO for instant data synchronization
- **Image Optimization**: Optimized image handling and compression
- **Database Indexing**: Optimized MongoDB queries with proper indexing
- **Code Splitting**: Lazy loading for improved initial load times

## 📊 Database Schema

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

## 🚀 Deployment Guide

### Frontend Deployment
```bash
cd client
npm run build
# Deploy the dist/ folder to your hosting service (Vercel, Netlify, etc.)
```

### Backend Deployment
```bash
cd api/backend
npm start
# Use PM2 for production process management
pm2 start src/index.js --name "asps-backend"
```

### Computer Vision Backend Deployment
```bash
cd api/cv
# Use gunicorn or uvicorn for production
uvicorn cv-model:app --host 0.0.0.0 --port 5001 --workers 4
```

### Production Environment Variables
**Backend (.env):**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-production-db-url
JWT_SECRET=your-strong-production-secret
FRONTEND_URL=https://your-frontend-domain.com
CV_MODEL_URL=https://your-cv-backend-domain.com
```

**Frontend (.env):**
```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

**CV Backend (.env):**
```env
NODE_BACKEND_URL=https://your-backend-domain.com
CV_MODEL_ID=cv_model_production
YOLO_CONFIDENCE=0.4
HOST=0.0.0.0
PORT=5001
```

## 🤝 Contributing

We welcome contributions to the Advanced Smart Parking System! Please follow these steps:

1. **Fork the repository** and create a feature branch
2. **Make your changes** with proper code formatting and documentation
3. **Add tests** for new functionality if applicable
4. **Update documentation** to reflect any changes
5. **Submit a pull request** with a clear description of changes

### Development Guidelines
- Follow the existing code style and conventions
- Ensure all tests pass before submitting
- Update API documentation for any endpoint changes
- Add proper error handling and validation

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🆘 Support & Documentation

### Getting Help
- **Issues**: Create an issue in the repository for bugs or feature requests
- **API Documentation**: Check `api/backend/API_DOCUMENTATION.md` for detailed API reference
- **Setup Guide**: Refer to `SETUP.md` for detailed installation instructions
- **Code Comments**: Review inline code comments for implementation details

### Additional Resources
- **Backend Documentation**: `api/backend/README.md`
- **CV Model Documentation**: `api/cv/README.md`
- **Frontend Documentation**: `client/README.md`

## 🔮 Future Enhancements

### Planned Features
- **Mobile Application**: React Native version for iOS and Android
- **Payment Integration**: Stripe/PayPal integration for parking payments
- **Advanced Analytics**: Machine learning insights and predictive analytics
- **IoT Integration**: Smart parking sensors and real-time monitoring
- **Multi-language Support**: Internationalization for global deployment
- **Real-time Chat**: Customer support system integration
- **Blockchain Integration**: Decentralized reward system
- **AI-powered Recommendations**: Smart parking suggestions based on user behavior

### Technical Improvements
- **Microservices Architecture**: Break down into smaller, scalable services
- **GraphQL API**: More efficient data fetching
- **Progressive Web App**: Offline functionality and app-like experience
- **Advanced Computer Vision**: Multi-camera support and better accuracy
- **Edge Computing**: Local processing for faster response times

---

**Built with ❤️ for smart urban mobility and sustainable transportation**

*Advanced Smart Parking System - Making parking smarter, one spot at a time.*
