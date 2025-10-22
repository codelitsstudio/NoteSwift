import { EnrollmentService } from '../services/EnrollmentService';
import { DatabaseSeeder } from '../services/DatabaseSeeder';

/**
 * Middleware to automatically enroll new users in featured courses
 */
export const autoEnrollMiddleware = async (req: any, res: any, next: any) => {
  try {
    // Check if this is a successful user registration
    if (req.method === 'POST' && req.route?.path?.includes('register') && res.locals.newUserId) {
      const studentId = res.locals.newUserId;
      
      // Auto-enroll in featured courses
      await EnrollmentService.autoEnrollInFeaturedCourses(studentId);
      
      // Create default enrollment if needed
      await DatabaseSeeder.createDefaultEnrollment(studentId);
      
      console.log(`✅ Auto-enrolled new user ${studentId} in featured courses`);
    }
    
    next();
  } catch (error) {
    console.error('❌ Auto-enrollment middleware failed:', error);
    // Don't block the request, just log the error
    next();
  }
};

/**
 * Periodic maintenance task runner
 */
export class MaintenanceScheduler {
  private static maintenanceInterval: NodeJS.Timeout | null = null;
  
  /**
   * Starts periodic maintenance tasks
   */
  static startPeriodicMaintenance() {
    // Run maintenance every 24 hours
    this.maintenanceInterval = setInterval(async () => {
      try {
        console.log('🔄 Running scheduled maintenance...');
        
        const healthCheck = await import('../services/DatabaseMaintenanceService')
          .then(module => module.DatabaseMaintenanceService.performHealthCheck());
        
        if (healthCheck.overall !== 'healthy') {
          await import('../services/DatabaseMaintenanceService')
            .then(module => module.DatabaseMaintenanceService.performMaintenance());
        }
        
        console.log('✅ Scheduled maintenance completed');
      } catch (error) {
        console.error('❌ Scheduled maintenance failed:', error);
      }
    }, 24 * 60 * 60 * 1000); // 24 hours
    
    console.log('⏰ Periodic maintenance scheduler started (24h interval)');
  }
  
  /**
   * Stops periodic maintenance
   */
  static stopPeriodicMaintenance() {
    if (this.maintenanceInterval) {
      clearInterval(this.maintenanceInterval);
      this.maintenanceInterval = null;
      console.log('⏰ Periodic maintenance scheduler stopped');
    }
  }
}

/**
 * Graceful shutdown handler
 */
export const gracefulShutdown = () => {
  process.on('SIGTERM', () => {
    console.log('📤 Received SIGTERM signal, starting graceful shutdown...');
    MaintenanceScheduler.stopPeriodicMaintenance();
    process.exit(0);
  });
  
  process.on('SIGINT', () => {
    console.log('📤 Received SIGINT signal, starting graceful shutdown...');
    MaintenanceScheduler.stopPeriodicMaintenance();
    process.exit(0);
  });
};