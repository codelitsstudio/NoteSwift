import express, { Request } from 'express';
import {
  getFeaturedCourse,
  enrollInCourse,
  getUserEnrollments,
  getAllCourses,
  getLessonProgress,
  updateLessonProgress,
  updateModuleProgress,
  getModuleProgress
} from '../controller/courseController';
import { authenticateStudent } from '../middlewares/student.middleware';


const router = express.Router();

// Public routes (no authentication required)
router.get('/featured', getFeaturedCourse);
router.get('/', getAllCourses);

// Protected routes (authentication required)
router.post('/enroll', authenticateStudent, enrollInCourse);
router.get('/enrollments/:userId', authenticateStudent, getUserEnrollments);

// Additional useful routes you might need
// Extend Express Request interface to include 'user' for type safety
interface AuthRequest extends express.Request {
  user?: {
    id: string;
    role?: string;
  };
}
router.get('/my-enrollments', authenticateStudent, (req: express.Request, res: express.Response) => {
  // Convenience route to get current user's enrollments
  const authReq = req as AuthRequest;
  authReq.params.userId = authReq.user!.id;
  getUserEnrollments(authReq, res);
});

// Lesson progress endpoints (must be after router is declared)
router.get('/progress/:courseId', authenticateStudent, getLessonProgress);
router.post('/progress/:courseId', authenticateStudent, updateLessonProgress);

// Module progress endpoints
router.get('/progress/:courseId/module/:moduleNumber', authenticateStudent, getModuleProgress);
router.post('/progress/:courseId/module', authenticateStudent, updateModuleProgress);

export default router;