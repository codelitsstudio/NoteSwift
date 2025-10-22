import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import adminRoutes from './routes/adminRoutes';

const app = express();
const PORT = process.env.PORT || 5003;

// Middleware
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
app.use('/', adminRoutes);

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

export default app;
