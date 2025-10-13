import mongoose from 'mongoose';
import Course from '../models/Course.model';
import CourseEnrollment from '../models/CourseEnrollment';

export class DatabaseSeeder {

  /**
   * Seeds the database with essential data for development and production
   */
  static async seedDatabase(): Promise<void> {
    try {
      console.log('🌱 Starting database seeding...');

      // Database seeding completed - courses are now created through admin panel
      console.log('✅ Database seeding completed successfully');
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }

  /**
   * Creates a default enrollment for testing purposes
   */
  static async createDefaultEnrollment(studentId: string): Promise<void> {
    try {
      const featuredCourse = await Course.findOne({ isFeatured: true });
      if (!featuredCourse) {
        console.log('⚠️ No featured course found for enrollment');
        return;
      }

      const existingEnrollment = await CourseEnrollment.findOne({
        studentId: new mongoose.Types.ObjectId(studentId),
        courseId: featuredCourse._id
      });

      if (!existingEnrollment) {
        const enrollment = new CourseEnrollment({
          courseId: featuredCourse._id,
          studentId: new mongoose.Types.ObjectId(studentId),
          enrolledAt: new Date(),
          progress: 0,
          isActive: true
        });

        await enrollment.save();
        console.log(`✅ Default enrollment created for student: ${studentId}`);
      }
    } catch (error) {
      console.error('❌ Failed to create default enrollment:', error);
      throw error;
    }
  }

  /**
   * Fixes common database index issues
   */
  static async performMaintenanceTasks(): Promise<void> {
    try {
      console.log('🔧 Performing database maintenance...');
      
      // Fix phone number index issue if it exists
      const db = mongoose.connection.db;
      if (db) {
        try {
          const studentsCollection = db.collection('students');
          await studentsCollection.dropIndex('phone_number_1');
          console.log('✅ Dropped problematic phone_number index');
        } catch (error) {
          // Index might not exist, which is fine
          console.log('ℹ️ Phone number index maintenance skipped (already clean)');
        }
      }

      console.log('✅ Database maintenance completed');
    } catch (error) {
      console.error('❌ Database maintenance failed:', error);
      // Don't throw here as this is maintenance, not critical
    }
  }

  /**
   * Validates database integrity and reports statistics
   */
  static async validateDatabase(): Promise<void> {
    try {
      console.log('🔍 Validating database integrity...');
      
      const coursesCount = await Course.countDocuments();
      const featuredCoursesCount = await Course.countDocuments({ isFeatured: true });
      const enrollmentsCount = await CourseEnrollment.countDocuments();
      const activeEnrollmentsCount = await CourseEnrollment.countDocuments({ isActive: true });

      console.log('📊 Database Statistics:');
      console.log(`   - Total Courses: ${coursesCount}`);
      console.log(`   - Featured Courses: ${featuredCoursesCount}`);
      console.log(`   - Total Enrollments: ${enrollmentsCount}`);
      console.log(`   - Active Enrollments: ${activeEnrollmentsCount}`);

      if (featuredCoursesCount === 0) {
        console.log('⚠️ Warning: No featured courses found!');
      }

      console.log('✅ Database validation completed');
    } catch (error) {
      console.error('❌ Database validation failed:', error);
      throw error;
    }
  }
}