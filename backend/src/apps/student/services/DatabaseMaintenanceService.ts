import mongoose from 'mongoose';
import Course from '../models/Course.model';
import CourseEnrollment from '../models/CourseEnrollment';

export interface HealthCheckResult {
  status: 'healthy' | 'warning' | 'error';
  message: string;
  details?: any;
}

export interface DatabaseHealth {
  overall: 'healthy' | 'warning' | 'error';
  checks: {
    connection: HealthCheckResult;
    courses: HealthCheckResult;
    enrollments: HealthCheckResult;
    indexes: HealthCheckResult;
  };
  statistics: {
    coursesCount: number;
    enrollmentsCount: number;
    activeEnrollmentsCount: number;
    publishedCoursesCount: number;
  };
}

export class DatabaseMaintenanceService {
  
  /**
   * Performs comprehensive database health check
   */
  static async performHealthCheck(): Promise<DatabaseHealth> {
    // console.log('🏥 Starting database health check...');
    
    const checks = {
      connection: await this.checkConnection(),
      courses: await this.checkCourses(),
      enrollments: await this.checkEnrollments(),
      indexes: await this.checkIndexes()
    };

    const statistics = await this.gatherStatistics();
    
    // Determine overall health
    const hasErrors = Object.values(checks).some(check => check.status === 'error');
    const hasWarnings = Object.values(checks).some(check => check.status === 'warning');
    
    const overall = hasErrors ? 'error' : hasWarnings ? 'warning' : 'healthy';
    
    const result: DatabaseHealth = {
      overall,
      checks,
      statistics
    };

    // console.log(`🏥 Health check completed - Status: ${overall.toUpperCase()}`);
    return result;
  }

  /**
   * Checks database connection status
   */
  private static async checkConnection(): Promise<HealthCheckResult> {
    try {
      if (mongoose.connection.readyState !== 1) {
        return {
          status: 'error',
          message: 'Database connection is not active',
          details: { readyState: mongoose.connection.readyState }
        };
      }

      // Test a simple query
      await mongoose.connection.db?.admin().ping();
      
      return {
        status: 'healthy',
        message: 'Database connection is active and responsive'
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Database connection check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Checks courses collection health
   */
  private static async checkCourses(): Promise<HealthCheckResult> {
    try {
      const coursesCount = await Course.countDocuments();
      const publishedCoursesCount = await Course.countDocuments({ status: 'Published' });

      if (coursesCount === 0) {
        return {
          status: 'error',
          message: 'No courses found in database',
          details: { coursesCount: 0 }
        };
      }

      if (publishedCoursesCount === 0) {
        return {
          status: 'warning',
          message: 'No published courses found',
          details: { coursesCount, publishedCoursesCount }
        };
      }

      return {
        status: 'healthy',
        message: `Courses collection is healthy`,
        details: { coursesCount, publishedCoursesCount }
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to check courses collection',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Checks enrollments collection health
   */
  private static async checkEnrollments(): Promise<HealthCheckResult> {
    try {
      const totalEnrollments = await CourseEnrollment.countDocuments();
      const activeEnrollments = await CourseEnrollment.countDocuments({ isActive: true });
      const orphanedEnrollments = await this.findOrphanedEnrollments();

      if (orphanedEnrollments.length > 0) {
        return {
          status: 'warning',
          message: `Found ${orphanedEnrollments.length} orphaned enrollments`,
          details: { totalEnrollments, activeEnrollments, orphanedCount: orphanedEnrollments.length }
        };
      }

      return {
        status: 'healthy',
        message: 'Enrollments collection is healthy',
        details: { totalEnrollments, activeEnrollments }
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to check enrollments collection',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Checks database indexes
   */
  private static async checkIndexes(): Promise<HealthCheckResult> {
    try {
      const db = mongoose.connection.db;
      if (!db) {
        return {
          status: 'error',
          message: 'Cannot access database for index check'
        };
      }

      const issues: string[] = [];

      // Check for problematic indexes
      try {
        const studentsCollection = db.collection('students');
        const indexes = await studentsCollection.listIndexes().toArray();
        
        const problematicIndex = indexes.find(idx => idx.name === 'phone_number_1');
        if (problematicIndex) {
          issues.push('Problematic phone_number_1 index exists');
        }
      } catch (error) {
        issues.push('Failed to check students collection indexes');
      }

      if (issues.length > 0) {
        return {
          status: 'warning',
          message: 'Index issues detected',
          details: { issues }
        };
      }

      return {
        status: 'healthy',
        message: 'Database indexes are healthy'
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to check database indexes',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Gathers database statistics
   */
  private static async gatherStatistics() {
    try {
      const coursesCount = await Course.countDocuments();
      const enrollmentsCount = await CourseEnrollment.countDocuments();
      const activeEnrollmentsCount = await CourseEnrollment.countDocuments({ isActive: true });
      const publishedCoursesCount = await Course.countDocuments({ status: 'Published' });

      return {
        coursesCount,
        enrollmentsCount,
        activeEnrollmentsCount,
        publishedCoursesCount
      };
    } catch (error) {
      console.error('Failed to gather statistics:', error);
      return {
        coursesCount: 0,
        enrollmentsCount: 0,
        activeEnrollmentsCount: 0,
        publishedCoursesCount: 0
      };
    }
  }

  /**
   * Finds enrollments that reference non-existent courses or students
   */
  private static async findOrphanedEnrollments(): Promise<any[]> {
    try {
      const orphaned = await CourseEnrollment.aggregate([
        {
          $lookup: {
            from: 'courses',
            localField: 'courseId',
            foreignField: '_id',
            as: 'course'
          }
        },
        {
          $lookup: {
            from: 'students',
            localField: 'studentId',
            foreignField: '_id',
            as: 'student'
          }
        },
        {
          $match: {
            $or: [
              { course: { $size: 0 } },
              { student: { $size: 0 } }
            ]
          }
        }
      ]);

      return orphaned;
    } catch (error) {
      console.error('Failed to find orphaned enrollments:', error);
      return [];
    }
  }

  /**
   * Performs automatic database maintenance tasks
   */
  static async performMaintenance(): Promise<void> {
    // console.log('🔧 Starting database maintenance...');
    
    try {
      await this.cleanOrphanedEnrollments();
      await this.fixProblematicIndexes();
      await this.updateDerivedFields();
      
      // console.log('✅ Database maintenance completed successfully');
    } catch (error) {
      console.error('❌ Database maintenance failed:', error);
      throw error;
    }
  }

  /**
   * Removes orphaned enrollments
   */
  private static async cleanOrphanedEnrollments(): Promise<void> {
    try {
      const orphaned = await this.findOrphanedEnrollments();
      
      if (orphaned.length > 0) {
        const orphanedIds = orphaned.map(o => o._id);
        await CourseEnrollment.deleteMany({ _id: { $in: orphanedIds } });
        console.log(`🧹 Cleaned ${orphaned.length} orphaned enrollments`);
      } else {
        console.log('🧹 No orphaned enrollments found');
      }
    } catch (error) {
      console.error('❌ Failed to clean orphaned enrollments:', error);
    }
  }

  /**
   * Fixes problematic database indexes
   */
  private static async fixProblematicIndexes(): Promise<void> {
    try {
      const db = mongoose.connection.db;
      if (!db) return;

      const studentsCollection = db.collection('students');
      
      try {
        await studentsCollection.dropIndex('phone_number_1');
        console.log('🔧 Dropped problematic phone_number_1 index');
      } catch (error) {
        console.log('🔧 No problematic indexes to fix');
      }
    } catch (error) {
      console.error('❌ Failed to fix problematic indexes:', error);
    }
  }

  /**
   * Updates any derived fields that might be out of sync
   */
  private static async updateDerivedFields(): Promise<void> {
    try {
      // Update last accessed dates for active enrollments without one
      const result = await CourseEnrollment.updateMany(
        { 
          isActive: true, 
          lastAccessedAt: { $exists: false } 
        },
        { 
          $set: { lastAccessedAt: new Date() } 
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`🔄 Updated ${result.modifiedCount} enrollment lastAccessedAt fields`);
      }
    } catch (error) {
      console.error('❌ Failed to update derived fields:', error);
    }
  }

  /**
   * Optimizes database performance
   */
  static async optimizeDatabase(): Promise<void> {
    console.log('⚡ Starting database optimization...');
    
    try {
      const db = mongoose.connection.db;
      if (!db) return;

      // Run database statistics update
      await db.command({ planCacheClear: 'courses' });
      await db.command({ planCacheClear: 'courseenrollments' });
      
      console.log('⚡ Database optimization completed');
    } catch (error) {
      console.error('❌ Database optimization failed:', error);
    }
  }

  /**
   * Creates a backup-ready export of critical data
   */
  static async exportCriticalData(): Promise<{
    courses: any[];
    enrollments: any[];
    timestamp: Date;
  }> {
    try {
      // console.log('📦 Exporting critical data...');
      
      const courses = await Course.find({ status: 'Published' });
      const enrollments = await CourseEnrollment.find({ isActive: true });
      
      const exportData = {
        courses,
        enrollments,
        timestamp: new Date()
      };

      // console.log(`📦 Exported ${courses.length} courses and ${enrollments.length} enrollments`);
      return exportData;
    } catch (error) {
      console.error('❌ Failed to export critical data:', error);
      throw error;
    }
  }
}