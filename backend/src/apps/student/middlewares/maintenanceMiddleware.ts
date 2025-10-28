import { EnrollmentService } from '../services/EnrollmentService';

/**
 * Middleware to automatically enroll new users in featured courses
 */
export const autoEnrollMiddleware = async (req: any, res: any, next: any) => {
  try {
    // Check if this is a successful user registration
    if (req.method === 'POST' && req.route?.path?.includes('register') && res.locals.newUserId) {
      const studentId = res.locals.newUserId;
      
      // DISABLED: Auto-enrollment removed for production safety
      // await EnrollmentService.autoEnrollInFeaturedCourses(studentId);
      
      console.log(`✅ New user registered: ${studentId}`);
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
    // Run health checks every 24 hours (maintenance disabled for safety)
    this.maintenanceInterval = setInterval(async () => {
      try {
        console.log('🔄 Running scheduled health check...');
        
        const healthCheck = await import('../services/DatabaseMaintenanceService')
          .then(module => module.DatabaseMaintenanceService.performHealthCheck());
        
        if (healthCheck.overall !== 'healthy') {
          console.warn('⚠️ Database health check failed:', healthCheck);
          // DISABLED: Automatic maintenance is too dangerous
          // await import('../services/DatabaseMaintenanceService')
          //   .then(module => module.DatabaseMaintenanceService.performMaintenance());
        } else {
          console.log('✅ Database health check passed');
        }
        
        console.log('✅ Scheduled health check completed');
      } catch (error) {
        console.error('❌ Scheduled health check failed:', error);
      }
    }, 24 * 60 * 60 * 1000); // 24 hours
    
    console.log('⏰ Periodic health check scheduler started (24h interval)');
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