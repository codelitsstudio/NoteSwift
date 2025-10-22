import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Teacher from '../models/Teacher.model';

const JWT_SECRET = process.env.SESSION_SECRET || 'your-secret-key-change-in-production';

export interface AuthRequest extends Request {
  teacherId?: string;
  teacher?: any;
}

export const authenticateTeacher = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ success: false, message: 'No token provided' });
      return;
    }

    // Decode JWT to get teacher ID
    let teacherId: string;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      teacherId = decoded.teacherId || decoded.id; // Support both token formats
    } catch (err: any) {
      console.error('Token decode error:', err.message);
      res.status(401).json({ success: false, message: 'Invalid token' });
      return;
    }

    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      res.status(404).json({ success: false, message: 'Teacher not found' });
      return;
    }

    // Attach teacher info to request
    req.teacherId = teacherId;
    req.teacher = teacher;

    next();
  } catch (error: any) {
    console.error('Authentication error:', error);
    res.status(500).json({ success: false, message: 'Authentication failed' });
    return;
  }
};