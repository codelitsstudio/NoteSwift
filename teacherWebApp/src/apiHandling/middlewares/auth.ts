import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongoose';

// Teacher authentication middleware
export async function authenticateTeacher(req: NextRequest) {
  try {
    await connectDB();
    
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Authorization token required');
    }
    
    const token = authHeader.substring(7);
    
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT secret not configured');
    }
    
    // For now, decode without verification (will be enhanced with jwt library)
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      
      if (payload.role !== 'teacher') {
        throw new Error('Access denied. Teacher role required');
      }
      
      return {
        id: payload.id,
        email: payload.email,
        role: payload.role,
        onboardingComplete: payload.onboardingComplete,
      };
    } catch {
      throw new Error('Invalid token format');
    }
    
  } catch (error: any) {
    throw new Error(`Authentication failed: ${error.message}`);
  }
}

// CORS middleware for API routes
export function corsMiddleware() {
  return {
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

// Rate limiting middleware (simple implementation)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(maxRequests = 100, windowMs = 15 * 60 * 1000) {
  return (req: NextRequest) => {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const now = Date.now();
    
    const record = requestCounts.get(ip);
    
    if (!record || now > record.resetTime) {
      requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (record.count >= maxRequests) {
      return false;
    }
    
    record.count++;
    return true;
  };
}

// Request validation middleware
export function validateContentType(req: NextRequest, expectedType = 'application/json') {
  const contentType = req.headers.get('content-type');
  
  if (req.method === 'POST' || req.method === 'PUT') {
    if (!contentType || !contentType.includes(expectedType)) {
      throw new Error(`Content-Type must be ${expectedType}`);
    }
  }
}

// File upload validation
export function validateFileUpload(file: File, options: {
  maxSize?: number;
  allowedTypes?: string[];
  maxFiles?: number;
}) {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = [], maxFiles = 1 } = options;
  
  if (file.size > maxSize) {
    throw new Error(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
  }
  
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }
  
  return true;
}

// Database transaction wrapper
export async function withTransaction<T>(operation: () => Promise<T>): Promise<T> {
  // TODO: Implement database transaction logic
  // For now, just execute the operation
  return await operation();
}