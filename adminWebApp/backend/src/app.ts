import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from './lib/mongoose';
import adminRoutes from './routes/adminRoutes';

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

// Debug: Log the MongoDB URI to verify it's loaded
console.log('🔧 ENV Check - MONGODB_URI:', process.env.MONGODB_URI ? 'Loaded ✅' : 'Missing ❌');
console.log('🔧 Database name from URI:', process.env.MONGODB_URI?.split('/').pop()?.split('?')[0]);

const app = express();
const PORT = process.env.PORT || 5003;

// Middleware
app.use(cors({
  origin: ['http://localhost:9001', 'http://172.20.10.4:9001'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`🔍 ${req.method} ${req.path} from ${req.ip}`);
  next();
});

// Health check
app.get('/ping', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Admin backend is running!' });
});

// Mount admin routes
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`\n🚀 Admin Backend Server Started!`);
      console.log(`📍 Port: ${PORT}`);
      console.log(`🌐 Local: http://localhost:${PORT}`);
      console.log(`🔌 API: http://localhost:${PORT}/api/admin`);
      console.log(`💚 Health: http://localhost:${PORT}/ping\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
