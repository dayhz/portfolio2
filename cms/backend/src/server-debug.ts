import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Portfolio CMS API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Test d'import du router
console.log('Tentative d\'import du router auth...');
try {
  const authRoutes = require('./routes/auth');
  console.log('authRoutes type:', typeof authRoutes);
  console.log('authRoutes keys:', Object.keys(authRoutes));
  console.log('authRoutes:', authRoutes);
  
  if (typeof authRoutes === 'function') {
    app.use('/api/auth', authRoutes);
    console.log('✅ Router auth ajouté avec succès');
  } else {
    console.log('❌ authRoutes n\'est pas une fonction');
  }
} catch (error) {
  console.error('❌ Erreur lors de l\'import du router auth:', error);
}

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

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
});