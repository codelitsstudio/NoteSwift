import express, { Request } from 'express';
import {
  getFeaturedCourse,
  enrollInCourse,
  getUserEnrollments,
  getAllCourses,
  getLessonProgress,
  updateLessonProgress,
  updateModuleProgress,
  getModuleProgress,
  getPersonalizedRecommendations,
  getHomepageFeaturedCourses,
  getHomepageUpcomingCourses,
  getCourseContent, getSubjectContent, getCourseTeachers, getTeacherProfile,
  getVideoSignedUrl, getNotesSignedUrl
} from '../controllers/controller/courseContentController';
import { toggleModuleLike } from '../controllers/controller/courseContentController';
import { authenticateStudent } from '../middlewares/student.middleware';


const router = express.Router();

// Public routes (no authentication required)
router.get('/featured', getFeaturedCourse);
router.get('/homepage/featured', getHomepageFeaturedCourses);
router.get('/homepage/upcoming', getHomepageUpcomingCourses);
router.get('/', getAllCourses);

// Protected routes (authentication required)
router.post('/enroll', authenticateStudent, enrollInCourse);
router.get('/enrollments/:userId', authenticateStudent, getUserEnrollments);
router.get('/recommendations', authenticateStudent, getPersonalizedRecommendations);

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

// Course content endpoints (with teacher-managed content)
router.get('/:courseId/content', authenticateStudent, getCourseContent);
router.get('/:courseId/subject/:subjectName', authenticateStudent, getSubjectContent);
router.get('/:courseId/teachers', getCourseTeachers);
router.get('/teacher/:teacherId/profile', getTeacherProfile);

// Media access endpoints (signed URLs)
router.get('/:courseId/subject/:subjectName/module/:moduleNumber/video', authenticateStudent, getVideoSignedUrl);
router.get('/:courseId/subject/:subjectName/module/:moduleNumber/notes', authenticateStudent, getNotesSignedUrl);

// Toggle like for a module
router.post('/:courseId/subject/:subjectName/module/:moduleNumber/like', authenticateStudent, toggleModuleLike);

export default router;