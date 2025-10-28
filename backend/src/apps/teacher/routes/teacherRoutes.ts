import express from 'express';
import * as announcementController from '../controllers/announcementController';
import * as assignmentController from '../controllers/assignmentController';
import * as testController from '../controllers/testController';
import * as questionController from '../controllers/questionController';
import * as liveClassController from '../controllers/liveClassController';
import * as batchController from '../controllers/batchController';
import * as resourceController from '../controllers/resourceController';
import * as courseController from '../controllers/courseController';
import * as analyticsController from '../controllers/analyticsController';
import * as authController from '../controllers/authController';
import * as uploadController from '../controllers/uploadController';
import * as userController from '../controllers/userController';
import { authenticateTeacher } from '../middlewares/auth';
import multer from 'multer';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory for Firebase upload
const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit for videos
  },
  fileFilter: (req, file, cb) => {
    // Allow video files
    if (file.fieldname === 'video' && !file.mimetype.startsWith('video/')) {
      return cb(new Error('Only video files are allowed for video uploads'));
    }
    // Allow document files for notes
    if (file.fieldname === 'notes') {
      const allowedMimes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'image/jpeg',
        'image/png',
        'image/gif'
      ];
      if (!allowedMimes.includes(file.mimetype)) {
        return cb(new Error('Invalid file type for notes upload'));
      }
    }
    // Allow PDF files for test uploads
    if (file.fieldname === 'pdf' && file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed for test uploads'));
    }
    // Allow other files if they match expected types
    cb(null, true);
  }
});

// ==================== AUTH ROUTES ====================
router.post('/auth/register', authController.register as any);
router.post('/auth/login', authController.login as any);
router.post('/auth/verify-email', authController.verifyEmail as any);
router.post('/auth/resend-otp', authController.resendOTP as any);
router.post('/auth/onboarding', authController.onboarding as any);
router.get('/auth/me', authenticateTeacher, authController.getProfile as any);
router.patch('/auth/profile', authenticateTeacher, authController.updateProfile as any);

// ==================== UPLOAD ROUTES ====================
router.post('/upload/sign', uploadController.generateSignature as any);
router.post('/upload/video', authenticateTeacher, upload.array('videos', 10), courseController.uploadVideo as any);
router.post('/upload/notes', authenticateTeacher, upload.single('notes'), courseController.uploadNotes as any);

// ==================== ANNOUNCEMENT ROUTES ====================
router.get('/announcements', announcementController.getTeacherAnnouncements as any);
router.post('/announcements', announcementController.createAnnouncement as any);
router.patch('/announcements/:id', announcementController.updateAnnouncement as any);
router.post('/announcements/:id/send', announcementController.sendAnnouncement as any);
router.delete('/announcements/:id', announcementController.deleteAnnouncement as any);

// ==================== ASSIGNMENT ROUTES ====================
router.get('/assignments', assignmentController.getTeacherAssignments as any);
router.post('/assignments', assignmentController.createAssignment as any);
router.patch('/assignments/:id', assignmentController.updateAssignment as any);
router.get('/assignments/:id/submissions', assignmentController.getAssignmentSubmissions as any);
router.patch('/assignments/:assignmentId/submissions/:submissionId/grade', assignmentController.gradeSubmission as any);
router.post('/assignments/:id/publish', assignmentController.publishAssignment as any);
router.post('/assignments/:id/plagiarism-check', assignmentController.checkPlagiarism as any);
router.delete('/assignments/:id', assignmentController.deleteAssignment as any);

// ==================== TEST ROUTES ====================
router.get('/tests', testController.getTeacherTests as any);
router.post('/tests', testController.createTest as any);
router.patch('/tests/:id', testController.updateTest as any);
router.post('/tests/:id/upload-pdf', upload.any(), testController.uploadTestPDF as any);
router.get('/tests/:id/attempts', testController.getTestAttempts as any);
router.patch('/tests/:testId/attempts/:attemptId/grade', testController.gradeTestAttempt as any);
router.post('/tests/:id/publish', testController.publishTest as any);
router.delete('/tests/:id', testController.deleteTest as any);

// ==================== QUESTION/DOUBT ROUTES ====================
router.get('/questions', questionController.getTeacherQuestions as any);
router.get('/questions/:id', questionController.getQuestionById as any);
router.post('/questions/:id/answer', questionController.answerQuestion as any);
router.patch('/questions/:id/priority', questionController.setQuestionPriority as any);
router.patch('/questions/:id/resolve', questionController.resolveQuestion as any);
router.patch('/questions/:id/answers/:answerId/accept', questionController.acceptAnswer as any);
router.delete('/questions/:id', questionController.deleteQuestion as any);

// ==================== LIVE CLASS ROUTES ====================
router.get('/live-classes', liveClassController.getTeacherLiveClasses as any);
router.post('/live-classes', liveClassController.scheduleLiveClass as any);
router.patch('/live-classes/:id', liveClassController.updateLiveClass as any);
router.post('/live-classes/:id/start', liveClassController.startLiveClass as any);
router.post('/live-classes/:id/end', liveClassController.endLiveClass as any);
router.post('/live-classes/:id/attendance', liveClassController.markAttendance as any);
router.post('/live-classes/:id/cancel', liveClassController.cancelLiveClass as any);
router.delete('/live-classes/:id', liveClassController.deleteLiveClass as any);

// ==================== BATCH ROUTES ====================
router.get('/batches', batchController.getTeacherBatches as any);
router.post('/batches', batchController.createBatch as any);
router.patch('/batches/:id', batchController.updateBatch as any);
router.post('/batches/:id/students', batchController.addStudentsToBatch as any);
router.delete('/batches/:id/students/:studentId', batchController.removeStudentFromBatch as any);
router.delete('/batches/:id', batchController.deleteBatch as any);

// ==================== RESOURCE ROUTES ====================
router.get('/resources', resourceController.getTeacherResources as any);
router.post('/resources', resourceController.uploadResource as any);
router.patch('/resources/:id', resourceController.updateResource as any);
router.post('/resources/:id/publish', resourceController.publishResource as any);
router.delete('/resources/:id', resourceController.deleteResource as any);

// ==================== COURSE/MODULE ROUTES ====================
router.get('/courses/subject-content', authenticateTeacher, courseController.getTeacherSubjectContent as any);
router.get('/courses/all-subject-content', authenticateTeacher, courseController.getAllTeacherSubjectContent as any);
router.post('/courses/modules', authenticateTeacher, courseController.createModule as any);
router.patch('/courses/modules/:moduleNumber', authenticateTeacher, courseController.updateModule as any);
router.delete('/courses/modules/:moduleNumber', authenticateTeacher, courseController.deleteModule as any);
router.post('/courses/modules/upload-video', courseController.uploadVideo as any);
router.post('/courses/modules/upload-notes', courseController.uploadNotes as any);

// ==================== ANALYTICS ROUTES ====================
router.get('/analytics', analyticsController.getTeacherAnalytics as any);
router.get('/analytics/weekly-activity', analyticsController.getWeeklyActivity as any);

// ==================== STUDENT ROUTES ====================
router.get('/students', userController.getTeacherStudents as any);

export default router;
