import express from 'express';
import { DatabaseMaintenanceService } from '../services/DatabaseMaintenanceService';
import { DatabaseSeeder } from '../services/DatabaseSeeder';
import { EnrollmentService } from '../services/EnrollmentService';

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
    res.json({
      success: true,
      message: 'Database maintenance completed successfully'
    });
  } catch (error) {
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
    res.json({
      success: true,
      message: 'Database seeded successfully'
    });
  } catch (error) {
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
    
    const result = await EnrollmentService.bulkEnrollStudents(courseId, studentIds);
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

export default router;