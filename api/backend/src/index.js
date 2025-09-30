import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import helmet from 'helmet';
import { createServer } from 'http';
import { marked } from 'marked';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

// Import constants and configurations

// Import database connection
import database from './database/connection.js';

// Import Cloudinary configuration
import './config/cloudinary.js';

// Import middleware
import { errorHandler, notFound, rateLimitErrorHandler } from './middlewares/errorHandler.js';

// Import routes
import parkingRoutes from './routes/parkingRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import userRoutes from './routes/userRoutes.js';
import visitRoutes from './routes/visitRoutes.js';

// Import socket service
import socketService from './services/socketService.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
socketService.initialize(server);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://park-smart.netlify.app'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin like mobile apps or curl requests
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS not allowed from origin: ${origin}`), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting (coerce env to numbers and provide sane defaults)
const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || (15 * 60 * 1000);
const maxRequests = Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;
const limiter = rateLimit({
  windowMs,
  max: maxRequests,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    error: 'Rate limit exceeded'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: database.getConnectionStatus()
  });
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/parkings', parkingRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/visits', visitRoutes);

// Socket.IO status endpoint
app.get('/api/socket/status', (req, res) => {
  res.json({
    success: true,
    data: {
      connectedClients: socketService.getConnectedClients().length,
      cvModelConnections: socketService.getCVModelConnections().length,
      io: socketService.getIO() ? 'initialized' : 'not initialized'
    }
  });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get('/api', (req, res) => {
  const filePath = path.join(__dirname, '../API_DOCUMENTATION.md');
  const markdown = fs.readFileSync(filePath, 'utf8');

  // Convert MD -> HTML
  const htmlContent = marked(markdown);

  // Wrap in a simple HTML page with GitHub-style markdown CSS
  const page = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>API Documentation</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/github-markdown-css/github-markdown.min.css">
      <style>
        body {
          display: flex;
          justify-content: center;
          padding: 2rem;
          background: #f6f8fa;
        }
        .markdown-body {
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          background: white;
          padding: 2rem;
          border-radius: 10px;
          max-width: 900px;
          width: 100%;
        }
      </style>
    </head>
    <body>
      <article class="markdown-body">
        ${htmlContent}
      </article>
    </body>
    </html>
  `;

  res.send(page);
});

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(rateLimitErrorHandler);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await database.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await database.disconnect();
  process.exit(0);
});

// Unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await database.connect();

    const PORT = process.env.PORT || 5000;

    // Start HTTP server
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`Socket.IO: http://localhost:${PORT}`);
      console.log(`API Documentation: http://localhost:${PORT}/api`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
