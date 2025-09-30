# Advanced Smart Parking System - Computer Vision Backend

A production-ready computer vision backend for real-time vehicle counting in parking lots using YOLOv8 and advanced tracking algorithms. This system provides accurate vehicle detection, counting, and real-time updates to the core parking management system.

## 🚀 Current Features

### 🎯 Real-time Vehicle Detection
- **YOLOv8 Integration**: State-of-the-art object detection for accurate vehicle identification
- **Multi-vehicle Support**: Detection of cars, buses/trucks, and bikes with high precision
- **Real-time Processing**: Live video stream processing with configurable update intervals
- **Confidence Thresholding**: Adjustable detection confidence for optimal accuracy

### 🔄 Advanced Tracking System
- **Centroid Tracking**: Improved object tracking with better persistence
- **Multi-object Tracking**: Simultaneous tracking of multiple vehicles
- **Disappearance Handling**: Smart handling of temporarily occluded vehicles
- **Distance-based Association**: Accurate vehicle counting with distance validation

### 🔌 Real-time Integration
- **Socket.IO Communication**: Seamless real-time communication with core backend
- **Automatic Reconnection**: Robust connection handling with retry logic
- **Event-driven Updates**: Real-time parking count updates to all connected clients
- **Multi-parking Support**: Handle multiple parking lots simultaneously

### 🛠️ Management & Control
- **RESTful API**: Complete management interface for system control
- **Manual Adjustments**: Staff can manually correct counts when needed
- **WebSocket API**: Real-time updates for frontend applications
- **Health Monitoring**: System health checks and status monitoring

## 🛠️ Tech Stack

### Core Technologies
- **Framework**: FastAPI (Python) - High-performance async web framework
- **Computer Vision**: YOLOv8 (Ultralytics) - State-of-the-art object detection
- **Real-time Communication**: Socket.IO - Bidirectional real-time communication
- **Video Processing**: OpenCV - Computer vision and image processing
- **Data Validation**: Pydantic - Data validation and serialization

### Development & Monitoring
- **Logging**: Python logging - Comprehensive logging system
- **Environment Management**: python-dotenv - Configuration management
- **Async Support**: uvicorn - ASGI server for FastAPI
- **File Handling**: aiofiles - Async file operations

## 📋 Prerequisites

- **Python 3.8+** (Python 3.13+ may have compatibility issues)
- **CUDA-compatible GPU** (optional, for faster inference)
- **Camera or video stream access** (RTSP, webcam, or video file)
- **Virtual environment** (recommended for isolation)

## 🚀 Installation & Setup

### 1. Navigate to CV Directory
```bash
cd api/cv
```

### 2. Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

#### Method 1: Standard Installation (Recommended)
```bash
pip install -r requirements.txt
```

#### Method 2: Automated Installation (For Python 3.13+)
If you encounter installation issues, use the automated installer:
```bash
python install_dependencies.py
```

This script will:
- Check your Python version
- Install build tools first
- Handle compatibility issues
- Provide alternative installation methods
- Verify the installation

#### Method 3: Manual Installation (Fallback)
```bash
# Install build tools first
pip install --upgrade pip setuptools wheel

# Install core dependencies
pip install fastapi uvicorn[standard] pydantic python-socketio python-multipart

# Install CV dependencies
pip install opencv-python-headless ultralytics numpy

# Install utilities
pip install python-dotenv requests aiofiles

# Install dev dependencies (optional)
pip install pytest pytest-asyncio
```

### 4. Download YOLO Model
```bash
# The model will be downloaded automatically when the service starts
# Or manually download it:
python -c "from ultralytics import YOLO; YOLO('yolov8n.pt')"
```

### 5. Environment Configuration
```bash
cp .sample.env .env
# Edit .env with your configuration
```

## ⚙️ Environment Configuration

Create a `.env` file based on `.sample.env`:

```env
# Core Backend Connection
NODE_BACKEND_URL=http://localhost:5000
CV_MODEL_ID=cv_model_001

# YOLO Model Configuration
YOLO_MODEL_PATH=yolov8n.pt
YOLO_CONFIDENCE=0.4
YOLO_IMAGE_SIZE=640

# Tracking Configuration
MAX_DISAPPEARED=30
MAX_DISTANCE=50

# Processing Configuration
PROCESS_INTERVAL=1.0
FRAME_WIDTH=640
FRAME_HEIGHT=360

# Server Configuration
HOST=0.0.0.0
PORT=5001

# Logging
LOG_LEVEL=INFO
```

## 🔧 Troubleshooting Installation Issues

### Python 3.13+ Compatibility Issues
If you're using Python 3.13+ and encounter build errors:

1. **Use the automated installer**:
   ```bash
   python install_dependencies.py
   ```

2. **Try alternative requirements**:
   ```bash
   pip install -r requirements_alt.txt
   ```

3. **Use conda instead of pip**:
   ```bash
   conda install -c conda-forge opencv numpy
   pip install fastapi uvicorn ultralytics
   ```

### Common Installation Issues

1. **setuptools.build_meta error**:
   ```bash
   pip install --upgrade setuptools wheel
   pip install -r requirements.txt
   ```

2. **OpenCV installation fails**:
   ```bash
   pip install opencv-python-headless
   ```

3. **NumPy compilation issues**:
   ```bash
   pip install numpy --only-binary=all
   ```

4. **Permission errors**:
   ```bash
   pip install --user -r requirements.txt
   ```

## 🚀 Usage

### Starting the Service

```bash
# Development mode
python cv-model.py

# Or using uvicorn directly
uvicorn cv-model:app --host 0.0.0.0 --port 5001 --reload
```

### Service Verification
- CV backend should be running on `http://localhost:5001`
- Health check available at `http://localhost:5001/health`
- Socket.IO connection established with core backend

## 🔧 API Endpoints

### Health & Status
- `GET /health` - Service health check
- `GET /config` - Get current configuration
- `GET /list` - List active parking processors

### Parking Management
- `POST /init` - Initialize parking processor
- `GET /status/{parking_id}` - Get parking status
- `PATCH /adjust/{parking_id}` - Manual count adjustment
- `POST /stop/{parking_id}` - Stop parking processor

### Example API Usage

#### Initialize Parking Processor
```bash
POST /init
Content-Type: application/json

{
  "parking_id": "parking_001",
  "capacities": {
    "car": 50,
    "bus_truck": 10,
    "bike": 100
  },
  "camera_source": "rtsp://camera_url",
  "model_id": "cv_model_001"
}
```

#### Manual Count Adjustment
```bash
PATCH /adjust/{parking_id}
Content-Type: application/json

{
  "adjustments": {
    "car": 25,
    "bus_truck": 3,
    "bike": 45
  }
}
```

## 🔌 Real-time Integration

### WebSocket Connection
Connect to real-time updates:
```javascript
const ws = new WebSocket('ws://localhost:5001/ws/parking_001');

ws.onmessage = function(event) {
  const data = JSON.parse(event.data);
  console.log('Parking status:', data);
};
```

### Socket.IO Integration with Core Backend

The CV model automatically connects to the core Node.js backend and sends real-time updates:

#### Outgoing Events (CV → Core Backend)
- `cv_model_connect`: Register CV model with core backend
- `parking_count_update`: Send vehicle count updates

#### Incoming Events (Core Backend → CV)
- `manual_count_update`: Receive manual count adjustments from staff

#### Data Format
```json
{
  "parking_id": "parking_001",
  "counts": {
    "car": 25,
    "bus_truck": 3,
    "bike": 45
  },
  "capacity": {
    "car": 50,
    "bus_truck": 10,
    "bike": 100
  },
  "available": {
    "car": 25,
    "bus_truck": 7,
    "bike": 55
  },
  "is_full": false,
  "last_updated": "2024-01-15T10:30:00Z",
  "model_id": "cv_model_001"
}
```

## 🎯 Vehicle Detection

### Supported Vehicle Types
- **Car**: Sedans, SUVs, hatchbacks, and similar passenger vehicles
- **Bus/Truck**: Buses, trucks, and large commercial vehicles
- **Bike**: Motorcycles, bicycles, and two-wheeled vehicles

### Detection Accuracy
- **Confidence Threshold**: 0.4 (configurable via environment variables)
- **Model**: YOLOv8n (nano) - optimized for speed and efficiency
- **Processing**: Real-time with configurable update intervals (default: 1 second)
- **Image Size**: 640x640 pixels (configurable)

## ⚡ Performance Optimization

### GPU Acceleration
For better performance, ensure CUDA is available:
```bash
# Check CUDA availability
python -c "import torch; print(torch.cuda.is_available())"
```

### Configuration Tuning
- **YOLO_CONFIDENCE**: Lower for more detections, higher for accuracy
- **MAX_DISAPPEARED**: How long to track objects after they disappear
- **MAX_DISTANCE**: Maximum distance for object tracking
- **PROCESS_INTERVAL**: Update frequency (seconds)
- **YOLO_IMAGE_SIZE**: Input image size for detection (affects speed vs accuracy)

## 🛠️ Error Handling & Monitoring

### Error Handling
The service includes comprehensive error handling:
- **Connection Retries**: Automatic reconnection to core backend
- **Video Source Failures**: Graceful handling of camera disconnections
- **Model Loading**: Fallback handling for YOLO model issues
- **Memory Management**: Proper cleanup of resources

### Monitoring & Logging
```bash
# View logs
tail -f logs/cv-model.log

# Check service health
curl http://localhost:5001/health
```

## 🧪 Development

### Running Tests
```bash
pytest tests/
```

### Code Style
```bash
# Install pre-commit hooks
pre-commit install
```

## 🔧 Troubleshooting

### Common Issues

1. **YOLO Model Not Loading**
   ```bash
   # Check if ultralytics is installed
   pip install ultralytics
   
   # Download model manually
   python -c "from ultralytics import YOLO; YOLO('yolov8n.pt')"
   ```

2. **Socket.IO Connection Failed**
   - Verify core backend is running on correct URL
   - Check firewall settings
   - Ensure CORS is properly configured

3. **Camera Access Issues**
   - Verify camera URL/RTSP stream is accessible
   - Check network connectivity
   - Ensure proper permissions

4. **High CPU Usage**
   - Reduce YOLO_IMAGE_SIZE
   - Increase PROCESS_INTERVAL
   - Use GPU acceleration if available

## 🚀 Deployment

### Docker Deployment
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5001

CMD ["python", "cv-model.py"]
```

### Production Considerations
- Use environment variables for configuration
- Implement proper logging and monitoring
- Set up health checks and auto-restart
- Configure reverse proxy (nginx)
- Use process manager (systemd, supervisor)

## 📄 License

This project is part of the Advanced Smart Parking System and is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. **Check the troubleshooting section** above
2. **Review logs** for error details
3. **Verify configuration settings** in `.env` file
4. **Test with sample video files** first before using live streams

### Additional Resources
- **Main Documentation**: Check the main README.md
- **Backend Documentation**: `api/backend/README.md`
- **API Documentation**: `api/backend/API_DOCUMENTATION.md`

---

**Advanced Smart Parking System - Computer Vision Backend**  
*Real-time vehicle detection and counting for smart parking management.*
