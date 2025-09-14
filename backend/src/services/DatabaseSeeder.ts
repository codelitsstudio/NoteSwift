import mongoose from 'mongoose';
import Course from '../models/Course.model';
import CourseEnrollment from '../models/CourseEnrollment';

export interface CourseData {
  title: string;
  description: string;
  subject: string;
  tags: string[];
  status: string;
}

export class DatabaseSeeder {
  
  /**
   * Seeds the database with essential data for development and production
   */
  static async seedDatabase(): Promise<void> {
    try {
      console.log('🌱 Starting database seeding...');
      
      await this.seedCourses();
      
      console.log('✅ Database seeding completed successfully');
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }

  /**
   * Creates default courses if they don't exist
   */
  private static async seedCourses(): Promise<void> {
    try {
      const featuredCourseExists = await Course.findOne({ title: 'Learn How To Actually Study Before It\'s Too Late' });
      
      const featuredCourseData: CourseData = {
        title: 'Learn How To Actually Study Before It\'s Too Late',
        description: 'Free, professional learning program for building effective study habits, improving knowledge retention, and mastering time management.',
        subject: 'Study Skills',
        tags: ['study', 'learning', 'productivity', 'habits', 'success'],
        status: 'Published'
      };

      if (!featuredCourseExists) {
        console.log('📚 Creating featured course...');
        
        const featuredCourse = new Course(featuredCourseData);
        await featuredCourse.save();
        
        console.log(`✅ Featured course created: "${featuredCourse.title}"`);
      } else {
        // Update existing course with new description
        console.log('📚 Updating featured course description...');
        await Course.findOneAndUpdate(
          { title: 'Learn How To Actually Study Before It\'s Too Late' },
          { description: featuredCourseData.description },
          { new: true }
        );
        console.log('✅ Featured course description updated');
      }

      // Create additional sample courses for variety
      // await this.createSampleCourses();
      
    } catch (error) {
      console.error('❌ Failed to seed courses:', error);
      throw error;
    }
  }

  /**
   * Creates additional sample courses for a richer experience
  //  */
  // private static async createSampleCourses(): Promise<void> {
  //   const sampleCourses: CourseData[] = [
  //     {
  //       title: 'Mathematics Fundamentals for Grade 10',
  //       description: 'Complete mathematics course covering algebra, geometry, and trigonometry for Grade 10 students.',
  //       subject: 'Mathematics',
  //       tags: ['math', 'algebra', 'geometry', 'grade10'],
  //       status: 'Published'
  //     },
  //     {
  //       title: 'English Literature for Grade 11',
  //       description: 'Explore classic and modern literature with comprehensive analysis and writing skills.',
  //       subject: 'English',
  //       tags: ['english', 'literature', 'writing', 'grade11'],
  //       status: 'Published'
  //     }
  //   ];

  //   for (const courseData of sampleCourses) {
  //     const existingCourse = await Course.findOne({ title: courseData.title });
  //     if (!existingCourse) {
  //       const course = new Course(courseData);
  //       await course.save();
  //       console.log(`✅ Sample course created: "${course.title}"`);
  //     }
  //   }
  // }

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