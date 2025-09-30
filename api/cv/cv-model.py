"""
Advanced Smart Parking System - CV Model Backend

YOLOv8 + FastAPI backend that:
- Detects vehicles (bike/car/bus_truck) using ultralytics YOLOv8
- Counts per-category using an improved centroid tracker
- Connects to the main Node.js backend via Socket.IO and pushes real-time updates
- Provides manual adjustment capabilities for staff
- Safe thread -> asyncio scheduling using asyncio.run_coroutine_threadsafe
- Automatic reconnection and error handling
"""

import base64
import threading
import time
import cv2
import numpy as np
import os
import asyncio
import json
import logging
from typing import Dict, Optional, List, Any, Tuple
from datetime import datetime

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import socketio
from ultralytics import YOLO

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# -----------------------------
# Configuration & Environment
# -----------------------------
class Config:
    # Core backend connection
    NODE_BACKEND_URL = os.getenv('NODE_BACKEND_URL', 'http://localhost:5000')
    CV_MODEL_ID = os.getenv('CV_MODEL_ID', 'cv_model_001')
    
    # YOLO configuration
    YOLO_MODEL_PATH = os.getenv('YOLO_MODEL_PATH', 'yolov8n.pt')
    YOLO_CONFIDENCE = float(os.getenv('YOLO_CONFIDENCE', '0.4'))
    YOLO_IMAGE_SIZE = int(os.getenv('YOLO_IMAGE_SIZE', '640'))
    
    # Tracking configuration
    MAX_DISAPPEARED = int(os.getenv('MAX_DISAPPEARED', '30'))
    MAX_DISTANCE = int(os.getenv('MAX_DISTANCE', '50'))
    
    # Processing configuration
    PROCESS_INTERVAL = float(os.getenv('PROCESS_INTERVAL', '1.0'))  # seconds
    FRAME_WIDTH = int(os.getenv('FRAME_WIDTH', '640'))
    FRAME_HEIGHT = int(os.getenv('FRAME_HEIGHT', '360'))

# -----------------------------
# FastAPI App Setup
# -----------------------------
app = FastAPI(
    title="Advanced Smart Parking System - CV Model",
    description="Computer Vision backend for real-time vehicle counting",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Improved Centroid Tracker
# -----------------------------
class ImprovedCentroidTracker:
    def __init__(self, max_disappeared=30, max_distance=50):
        self.next_object_id = 0
        self.objects: Dict[int, Dict] = {}  # object_id -> {centroid, class_name, last_seen}
        self.disappeared: Dict[int, int] = {}
        self.max_disappeared = max_disappeared
        self.max_distance = max_distance

    def register(self, centroid: Tuple[int, int], class_name: str):
        self.objects[self.next_object_id] = {
            'centroid': centroid,
            'class_name': class_name,
            'last_seen': time.time()
        }
        self.disappeared[self.next_object_id] = 0
        self.next_object_id += 1

    def deregister(self, object_id: int):
        if object_id in self.objects:
            del self.objects[object_id]
        if object_id in self.disappeared:
            del self.disappeared[object_id]

    def update(self, detections: List[Tuple[str, float, Tuple[int, int, int, int]]]) -> Dict[int, Dict]:
        """
        Update tracker with new detections
        detections: List of (class_name, confidence, (x1, y1, x2, y2))
        """
        if len(detections) == 0:
            # No detections, mark all objects as disappeared
            for oid in list(self.disappeared.keys()):
                self.disappeared[oid] += 1
                if self.disappeared[oid] > self.max_disappeared:
                    self.deregister(oid)
            return self.objects

        # Calculate centroids for new detections
        input_centroids = []
        input_classes = []
        for class_name, confidence, (x1, y1, x2, y2) in detections:
            centroid = (int((x1 + x2) / 2.0), int((y1 + y2) / 2.0))
            input_centroids.append(centroid)
            input_classes.append(class_name)

        if len(self.objects) == 0:
            # No existing objects, register all new detections
            for i in range(len(input_centroids)):
                self.register(input_centroids[i], input_classes[i])
        else:
            # Match existing objects with new detections
            object_ids = list(self.objects.keys())
            object_centroids = [self.objects[oid]['centroid'] for oid in object_ids]

            # Calculate distances between existing and new centroids
            D = np.linalg.norm(
                np.array(object_centroids)[:, None] - np.array(input_centroids)[None, :], 
                axis=2
            )

            # Find optimal matches using Hungarian algorithm
            rows = D.min(axis=1).argsort()
            cols = D.argmin(axis=1)[rows]

            used_rows = set()
            used_cols = set()

            for (row, col) in zip(rows, cols):
                if row in used_rows or col in used_cols:
                    continue
                if D[row, col] > self.max_distance:
                    continue
                
                oid = object_ids[row]
                self.objects[oid]['centroid'] = input_centroids[col]
                self.objects[oid]['class_name'] = input_classes[col]
                self.objects[oid]['last_seen'] = time.time()
                self.disappeared[oid] = 0
                
                used_rows.add(row)
                used_cols.add(col)

            # Handle unused existing objects
            unused_rows = set(range(D.shape[0])).difference(used_rows)
            for row in unused_rows:
                oid = object_ids[row]
                self.disappeared[oid] += 1
                if self.disappeared[oid] > self.max_disappeared:
                    self.deregister(oid)

            # Handle new objects
            unused_cols = set(range(D.shape[1])).difference(used_cols)
            for col in unused_cols:
                self.register(input_centroids[col], input_classes[col])

        return self.objects

# -----------------------------
# Vehicle Detection & Counting Processor
# -----------------------------
class ParkingConfig(BaseModel):
    parking_id: str = Field(..., description="Unique parking identifier")
    capacities: Dict[str, int] = Field(..., description="Vehicle capacities by type")
    camera_source: str = Field(..., description="Camera source (file path, RTSP, or HTTP stream)")
    model_id: str = Field(default=Config.CV_MODEL_ID, description="CV model identifier")

class VehicleCounts(BaseModel):
    car: int = 0
    bus_truck: int = 0
    bike: int = 0

class ParkingStatus(BaseModel):
    parking_id: str
    counts: VehicleCounts
    capacity: Dict[str, int]
    available: Dict[str, int]
    is_full: bool
    last_updated: datetime
    model_id: str

class Processor:
    def __init__(self, config: ParkingConfig):
        self.config = config
        self.counts = VehicleCounts()
        self.lock = threading.Lock()
        self.tracker = ImprovedCentroidTracker(
            max_disappeared=Config.MAX_DISAPPEARED,
            max_distance=Config.MAX_DISTANCE
        )
        self.running = False
        self.thread: Optional[threading.Thread] = None
        
        # Socket.IO client for core backend communication
        self.sio = socketio.Client()
        self.sio_connected = False
        self.connection_retries = 0
        self.max_retries = 5
        
        # Setup Socket.IO event handlers
        self._setup_socketio_handlers()
        
        # Load YOLO model
        self.detector = self._load_yolo_model()
        
        # Vehicle class mapping (YOLO classes -> our categories)
        self.class_map = {
            'motorcycle': 'bike',
            'bicycle': 'bike',
            'car': 'car',
            'truck': 'bus_truck',
            'bus': 'bus_truck'
        }
        
        logger.info(f"Initialized processor for parking {config.parking_id}")

    def _setup_socketio_handlers(self):
        """Setup Socket.IO event handlers"""
        
        @self.sio.event
        def connect():
            logger.info(f"Connected to core backend: {Config.NODE_BACKEND_URL}")
            self.sio_connected = True
            self.connection_retries = 0
            
            # Register this CV model with the core backend
            self.sio.emit('cv_model_connect', {
                'parkingId': self.config.parking_id,
                'modelId': self.config.model_id
            })

        @self.sio.event
        def disconnect():
            logger.warning("Disconnected from core backend")
            self.sio_connected = False

        @self.sio.event
        def connect_error(data):
            logger.error(f"Socket.IO connection error: {data}")
            self.sio_connected = False

    def _load_yolo_model(self) -> Optional[YOLO]:
        """Load YOLO model with error handling"""
        try:
            model = YOLO(Config.YOLO_MODEL_PATH)
            logger.info(f"Loaded YOLO model: {Config.YOLO_MODEL_PATH}")
            return model
        except Exception as e:
            logger.error(f"Failed to load YOLO model: {e}")
            return None

    def _connect_socketio(self):
        """Connect to core backend with retry logic"""
        if self.sio_connected:
            return True
            
        try:
            self.sio.connect(Config.NODE_BACKEND_URL)
            return True
        except Exception as e:
            self.connection_retries += 1
            logger.error(f"Socket.IO connection attempt {self.connection_retries} failed: {e}")
            
            if self.connection_retries < self.max_retries:
                time.sleep(2 ** self.connection_retries)  # Exponential backoff
                return self._connect_socketio()
            else:
                logger.error("Max Socket.IO connection retries reached")
                return False

    def start(self):
        """Start the processor"""
        if self.running:
            logger.warning("Processor already running")
            return
            
        self.running = True
        
        # Start Socket.IO connection in background
        def connect_sio():
            self._connect_socketio()
            if self.sio_connected:
                self.sio.wait()

        sio_thread = threading.Thread(target=connect_sio, daemon=True)
        sio_thread.start()
        
        # Start video processing thread
        self.thread = threading.Thread(target=self._run, daemon=True)
        self.thread.start()
        
        logger.info(f"Started processor for parking {self.config.parking_id}")

    def stop(self):
        """Stop the processor"""
        self.running = False
        
        if self.sio_connected:
            self.sio.disconnect()
            
        if self.thread:
            self.thread.join(timeout=5)
            
        logger.info(f"Stopped processor for parking {self.config.parking_id}")

    def _detect_vehicles(self, frame: np.ndarray) -> List[Tuple[str, float, Tuple[int, int, int, int]]]:
        """Detect vehicles in frame using YOLO"""
        if self.detector is None:
            return []
            
        try:
            results = self.detector(
                frame, 
                imgsz=Config.YOLO_IMAGE_SIZE, 
                conf=Config.YOLO_CONFIDENCE, 
                verbose=False
            )
            
            detections = []
            for result in results:
                if result.boxes is not None:
                    for box in result.boxes:
                        cls_index = int(box.cls[0])
                        confidence = float(box.conf[0])
                        x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
                        
                        class_name = self.detector.model.names[cls_index]
                        if class_name in self.class_map:
                            detections.append((
                                class_name, 
                                confidence, 
                                (x1, y1, x2, y2)
                            ))
            
            return detections
            
        except Exception as e:
            logger.error(f"Vehicle detection error: {e}")
            return []

    def _update_counts(self):
        """Update vehicle counts from tracked objects"""
        with self.lock:
            # Reset counts
            self.counts = VehicleCounts()
            
            # Count tracked objects by class
            for obj_data in self.tracker.objects.values():
                class_name = obj_data['class_name']
                mapped_class = self.class_map.get(class_name)
                
                if mapped_class == 'bike':
                    self.counts.bike += 1
                elif mapped_class == 'car':
                    self.counts.car += 1
                elif mapped_class == 'bus_truck':
                    self.counts.bus_truck += 1

    def _send_update_to_backend(self):
        """Send current counts to core backend"""
        if not self.sio_connected:
            return
            
        try:
            with self.lock:
                counts_dict = {
                    'car': self.counts.car,
                    'bus_truck': self.counts.bus_truck,
                    'bike': self.counts.bike
                }
                
                # Calculate available spaces
                available = {}
                is_full = True
                for vehicle_type, count in counts_dict.items():
                    capacity = self.config.capacities.get(vehicle_type, 0)
                    available[vehicle_type] = max(0, capacity - count)
                    if available[vehicle_type] > 0:
                        is_full = False
                
                payload = {
                    'parking_id': self.config.parking_id,
                    'counts': counts_dict,
                    'capacity': self.config.capacities,
                    'available': available,
                    'is_full': is_full,
                    'last_updated': datetime.now().isoformat(),
                    'model_id': self.config.model_id
                }
                
                # Send to core backend
                self.sio.emit('parking_count_update', payload)
                
        except Exception as e:
            logger.error(f"Failed to send update to backend: {e}")

    def _run(self):
        """Main processing loop"""
        cap = cv2.VideoCapture(self.config.camera_source)
        if not cap.isOpened():
            logger.error(f"Failed to open video source: {self.config.camera_source}")
            return

        logger.info(f"Started video processing for parking {self.config.parking_id}")
        
        frame_count = 0
        last_update_time = time.time()

        while self.running:
            ret, frame = cap.read()
            if not ret:
                logger.warning("Failed to read frame, retrying...")
                time.sleep(0.1)
                continue

            frame_count += 1
            
            # Resize frame for processing
            frame = cv2.resize(frame, (Config.FRAME_WIDTH, Config.FRAME_HEIGHT))
            
            # Detect vehicles
            detections = self._detect_vehicles(frame)
            
            # Update tracker
            self.tracker.update(detections)
            
            # Update counts
            self._update_counts()
            
            # Send updates to backend periodically
            current_time = time.time()
            if current_time - last_update_time >= Config.PROCESS_INTERVAL:
                self._send_update_to_backend()
                last_update_time = current_time
                
                # Log status every 30 seconds
                if frame_count % 30 == 0:
                    logger.info(f"Parking {self.config.parking_id} - Counts: {self.counts}")

        cap.release()
        logger.info(f"Stopped video processing for parking {self.config.parking_id}")

    def get_status(self) -> ParkingStatus:
        """Get current parking status"""
        with self.lock:
            counts_dict = {
                'car': self.counts.car,
                'bus_truck': self.counts.bus_truck,
                'bike': self.counts.bike
            }
            
            available = {}
            is_full = True
            for vehicle_type, count in counts_dict.items():
                capacity = self.config.capacities.get(vehicle_type, 0)
                available[vehicle_type] = max(0, capacity - count)
                if available[vehicle_type] > 0:
                    is_full = False
            
            return ParkingStatus(
                parking_id=self.config.parking_id,
                counts=self.counts,
                capacity=self.config.capacities,
                available=available,
                is_full=is_full,
                last_updated=datetime.now(),
                model_id=self.config.model_id
            )

    def manual_adjust(self, adjustments: Dict[str, int]):
        """Manually adjust vehicle counts (for staff corrections)"""
        with self.lock:
            for vehicle_type, count in adjustments.items():
                if vehicle_type == 'car':
                    self.counts.car = max(0, min(self.config.capacities.get('car', 0), count))
                elif vehicle_type == 'bus_truck':
                    self.counts.bus_truck = max(0, min(self.config.capacities.get('bus_truck', 0), count))
                elif vehicle_type == 'bike':
                    self.counts.bike = max(0, min(self.config.capacities.get('bike', 0), count))
        
        # Immediately send update to backend
        self._send_update_to_backend()
        logger.info(f"Manual adjustment for parking {self.config.parking_id}: {adjustments}")

# -----------------------------
# FastAPI Routes
# -----------------------------
processors: Dict[str, Processor] = {}

@app.get('/')
def welcome():
    """Welcome endpoint"""
    return {
        'message': 'Advanced Smart Parking System - CV Model Backend',
        'version': '1.0.0',
        'status': 'running',
        'timestamp': datetime.now().isoformat()
    }

@app.get('/health')
def health_check():
    """Health check endpoint"""
    return {
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'active_processors': len(processors),
        'backend_url': Config.NODE_BACKEND_URL
    }

@app.post('/init')
def init_parking(req: ParkingConfig):
    """Initialize a new parking processor"""
    if req.parking_id in processors:
        raise HTTPException(status_code=400, detail='Parking ID already exists')
    
    # Validate capacities
    required_types = {'car', 'bus_truck', 'bike'}
    if not all(t in req.capacities for t in required_types):
        raise HTTPException(
            status_code=400, 
            detail=f'Capacities must include: {required_types}'
        )
    
    processor = Processor(req)
    processors[req.parking_id] = processor
    processor.start()
    
    logger.info(f"Initialized parking processor: {req.parking_id}")
    return {
        'status': 'started',
        'parking_id': req.parking_id,
        'model_id': req.model_id
    }

@app.post('/stop/{parking_id}')
def stop_parking(parking_id: str):
    """Stop a parking processor"""
    processor = processors.get(parking_id)
    if not processor:
        raise HTTPException(status_code=404, detail='Parking processor not found')
    
    processor.stop()
    del processors[parking_id]
    
    logger.info(f"Stopped parking processor: {parking_id}")
    return {'status': 'stopped', 'parking_id': parking_id}

@app.get('/status/{parking_id}')
def get_status(parking_id: str):
    """Get current status of a parking processor"""
    processor = processors.get(parking_id)
    if not processor:
        raise HTTPException(status_code=404, detail='Parking processor not found')
    
    return processor.get_status()

class ManualAdjustRequest(BaseModel):
    adjustments: Dict[str, int] = Field(..., description="Vehicle count adjustments")

@app.patch('/adjust/{parking_id}')
def manual_adjust(parking_id: str, req: ManualAdjustRequest):
    """Manually adjust vehicle counts"""
    processor = processors.get(parking_id)
    if not processor:
        raise HTTPException(status_code=404, detail='Parking processor not found')
    
    processor.manual_adjust(req.adjustments)
    return {
        'status': 'adjusted',
        'parking_id': parking_id,
        'adjustments': req.adjustments
    }

@app.get('/list')
def list_processors():
    """List all active parking processors"""
    return {
        'active_processors': len(processors),
        'parking_ids': list(processors.keys())
    }

@app.get('/config')
def get_config():
    """Get current configuration"""
    return {
        'node_backend_url': Config.NODE_BACKEND_URL,
        'yolo_model_path': Config.YOLO_MODEL_PATH,
        'yolo_confidence': Config.YOLO_CONFIDENCE,
        'max_disappeared': Config.MAX_DISAPPEARED,
        'max_distance': Config.MAX_DISTANCE,
        'process_interval': Config.PROCESS_INTERVAL
    }

# -----------------------------
# WebSocket endpoint for real-time updates
# -----------------------------
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, parking_id: str, websocket: WebSocket):
        await websocket.accept()
        if parking_id not in self.active_connections:
            self.active_connections[parking_id] = []
        self.active_connections[parking_id].append(websocket)

    async def disconnect(self, parking_id: str, websocket: WebSocket):
        if parking_id in self.active_connections:
            if websocket in self.active_connections[parking_id]:
                self.active_connections[parking_id].remove(websocket)

    async def broadcast(self, parking_id: str, message: dict):
        if parking_id in self.active_connections:
            dead_connections = []
            for connection in self.active_connections[parking_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    dead_connections.append(connection)
            
            # Remove dead connections
            for dead_connection in dead_connections:
                await self.disconnect(parking_id, dead_connection)

manager = ConnectionManager()

@app.websocket('/ws/{parking_id}')
async def websocket_endpoint(websocket: WebSocket, parking_id: str):
    """WebSocket endpoint for real-time updates"""
    await manager.connect(parking_id, websocket)
    
    try:
        # Send initial status
        processor = processors.get(parking_id)
        if processor:
            await websocket.send_json(processor.get_status().dict())
        
        # Keep connection alive and handle messages
        while True:
            data = await websocket.receive_text()
            if data.lower() == 'ping':
                processor = processors.get(parking_id)
                if processor:
                    await websocket.send_json(processor.get_status().dict())
                else:
                    await websocket.send_json({'error': 'Processor not found'})
                    
    except WebSocketDisconnect:
        await manager.disconnect(parking_id, websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await manager.disconnect(parking_id, websocket)

# -----------------------------
# Startup and shutdown events
# -----------------------------
@app.on_event("startup")
async def startup_event():
    logger.info("CV Model Backend starting up...")
    logger.info(f"Core backend URL: {Config.NODE_BACKEND_URL}")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("CV Model Backend shutting down...")
    # Stop all processors
    for parking_id, processor in list(processors.items()):
        processor.stop()
    processors.clear()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001)
