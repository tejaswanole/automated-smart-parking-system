# Advanced Smart Parking System - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format
All API responses follow this standard format:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

## Error Response Format
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

---

## 🔐 Authentication Endpoints

### Register User
**POST** `/users/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "role": "user",
      "wallet": {
        "coins": 0,
        "transactions": []
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login User
**POST** `/users/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "role": "user",
      "wallet": {
        "coins": 50,
        "transactions": [...]
      },
      "ownedParkings": [],
      "staffParking": null,
      "location": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Logout User
**POST** `/users/logout`

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 👤 User Management Endpoints

### Get User Profile
**GET** `/users/profile`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "role": "user",
      "wallet": {
        "coins": 50,
        "transactions": [...]
      },
      "ownedParkings": [...],
      "staffParking": {...},
      "location": {
        "type": "Point",
        "coordinates": [73.8567, 18.5204]
      },
      "isActive": true,
      "lastLogin": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### Update User Profile
**PUT** `/users/profile`

**Request Body:**
```json
{
  "name": "John Smith",
  "phone": "9876543210",
  "location": {
    "type": "Point",
    "coordinates": [73.8567, 18.5204]
  }
}
```

### Get User Wallet
**GET** `/users/wallet`

**Response:**
```json
{
  "success": true,
  "data": {
    "wallet": {
      "coins": 150,
      "transactions": [
        {
          "type": "credit",
          "amount": 50,
          "description": "Request approved: New Parking Lot",
          "timestamp": "2024-01-15T10:30:00.000Z"
        }
      ]
    }
  }
}
```

### Get Wallet Transactions
**GET** `/users/wallet/transactions?page=1&limit=20`

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "pages": 1
    }
  }
}
```

---

## 🏢 Parking Management Endpoints

### Get All Parkings
**GET** `/parkings?page=1&limit=20&parkingType=opensky&paymentType=paid`

**Response:**
```json
{
  "success": true,
  "data": {
    "parkings": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
        "parkingId": "a5dcef1c",
        "name": "Central Mall Parking",
        "description": "Multi-level parking facility",
        "location": {
          "type": "Point",
          "coordinates": [73.8567, 18.5204],
          "address": {
            "street": "123 Main Street",
            "city": "Mumbai",
            "state": "Maharashtra",
            "country": "India"
          }
        },
        "parkingType": "closedsky",
        "paymentType": "paid",
        "ownershipType": "private",
        "capacity": {
          "car": 100,
          "bus_truck": 20,
          "bike": 200
        },
        "currentCount": {
          "car": 75,
          "bus_truck": 5,
          "bike": 120
        },
        "hourlyRate": {
          "car": 50,
          "bus_truck": 100,
          "bike": 20
        },
        "isFull": false,
        "availableSpaces": {
          "car": 25,
          "bus_truck": 15,
          "bike": 80
        },
        "occupancyPercentage": 65,
        "owner": {
          "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "1234567890"
        },
        "isActive": true,
        "isApproved": true,
        "lastUpdated": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

### Get Nearby Parkings
**GET** `/parkings/nearby?coordinates=73.8567,18.5204&maxDistance=5000`

**Response:**
```json
{
  "success": true,
  "data": {
    "parkings": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
        "parkingId": "a5dcef1c",
        "name": "Central Mall Parking",
        "location": {
          "type": "Point",
          "coordinates": [73.8567, 18.5204]
        },
        "distance": 2500,
        "currentCount": {...},
        "capacity": {...},
        "isFull": false
      }
    ]
  }
}
```

### Get Available Parkings
**GET** `/parkings/available?coordinates=73.8567,18.5204&maxDistance=5000`

**Response:**
```json
{
  "success": true,
  "data": {
    "parkings": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
        "parkingId": "a5dcef1c",
        "name": "Central Mall Parking",
        "availableSpaces": {
          "car": 25,
          "bus_truck": 15,
          "bike": 80
        },
        "isFull": false
      }
    ]
  }
}
```

### Create Parking (Owner/Admin)
**POST** `/parkings`

**Request Body:**
```json
{
  "name": "New Parking Lot",
  "description": "A new parking facility",
  "location": {
    "type": "Point",
    "coordinates": [73.8567, 18.5204],
    "address": {
      "street": "456 Park Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "country": "India"
    }
  },
  "parkingType": "opensky",
  "paymentType": "free",
  "ownershipType": "private",
  "capacity": {
    "car": 50,
    "bus_truck": 10,
    "bike": 100
  },
  "hourlyRate": {
    "car": 0,
    "bus_truck": 0,
    "bike": 0
  },
  "amenities": ["security", "cctv", "lighting"],
  "operatingHours": {
    "open": "06:00",
    "close": "22:00",
    "is24Hours": false
  }
}
```

### Update Vehicle Count (Staff/Owner/Admin)
**PUT** `/parkings/:parkingId/vehicle-count`

**Request Body:**
```json
{
  "vehicleType": "car",
  "count": 80
}
```

### Increment Vehicle Count
**POST** `/parkings/:parkingId/vehicle-count/increment`

**Request Body:**
```json
{
  "vehicleType": "car",
  "increment": 1
}
```

### Decrement Vehicle Count
**POST** `/parkings/:parkingId/vehicle-count/decrement`

**Request Body:**
```json
{
  "vehicleType": "car",
  "decrement": 1
}
```

### Get Parking Statistics
**GET** `/parkings/:parkingId/statistics?period=month`

**Response:**
```json
{
  "success": true,
  "data": {
    "parking": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
      "name": "Central Mall Parking",
      "parkingId": "a5dcef1c"
    },
    "statistics": {
      "totalVisits": 1500,
      "totalCoinsEarned": 7500,
      "averageDistance": 2500,
      "verifiedVisits": 1200
    },
    "period": "month",
    "dateRange": {
      "start": "2024-01-01T00:00:00.000Z",
      "end": "2024-01-31T23:59:59.999Z"
    }
  }
}
```

---

## 📝 Request Management Endpoints

### Create Request
**POST** `/requests`

**Request Body (Parking Request):**
```json
{
  "requestType": "parking",
  "title": "New Parking Lot Request",
  "description": "Request to add a new parking lot in the city center",
  "location": {
    "type": "Point",
    "coordinates": [73.8567, 18.5204]
  },
  "images": [
    {
      "url": "https://example.com/image1.jpg",
      "caption": "Parking area photo"
    }
  ],
  "parkingDetails": {
    "name": "City Center Parking",
    "capacity": {
      "car": 100,
      "bus_truck": 20,
      "bike": 200
    },
    "parkingType": "opensky",
    "paymentType": "paid",
    "ownershipType": "public",
    "hourlyRate": {
      "car": 50,
      "bus_truck": 100,
      "bike": 20
    },
    "amenities": ["security", "cctv"],
    "operatingHours": {
      "open": "06:00",
      "close": "22:00",
      "is24Hours": false
    }
  }
}
```

**Request Body (No-Parking Request):**
```json
{
  "requestType": "no_parking",
  "title": "No Parking Zone Request",
  "description": "Request to mark an area as no-parking zone",
  "location": {
    "type": "Point",
    "coordinates": [73.8567, 18.5204]
  },
  "images": [
    {
      "url": "https://example.com/image1.jpg",
      "caption": "Area photo"
    }
  ],
  "noParkingDetails": {
    "reason": "construction",
    "duration": {
      "startDate": "2024-02-01T00:00:00.000Z",
      "endDate": "2024-03-01T00:00:00.000Z"
    },
    "affectedArea": "partial"
  }
}
```

### Get User Requests
**GET** `/requests/user/me?page=1&limit=20&status=pending`

**Response:**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b5",
        "requestType": "parking",
        "status": "pending",
        "title": "New Parking Lot Request",
        "description": "Request to add a new parking lot",
        "location": {
          "type": "Point",
          "coordinates": [73.8567, 18.5204]
        },
        "images": [...],
        "parkingDetails": {...},
        "createdAt": "2024-01-15T10:30:00.000Z",
        "ageInDays": 0,
        "isPending": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

### Approve Request (Admin)
**PUT** `/requests/:requestId/approve`

**Request Body:**
```json
{
  "coinsAwarded": 50,
  "adminNotes": "Approved after site inspection"
}
```

### Deny Request (Admin)
**PUT** `/requests/:requestId/deny`

**Request Body:**
```json
{
  "adminNotes": "Denied due to insufficient space"
}
```

---

## 📊 Visit Management Endpoints

### Record Parking Visit
**POST** `/visits`

**Request Body:**
```json
{
  "parkingId": "a5dcef1c",
  "location": {
    "type": "Point",
    "coordinates": [73.8567, 18.5204]
  },
  "distance": 2500
}
```

**Response:**
```json
{
  "success": true,
  "message": "Visit recorded successfully",
  "data": {
    "visit": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b6",
      "parking": {
        "_id": "60f7b3b3b3b3b3b3b3b3b4",
        "name": "Central Mall Parking",
        "parkingId": "a5dcef1c"
      },
      "visitDate": "2024-01-15T10:30:00.000Z",
      "coinsEarned": 10,
      "distance": 2500
    }
  }
}
```

### Get User Visits
**GET** `/visits/user/me?page=1&limit=20`

**Response:**
```json
{
  "success": true,
  "data": {
    "visits": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b6",
        "parking": {
          "_id": "60f7b3b3b3b3b3b3b3b3b4",
          "name": "Central Mall Parking",
          "location": {...},
          "parkingType": "closedsky",
          "paymentType": "paid"
        },
        "visitDate": "2024-01-15T10:30:00.000Z",
        "coinsEarned": 10,
        "distance": 2500,
        "isVerified": false,
        "verificationMethod": "gps",
        "ageInDays": 0,
        "formattedVisitDate": "January 15, 2024 at 10:30 AM"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

### Get Visit Statistics
**GET** `/visits/statistics?period=month&parkingId=a5dcef1c`

**Response:**
```json
{
  "success": true,
  "data": {
    "statistics": {
      "totalVisits": 1500,
      "verifiedVisits": 1200,
      "totalCoinsEarned": 7500,
      "averageDistance": 2500,
      "verificationRate": "80.00"
    },
    "dailyVisits": [
      {
        "_id": "2024-01-15",
        "count": 50,
        "coinsEarned": 250
      }
    ],
    "period": "month",
    "dateRange": {
      "start": "2024-01-01T00:00:00.000Z",
      "end": "2024-01-31T23:59:59.999Z"
    }
  }
}
```

### Verify Visit (Staff/Owner/Admin)
**PUT** `/visits/:visitId/verify`

**Request Body:**
```json
{
  "method": "manual",
  "notes": "Verified by staff member"
}
```

---

## 🔌 Socket.IO Events

### Client Authentication
```javascript
// Authenticate client
socket.emit('authenticate', {
  userId: '60f7b3b3b3b3b3b3b3b3b3b3',
  role: 'user'
});

// Listen for authentication response
socket.on('authenticated', (data) => {
  console.log('Authenticated:', data);
});
```

### Join Parking Room
```javascript
// Join parking room for real-time updates
socket.emit('join_parking_room', 'a5dcef1c');

// Listen for room join confirmation
socket.on('joined_parking_room', (data) => {
  console.log('Joined room:', data);
});
```

### Real-time Parking Updates
```javascript
// Listen for parking count updates
socket.on('parking_count_updated', (data) => {
  console.log('Parking updated:', data);
  // Update UI with new counts
});
```

### CV Model Connection
```javascript
// CV model connects to parking
socket.emit('cv_model_connect', {
  parkingId: 'a5dcef1c',
  modelId: 'cv_model_001'
});

// Send parking count updates to CV model
socket.emit('parking_count_update', {
  parking_id: 'a5dcef1c',
  counts: {
    car: 75,
    bus_truck: 5,
    bike: 120
  },
  capacity: {
    car: 100,
    bus_truck: 20,
    bike: 200
  }
});
```

---

## 🛠️ Admin Endpoints

### Get All Users (Admin)
**GET** `/users?page=1&limit=20&role=user&search=john`

### Update User Role (Admin)
**PUT** `/users/:userId/role`

**Request Body:**
```json
{
  "role": "owner"
}
```

### Get All Requests (Admin)
**GET** `/requests?page=1&limit=20&status=pending&requestType=parking`

### Get Pending Requests (Admin)
**GET** `/requests/pending?page=1&limit=20&requestType=parking`

### Get Request Statistics (Admin)
**GET** `/requests/statistics?period=month`

**Response:**
```json
{
  "success": true,
  "data": {
    "statistics": {
      "totalRequests": 100,
      "pendingRequests": 20,
      "approvedRequests": 70,
      "deniedRequests": 10,
      "parkingRequests": 80,
      "noParkingRequests": 20,
      "totalCoinsAwarded": 3500,
      "approvalRate": "70.00"
    },
    "period": "month",
    "dateRange": {
      "start": "2024-01-01T00:00:00.000Z",
      "end": "2024-01-31T23:59:59.999Z"
    }
  }
}
```

---

## 📋 Query Parameters

### Pagination
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)

### Filtering
- `status` (string): Filter by status (pending, approved, denied)
- `requestType` (string): Filter by request type (parking, no_parking)
- `parkingType` (string): Filter by parking type (opensky, closedsky)
- `paymentType` (string): Filter by payment type (paid, free)
- `ownershipType` (string): Filter by ownership type (private, public)
- `role` (string): Filter by user role (admin, owner, staff, user)
- `search` (string): Search in names, emails, titles, descriptions

### Location-based
- `coordinates` (string): "longitude,latitude" format
- `maxDistance` (number): Maximum distance in meters (default: 10000)

### Time-based
- `period` (string): Time period (day, week, month, year)
- `startDate` (string): Start date (ISO format)
- `endDate` (string): End date (ISO format)

---

## 🔒 Error Codes

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

---

## 📝 Notes

1. **Authentication**: All protected endpoints require a valid JWT token
2. **Pagination**: Use `page` and `limit` parameters for paginated responses
3. **Location**: Coordinates should be in [longitude, latitude] format
4. **File Uploads**: Image URLs should be provided as strings
5. **Real-time Updates**: Use Socket.IO for real-time parking count updates
6. **Rate Limiting**: API is rate-limited to 100 requests per 15 minutes
7. **Validation**: All input data is validated using express-validator
8. **Error Handling**: All errors return consistent JSON response format
