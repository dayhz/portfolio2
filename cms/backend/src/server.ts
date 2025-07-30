import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { initializeDatabase } from './lib/prisma';
import { cacheService } from './services/cacheService';
import { performanceMonitoringService } from './services/performanceMonitoringService';
const authRoutes = require('./routes/auth-working');
import mediaRoutes from './routes/media';
import profileRoutes from './routes/profile';
import projectRoutes from './routes/projects';
import templateProjectRoutes from './routes/template-projects';
import aboutRoutes from './routes/about';
import authDebugRoutes from './routes/auth-debug';
import { homepageRouter } from './routes/homepage';
import { performanceRouter } from './routes/performance';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Performance monitoring middleware
app.use(performanceMonitoringService.trackPerformance());

// Static files for uploads
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const uploadsPath = path.join(process.cwd(), uploadDir);
console.log(`Serving static files from: ${uploadsPath}`);
app.use(`/${uploadDir}`, (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(uploadsPath));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Portfolio CMS API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/debug', authDebugRoutes);

// API Routes
app.use('/api/projects', projectRoutes);
app.use('/api/template-projects', templateProjectRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/homepage', homepageRouter);
app.use('/api/performance', performanceRouter);
// app.use('/api/testimonials', testimonialRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/profile', profileRoutes);
// app.use('/api/services', serviceRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found'
  });
});

// Initialize database and start server
async function startServer() {
  const dbConnected = await initializeDatabase();
  
  if (!dbConnected) {
    console.error('❌ Failed to connect to database. Exiting...');
    process.exit(1);
  }

  // Initialize cache service
  try {
    await cacheService.connect();
    const cacheType = cacheService.getCacheType();
    console.log(`✅ Cache service initialized (${cacheType})`);
    
    // Warm cache with homepage content
    setTimeout(async () => {
      await cacheService.warmCache();
    }, 2000); // Wait 2 seconds after server start
  } catch (error) {
    console.warn('⚠️ Cache service initialization failed:', (error as Error).message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔐 Auth endpoints:`);
    console.log(`   POST /api/auth/register - Create admin user`);
    console.log(`   POST /api/auth/login - Login`);
    console.log(`   GET /api/auth/verify - Verify token`);
    console.log(`   GET /api/auth/me - Get user info`);
  });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  await cacheService.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 SIGINT received, shutting down gracefully...');
  await cacheService.disconnect();
  process.exit(0);
});

startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});