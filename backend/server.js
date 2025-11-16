import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import logger from './config/logger.js';
import { requestLogger } from './middleware/requestLogger.js';
// import fileRoutes from './routes/files.js';

// Load environment variables FIRST
dotenv.config();

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to database
connectDB();

const app = express();

// ================================
// MIDDLEWARE - Must be BEFORE routes
// ================================

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL]
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ================================
// ROUTES
// ================================

// Import routes AFTER middleware
import authRoutes from './routes/auth.js';
import podcastRoutes from './routes/podcasts.js';
import commentRoutes from './routes/comments.js';
// import Comment from '../models/comment.js';
import playlistRoutes from './routes/playlists.js';
import logRoutes from './routes/logs.js';
import postRoutes from './routes/posts.js';
import fileRoutes from './routes/files.js';

// Health check - Test this first!
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'SharePod API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/podcasts', podcastRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/comments', commentRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'SharePod API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      podcasts: '/api/podcasts',
      playlists: '/api/playlists',
      logs: '/api/logs',
      files: '/api/files'
    }
  });
});

// ================================
// ERROR HANDLERS - Must be LAST
// ================================

// 404 Handler
app.use((req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  
  console.log('❌ 404 Error:', {
    method: req.method,
    url: req.originalUrl,
    baseUrl: req.baseUrl,
    path: req.path
  });
  
  res.status(404).json({ 
  error: 'Route not found',
  method: req.method,
  requestedUrl: req.originalUrl,
  availableRoutes: [
    'GET /api/health',
    'POST /api/auth/register',
    'POST /api/auth/login',
    'GET /api/auth/me',
    'GET /api/podcasts',
    'POST /api/podcasts',
    'GET /api/podcasts/:id',
    'DELETE /api/podcasts/:id',
    'POST /api/podcasts/:id/play',
    'GET /api/podcasts/user/:userId',
    'GET /api/posts',
    'POST /api/posts',
    'GET /api/posts/:id',
    'DELETE /api/posts/:id',
    'POST /api/posts/:id/view',
    'POST /api/posts/:id/like',
    'GET /api/posts/user/:userId',
    'GET /api/playlists',
    'POST /api/playlists',
    'GET /api/playlists/:id',
    'GET /api/logs',
    'POST /api/files/upload',
    'GET /api/files/:id',
    'GET /api/files',
    
    // --- New Comment Routes ---
    'GET /api/comments',
    'POST /api/comments',
    'GET /api/comments/:id',
    'DELETE /api/comments/:id',
    'GET /api/comments/post/:postId',
    'POST /api/comments/:id/like'
  ]
});
});
// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  
  logger.error('Unhandled error', { 
    error: err.message, 
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ================================
// START SERVER
// ================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ============================================');
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log('============================================');
  console.log('');
  
  logger.info(`Server started on port ${PORT}`, {
    action: 'SERVER_START',
    port: PORT,
    environment: process.env.NODE_ENV
  });
});

// app.use('/api/files', fileRoutes);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  logger.error('Unhandled rejection', { error: err.message, stack: err.stack });
});
