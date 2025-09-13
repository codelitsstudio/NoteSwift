
// backend/routes/courseRoutes.ts
import express, { Request } from 'express';
import {
  getFeaturedCourse,
  enrollInCourse,
  getUserEnrollments,
  getAllCourses
} from '../controller/courseController';
import { authenticateStudent } from '../middlewares/student.middleware';

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface User {
      id: string;
      role?: string;
      // add other user properties if needed
    }
    interface Request {
      user?: User;
    }
  }
}

const router = express.Router();

// Public routes (no authentication required)
router.get('/featured', getFeaturedCourse);
router.get('/', getAllCourses);

// Protected routes (authentication required)
router.post('/enroll', authenticateStudent, enrollInCourse);
router.get('/enrollments/:userId', authenticateStudent, getUserEnrollments);

// Additional useful routes you might need
router.get('/my-enrollments', authenticateStudent, (req, res) => {
  // Convenience route to get current user's enrollments
  req.params.userId = req.user!.id;
  getUserEnrollments(req, res);
});

export default router;