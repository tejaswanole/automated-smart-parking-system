# Advanced Smart Parking System (ASPS) - Setup Guide

## Overview
The Advanced Smart Parking System is a comprehensive, production-ready parking management solution featuring real-time vehicle counting, interactive maps, GPS-verified check-ins, and a reward system. The system consists of three main components: a React frontend, Node.js backend, and Python computer vision backend.

## System Features

### 🚗 Parking Discovery & Management
- **Interactive Map**: Real-time parking location visualization with Leaflet.js
- **Smart Filtering**: Filter by parking type, payment method, availability, and distance
- **Real-time Updates**: Live parking availability via Socket.IO
- **GPS Integration**: Automatic location detection and distance calculation
- **Computer Vision**: YOLOv8-powered vehicle counting for accurate occupancy

### 📍 Check-in & Verification System
- **GPS-verified Check-ins**: Location-based verification for parking visits
- **Distance Validation**: Ensures accurate check-ins within parking proximity
- **Multi-verification Methods**: GPS and manual staff verification
- **Real-time Tracking**: Live visit monitoring and status updates

### 💰 Wallet & Reward System
- **Coin Balance**: Track earned coins and transaction history
- **Reward Earning**: 
  - Parking check-ins: 10 coins per verified visit
  - Approved requests: 50 coins per approved parking request
  - Daily bonuses and special promotions
- **Transaction History**: Detailed transaction logs with filtering options

### 📝 Request Management System
- **Parking Requests**: Submit new parking location requests with detailed information
- **No-Parking Requests**: Request areas to be marked as no-parking zones
- **Status Tracking**: Monitor request status (pending/approved/denied)
- **Admin Feedback**: View admin notes and approval/denial reasons
- **Image Support**: Upload supporting images for requests

### 🗺️ Interactive Map Features
- **Real-time Visualization**: Live parking location display with color-coded markers
- **Marker System**: 
  - 🟢 Green: Available parking spots
  - 🔵 Blue: Limited availability
  - 🔴 Red: Parking full
- **User Location**: GPS-based current location tracking
- **Detailed Information**: Click markers for comprehensive parking details

## Prerequisites

Before setting up the system, ensure you have the following installed:

- **Node.js 18+** (for backend and frontend)
- **MongoDB 6+** (for data persistence)
- **Python 3.8+** (for computer vision backend)
- **Git** (for version control)

## Setup Instructions

### 1. Backend Setup (Node.js + Express)

1. **Navigate to the backend directory:**
   ```bash
   cd api/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   # Or create manually if .env.example doesn't exist
   ```

4. **Configure environment variables in `.env`:**
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/asps_db
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   FRONTEND_URL=http://localhost:3000
   CV_MODEL_URL=http://localhost:5001
   ```

5. **Start the backend server:**
   ```bash
   npm run dev
   ```

### 2. Frontend Setup (React + TypeScript)

1. **Navigate to the client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   echo "VITE_API_BASE_URL=http://localhost:5000/api" > .env
   ```

4. **Start the frontend development server:**
   ```bash
   npm run dev
   ```

### 3. Computer Vision Backend Setup (Python + FastAPI)

1. **Navigate to the CV directory:**
   ```bash
   cd api/cv
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   # Or use the automated installer for Python 3.13+:
   python install_dependencies.py
   ```

4. **Create environment file:**
   ```bash
   cp .sample.env .env
   # Or create manually
   ```

5. **Configure environment variables in `.env`:**
   ```env
   NODE_BACKEND_URL=http://localhost:5000
   CV_MODEL_ID=cv_model_001
   YOLO_MODEL_PATH=yolov8n.pt
   YOLO_CONFIDENCE=0.4
   YOLO_IMAGE_SIZE=640
   MAX_DISAPPEARED=30
   MAX_DISTANCE=50
   PROCESS_INTERVAL=1.0
   FRAME_WIDTH=640
   FRAME_HEIGHT=360
   HOST=0.0.0.0
   PORT=5001
   LOG_LEVEL=INFO
   ```

6. **Start the CV backend:**
   ```bash
   python cv-model.py
   ```

## System Usage

### For Regular Users

1. **Account Setup**
   - Visit the application at `http://localhost:3000`
   - Register with name, email, phone, and password
   - Login with your credentials to access the dashboard

2. **Find Parking**
   - Use the interactive map on the home page
   - View real-time parking availability with color-coded markers
   - Filter by parking type, payment method, and distance
   - Click markers for detailed parking information

3. **Check-in & Earn Coins**
   - Navigate to a parking location
   - Click "Check In & Earn Coins" button
   - Ensure location access is enabled in your browser
   - Earn 10 coins for verified GPS check-ins

4. **Submit Parking Requests**
   - Navigate to the Requests page
   - Submit new parking location requests with detailed information
   - Upload supporting images if available
   - Track request status and admin feedback
   - Earn 50 coins for approved requests

5. **Wallet Management**
   - View your coin balance in the navigation bar
   - Check detailed transaction history
   - Filter transactions by type and date
   - Monitor your earning progress

### For Parking Owners

1. **Request Management**
   - Submit requests to add new parking locations
   - Provide comprehensive parking details including capacity and rates
   - Upload images and supporting documentation

2. **Parking Management**
   - Update vehicle counts manually when needed
   - Monitor parking occupancy in real-time
   - View analytics and usage statistics

3. **Staff Management**
   - Assign staff members to manage parking locations
   - Delegate verification responsibilities

### For Staff Members

1. **Vehicle Count Updates**
   - Manually update vehicle counts when computer vision is unavailable
   - Correct any discrepancies in automated counting

2. **Visit Verification**
   - Verify user check-ins for accurate reward distribution
   - Add notes and comments for verification records

### For System Administrators

1. **Request Approval**
   - Review submitted parking location requests
   - Approve or deny requests with detailed feedback
   - Award coins for approved requests

2. **User Management**
   - Oversee user accounts and roles
   - Manage user permissions and access levels
   - Monitor system usage and performance

3. **System Analytics**
   - View comprehensive system statistics
   - Monitor parking usage patterns
   - Track user engagement and rewards distribution

## Technical Architecture

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

### Key System Components

#### Real-time Communication
- **Socket.IO Integration**: Live updates for parking availability
- **WebSocket Connections**: Bidirectional communication between all components
- **Event-driven Architecture**: Efficient real-time data synchronization

#### Authentication & Security
- **JWT-based Authentication**: Secure token-based authentication
- **Role-based Access Control**: Granular permissions for different user types
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Comprehensive validation using express-validator

#### Data Management
- **React Query Caching**: Efficient data fetching and caching
- **Optimistic Updates**: Immediate UI updates for better user experience
- **Error Handling**: Graceful error management and user feedback
- **Loading States**: Proper loading indicators throughout the application

#### Map Integration
- **Interactive Parking Map**: Real-time parking location visualization
- **GPS Location Tracking**: Automatic user location detection
- **Custom Markers**: Color-coded markers for different parking states
- **Distance Calculation**: Real-time distance from user to parking spots

## API Endpoints

### Authentication
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

## Development Notes

### Frontend Improvements Made
1. **Consistent Layout System**
   - Created reusable Layout component
   - Added responsive navigation
   - Implemented proper routing

2. **Enhanced User Experience**
   - Added loading states and error handling
   - Implemented toast notifications
   - Created responsive design

3. **Map Integration**
   - Interactive parking map with Leaflet
   - Real-time location tracking
   - Custom markers and popups

4. **Data Management**
   - React Query for efficient data fetching
   - Optimistic updates for better UX
   - Proper error boundaries

5. **Authentication Flow**
   - Protected routes
   - Automatic redirects
   - Session management

### Backend Features
- Comprehensive API endpoints
- JWT authentication
- Real-time updates with Socket.IO
- Input validation and error handling
- MongoDB integration with Mongoose

## Testing the Application

1. **Start both servers** (backend and frontend)
2. **Register a new account**
3. **Explore the parking map**
4. **Submit a parking request**
5. **Check your wallet balance**
6. **Test the check-in functionality**

## Troubleshooting

### Common Issues
1. **CORS errors**: Ensure backend CORS is configured for frontend URL
2. **Map not loading**: Check if Leaflet CSS is properly imported
3. **Authentication issues**: Verify JWT token is being sent correctly
4. **Location access**: Ensure browser location permissions are granted

### Development Tips
- Use browser dev tools to monitor API calls
- Check network tab for request/response details
- Enable location access for full functionality
- Test on different screen sizes for responsiveness

## Future Enhancements
- Mobile app development
- Payment integration
- Advanced analytics
- Push notifications
- Social features