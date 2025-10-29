import express, { Request, Response, NextFunction } from 'express';
import { RequestHandler } from 'express';
import path from 'path';
import { config } from "dotenv";

// Load environment variables from .env file in the backend root FIRST
config({ path: path.join(__dirname, '..', '.env') });

import adminApp from './apps/admin/app';
import teacherApp from './apps/teacher/app';
import studentApp from './apps/student/app';
import { MaintenanceScheduler } from './apps/student/middlewares/maintenanceMiddleware';
import connectDB from './core/lib/mongoose';
import './apps/student/models/Teacher.model';
import './apps/teacher/models/Teacher.model';
import './core/models/Message';

const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [
  'http://localhost:9001',
  'http://localhost:9002',
  'http://localhost:3000',
  'http://localhost:19006',
  'http://172.20.10.4:9001',
  'http://172.20.10.4:9002',
  'http://172.20.10.4:3000',
  'https://admin-noteswift.codelitsstudio.com'
];

const app = express();

// Debugging middleware: log incoming origin and method for tracing CORS
const debugMiddleware: RequestHandler = (req, res, next) => {
  const origin = req.headers.origin || 'no-origin';
  if (req.method === 'OPTIONS' || origin) {
    console.log(`🛡️ Incoming request: ${req.method} ${req.path} - Origin: ${origin}`);
  }
  next();
};
app.use(debugMiddleware);

// Explicitly handle OPTIONS preflight requests to ensure we return a reflected
// Access-Control-Allow-Origin header (not '*') when credentials are used.
const optionsHandler: RequestHandler = (req, res, next) => {
  if (req.method !== 'OPTIONS') return next();
  const origin = req.headers.origin as string | undefined;
  console.log('🔁 OPTIONS middleware invoked for', req.path, 'origin:', origin);

  if (!origin) {
    console.log('🔁 No origin provided in request — returning wildcard *');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('X-CORS-Source', 'index-options-no-origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Allow-Headers', req.header('Access-Control-Request-Headers') || 'Content-Type');
    res.sendStatus(204);
    return;
  }

  if (allowedOrigins.includes(origin)) {
    console.log('🔁 Origin allowed — reflecting origin in headers:', origin);
    res.header('Access-Control-Allow-Origin', origin);
    res.header('X-CORS-Source', 'index-options-reflect');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Allow-Headers', req.header('Access-Control-Request-Headers') || 'Content-Type');
    res.sendStatus(204);
    return;
  }

  console.log('🔁 Origin not allowed — returning 403 for origin:', origin);
  res.sendStatus(403);
  return;
};
app.use(optionsHandler);

// Fallback middleware to set Access-Control-Allow-Origin on actual responses
const fallbackMiddleware: RequestHandler = (req, res, next) => {
  const origin = req.headers.origin as string | undefined;
  if (!origin) return next();
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('X-CORS-Source', 'index-fallback-reflect');
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  next();
};
app.use(fallbackMiddleware);

// NOTE: We intentionally avoid using the `cors` package here so our explicit
// OPTIONS handler and fallback middleware control the Access-Control headers.

// Mount platform-specific apps
app.use('/api/admin', adminApp);
app.use('/api/teacher', teacherApp);
app.use('/api/student', studentApp);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Health check for the unified backend
app.get('/ping', (req, res) => {
  res.json({ success: true, message: 'Unified NoteSwift Backend is running!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found in unified backend' });
});

const PORT = Number(process.env.PORT) || 5000;

// Connect to database before starting server
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Unified NoteSwift Backend Server Started!`);
    console.log(`📍 Port: ${PORT}`);
    console.log(`🌐 Local: http://localhost:${PORT}`);
    console.log(`🔌 Admin API: http://localhost:${PORT}/api/admin`);
    console.log(`🔌 Teacher API: http://localhost:${PORT}/api/teacher`);
    console.log(`🔌 Student API: http://localhost:${PORT}/api/student`);
    console.log(`💚 Health: http://localhost:${PORT}/ping\n`);

    // Start periodic maintenance
    MaintenanceScheduler.startPeriodicMaintenance();
  });
}).catch((error) => {
  console.error('❌ Failed to connect to database:', error);
  process.exit(1);
});

export default app;