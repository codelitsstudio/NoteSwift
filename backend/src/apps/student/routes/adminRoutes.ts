import express from 'express';
import { DatabaseMaintenanceService } from '../services/DatabaseMaintenanceService';
import { DatabaseSeeder } from '../services/DatabaseSeeder';
import { EnrollmentService } from '../services/EnrollmentService';
import { authenticateAdmin } from '../middlewares/admin.middleware';
import auditLogger from '../lib/audit-logger';
import {
  getFeaturedCourse,
  enrollInCourse,
  getUserEnrollments,
  getAllCourses,
  getLessonProgress,
  updateLessonProgress,
  updateModuleProgress,
  getModuleProgress,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseById,
  getAllCoursesAdmin
} from '../controllers/controller/courseContentController';
import {
  createOfflineTransaction,
  getTransactions,
  getUnlockCodes,
} from '../controllers/controller/ordersPaymentsController';

const router = express.Router();

// Interface for bulk enrollment request body
interface BulkEnrollmentRequest {
  courseId: string;
  studentIds: string[];
}

/**
 * GET /api/admin/database/health
 * Performs database health check
 */
router.get('/database/health', async (req, res) => {
  try {
    const healthCheck = await DatabaseMaintenanceService.performHealthCheck();
    res.json({
      success: true,
      data: healthCheck
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/admin/database/maintenance
 * Performs database maintenance
 */
router.post('/database/maintenance', async (req, res) => {
  try {
    await DatabaseMaintenanceService.performMaintenance();

    // Log database maintenance
    await auditLogger.logSystemEvent(
      'database_maintenance',
      'Database maintenance performed successfully',
      'success',
      {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      }
    );

    res.json({
      success: true,
      message: 'Database maintenance completed successfully'
    });
  } catch (error) {
    // Log failed maintenance
    await auditLogger.logSystemEvent(
      'database_maintenance',
      `Database maintenance failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'failure',
      {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    );

    res.status(500).json({
      success: false,
      message: 'Database maintenance failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/admin/database/seed
 * Re-seeds the database
 */
router.post('/database/seed', async (req, res) => {
  try {
    await DatabaseSeeder.seedDatabase();

    // Log database seeding
    await auditLogger.logSystemEvent(
      'database_seeding',
      'Database seeded successfully',
      'success',
      {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      }
    );

    res.json({
      success: true,
      message: 'Database seeded successfully'
    });
  } catch (error) {
    // Log failed seeding
    await auditLogger.logSystemEvent(
      'database_seeding',
      `Database seeding failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'failure',
      {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    );

    res.status(500).json({
      success: false,
      message: 'Database seeding failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/admin/database/optimize
 * Optimizes database performance
 */
router.post('/database/optimize', async (req, res) => {
  try {
    await DatabaseMaintenanceService.optimizeDatabase();
    res.json({
      success: true,
      message: 'Database optimization completed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database optimization failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/admin/database/export
 * Exports critical database data
 */
router.get('/database/export', async (req, res) => {
  try {
    const exportData = await DatabaseMaintenanceService.exportCriticalData();
    res.json({
      success: true,
      data: exportData,
      message: 'Database export completed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database export failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/admin/enrollments/analytics
 * Gets enrollment analytics
 */
router.get('/enrollments/analytics', async (req, res) => {
  try {
    const analytics = await EnrollmentService.getEnrollmentAnalytics();
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get enrollment analytics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/admin/enrollments/bulk
 * Bulk enrollment of students
 */
const bulkEnrollmentHandler = async (req: any, res: any) => {
  try {
    const { courseId, studentIds } = req.body;
    
    if (!courseId || !Array.isArray(studentIds)) {
      return res.status(400).json({
        success: false,
        message: 'courseId and studentIds array are required'
      });
    }
    
    const result = await EnrollmentService.bulkEnrollStudents(courseId, studentIds, {
      id: 'system',
      type: 'admin',
      name: 'Admin',
      email: undefined
    });
    res.json({
      success: true,
      data: result,
      message: `Bulk enrollment completed: ${result.successful.length} successful, ${result.failed.length} failed`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Bulk enrollment failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

router.post('/enrollments/bulk', bulkEnrollmentHandler);

/**
 * GET /api/admin/courses/:courseId/stats
 * Gets course enrollment statistics
 */
router.get('/courses/:courseId/stats', async (req, res) => {
  try {
    const { courseId } = req.params;
    const stats = await EnrollmentService.getCourseStats(courseId);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get course stats',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/admin/students/:studentId/auto-enroll
 * Auto-enrolls student in featured courses
 */
router.post('/students/:studentId/auto-enroll', async (req, res) => {
  try {
    const { studentId } = req.params;
    await EnrollmentService.autoEnrollInFeaturedCourses(studentId);
    res.json({
      success: true,
      message: 'Student auto-enrolled in featured courses successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Auto-enrollment failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Course Management Routes
 */

/**
 * GET /api/admin/courses
 * Get all courses for admin management
 */
router.get('/courses', getAllCoursesAdmin);

/**
 * POST /api/admin/courses
 * Create a new course
 */
router.post('/courses', createCourse);

/**
 * GET /api/admin/courses/:id
 * Get a specific course by ID
 */
router.get('/courses/:id', getCourseById);

/**
 * PUT /api/admin/courses/:id
 * Update a course
 */
router.put('/courses/:id', updateCourse);

/**
 * DELETE /api/admin/courses/:id
 * Delete a course
 */
router.delete('/courses/:id', deleteCourse);

/**
 * GET /api/admin/homepage-settings
 * Get homepage settings for admin
 */
router.get('/homepage-settings', async (req, res) => {
  const { getHomepageSettings } = await import('../controllers/controller/courseContentController');
  return getHomepageSettings(req, res);
});

/**
 * PUT /api/admin/homepage-settings
 * Update homepage settings
 */
router.put('/homepage-settings', async (req, res) => {
  const { updateHomepageSettings } = await import('../controllers/controller/courseContentController');
  return updateHomepageSettings(req, res);
});

/**
 * GET /api/admin/recommendations
 * Get recommendation stats and settings
 */
router.get('/recommendations', async (req, res) => {
  const { getRecommendationStats } = await import('../controllers/controller/courseContentController');
  return getRecommendationStats(req, res);
});

/**
 * POST /api/admin/recommendations
 * Analyze a course for recommendations
 */
router.post('/recommendations', async (req, res) => {
  const { analyzeCourseForRecommendations } = await import('../controllers/controller/courseContentController');
  return analyzeCourseForRecommendations(req, res);
});

/**
 * POST /api/admin/recommendations/analyze-all
 * Analyze all courses for recommendations
 */
router.post('/recommendations/analyze-all', async (req, res) => {
  const { analyzeAllCoursesForRecommendations } = await import('../controllers/controller/courseContentController');
  return analyzeAllCoursesForRecommendations(req, res);
});

/**
 * GET /api/admin/recommendations/course-changes
 * Check for course changes since last analysis
 */
router.get('/recommendations/course-changes', async (req, res) => {
  const { checkCourseChanges } = await import('../controllers/controller/courseContentController');
  return checkCourseChanges(req, res);
});

/**
 * POST /api/admin/orders-payments/transaction
 * Create offline transaction and generate unlock code
 */
router.post('/orders-payments/transaction', authenticateAdmin, createOfflineTransaction);

/**
 * GET /api/admin/orders-payments/transactions
 * Get all transactions
 */
router.get('/orders-payments/transactions', authenticateAdmin, getTransactions);

/**
 * GET /api/admin/orders-payments/codes
 * Get all unlock codes
 */
router.get('/orders-payments/codes', authenticateAdmin, getUnlockCodes);

export default router;