import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './lib/mongoose';
import teacherRoutes from './routes/teacherRoutes';

// Load environment variables
dotenv.config();

// Debug: Check if env variables are loaded
console.log('🔍 Environment Check:');
console.log('  PORT:', process.env.PORT);
console.log('  MONGO_URI exists:', !!process.env.MONGO_URI);
console.log('  MONGO_URI preview:', process.env.MONGO_URI?.substring(0, 30) + '...');
console.log('  CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('  CLOUDINARY_API_KEY exists:', !!process.env.CLOUDINARY_API_KEY);
console.log('  CLOUDINARY_API_SECRET exists:', !!process.env.CLOUDINARY_API_SECRET);

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: ['http://localhost:9002', 'http://172.20.10.4:9002'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`🔍 ${req.method} ${req.path} from ${req.ip}`);
  next();
});

// Health check
app.get('/ping', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Teacher backend is running!' });
});

// Mount teacher routes
app.use('/api/teacher', teacherRoutes);

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
      console.log(`\n🚀 Teacher Backend Server Started!`);
      console.log(`📍 Port: ${PORT}`);
      console.log(`🌐 Local: http://localhost:${PORT}`);
      console.log(`🔌 API: http://localhost:${PORT}/api/teacher`);
      console.log(`💚 Health: http://localhost:${PORT}/ping\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
