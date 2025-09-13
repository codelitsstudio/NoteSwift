import mongoose from 'mongoose';
import Course from '../models/Course.model';
import CourseEnrollment from '../models/CourseEnrollment';

export interface EnrollmentOptions {
  courseId: string;
  studentId: string;
  progress?: number;
  isActive?: boolean;
}

export interface EnrollmentStats {
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  averageProgress: number;
}

export class EnrollmentService {
  
  /**
   * Enrolls a student in a course
   */
  static async enrollStudent(options: EnrollmentOptions): Promise<any> {
    try {
      const { courseId, studentId, progress = 0, isActive = true } = options;

      // Validate course exists
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error(`Course not found with ID: ${courseId}`);
      }

      // Check if already enrolled
      const existingEnrollment = await CourseEnrollment.findOne({
        courseId: new mongoose.Types.ObjectId(courseId),
        studentId: new mongoose.Types.ObjectId(studentId)
      });

      if (existingEnrollment) {
        if (existingEnrollment.isActive) {
          throw new Error('Student is already enrolled in this course');
        } else {
          // Reactivate existing enrollment
          existingEnrollment.isActive = true;
          existingEnrollment.enrolledAt = new Date();
          existingEnrollment.progress = progress;
          await existingEnrollment.save();
          
          console.log(`✅ Reactivated enrollment for student ${studentId} in course "${course.title}"`);
          return existingEnrollment;
        }
      }

      // Create new enrollment
      const enrollment = new CourseEnrollment({
        courseId: new mongoose.Types.ObjectId(courseId),
        studentId: new mongoose.Types.ObjectId(studentId),
        enrolledAt: new Date(),
        progress,
        isActive
      });

      await enrollment.save();
      console.log(`✅ Successfully enrolled student ${studentId} in course "${course.title}"`);
      
      return enrollment;
    } catch (error) {
      console.error('❌ Enrollment failed:', error);
      throw error;
    }
  }

  /**
   * Unenrolls a student from a course
   */
  static async unenrollStudent(courseId: string, studentId: string): Promise<void> {
    try {
      const enrollment = await CourseEnrollment.findOne({
        courseId: new mongoose.Types.ObjectId(courseId),
        studentId: new mongoose.Types.ObjectId(studentId)
      });

      if (!enrollment) {
        throw new Error('Enrollment not found');
      }

      enrollment.isActive = false;
      await enrollment.save();
      
      console.log(`✅ Successfully unenrolled student ${studentId} from course ${courseId}`);
    } catch (error) {
      console.error('❌ Unenrollment failed:', error);
      throw error;
    }
  }

  /**
   * Checks if a student is enrolled in a course
   */
  static async isStudentEnrolled(courseId: string, studentId: string): Promise<boolean> {
    try {
      const enrollment = await CourseEnrollment.findOne({
        courseId: new mongoose.Types.ObjectId(courseId),
        studentId: new mongoose.Types.ObjectId(studentId),
        isActive: true
      });

      return !!enrollment;
    } catch (error) {
      console.error('❌ Failed to check enrollment status:', error);
      return false;
    }
  }

  /**
   * Gets all active enrollments for a student
   */
  static async getStudentEnrollments(studentId: string): Promise<any[]> {
    try {
      const enrollments = await CourseEnrollment.find({
        studentId: new mongoose.Types.ObjectId(studentId),
        isActive: true
      }).populate('courseId', 'title description thumbnail teacherName level category');

      return enrollments;
    } catch (error) {
      console.error('❌ Failed to get student enrollments:', error);
      throw error;
    }
  }

  /**
   * Gets all enrollments for a course
   */
  static async getCourseEnrollments(courseId: string): Promise<any[]> {
    try {
      const enrollments = await CourseEnrollment.find({
        courseId: new mongoose.Types.ObjectId(courseId),
        isActive: true
      }).populate('studentId', 'full_name grade phone_number');

      return enrollments;
    } catch (error) {
      console.error('❌ Failed to get course enrollments:', error);
      throw error;
    }
  }

  /**
   * Updates enrollment progress
   */
  static async updateProgress(courseId: string, studentId: string, progress: number): Promise<any> {
    try {
      if (progress < 0 || progress > 100) {
        throw new Error('Progress must be between 0 and 100');
      }

      const enrollment = await CourseEnrollment.findOne({
        courseId: new mongoose.Types.ObjectId(courseId),
        studentId: new mongoose.Types.ObjectId(studentId),
        isActive: true
      });

      if (!enrollment) {
        throw new Error('Active enrollment not found');
      }

      enrollment.progress = progress;
      enrollment.lastAccessedAt = new Date();

      // Mark as completed if progress is 100%
      if (progress === 100 && !enrollment.completedAt) {
        enrollment.completedAt = new Date();
      }

      await enrollment.save();
      
      console.log(`✅ Updated progress to ${progress}% for student ${studentId} in course ${courseId}`);
      return enrollment;
    } catch (error) {
      console.error('❌ Failed to update progress:', error);
      throw error;
    }
  }

  /**
   * Gets enrollment statistics for a course
   */
  static async getCourseStats(courseId: string): Promise<EnrollmentStats> {
    try {
      const enrollments = await CourseEnrollment.find({
        courseId: new mongoose.Types.ObjectId(courseId)
      });

      const activeEnrollments = enrollments.filter(e => e.isActive);
      const completedEnrollments = enrollments.filter(e => e.completedAt);
      
      const totalProgress = activeEnrollments.reduce((sum, e) => sum + e.progress, 0);
      const averageProgress = activeEnrollments.length > 0 ? totalProgress / activeEnrollments.length : 0;

      return {
        totalEnrollments: enrollments.length,
        activeEnrollments: activeEnrollments.length,
        completedEnrollments: completedEnrollments.length,
        averageProgress: Math.round(averageProgress * 100) / 100
      };
    } catch (error) {
      console.error('❌ Failed to get course stats:', error);
      throw error;
    }
  }

  /**
   * Auto-enrolls new students in featured courses (for onboarding)
   */
  static async autoEnrollInFeaturedCourses(studentId: string): Promise<void> {
    try {
      // Since the new schema doesn't have isFeatured, we'll just get the first course or specific courses
      const featuredCourses = await Course.find({ status: 'Published' }).limit(2);
      
      for (const course of featuredCourses) {
        const isEnrolled = await this.isStudentEnrolled(course._id.toString(), studentId);
        
        if (!isEnrolled) {
          await this.enrollStudent({
            courseId: course._id.toString(),
            studentId,
            progress: 0,
            isActive: true
          });
        }
      }
      
      console.log(`✅ Auto-enrolled student ${studentId} in ${featuredCourses.length} featured courses`);
    } catch (error) {
      console.error('❌ Auto-enrollment in featured courses failed:', error);
      // Don't throw here as this is a convenience feature
    }
  }

  /**
   * Bulk enrollment utility for admin operations
   */
  static async bulkEnrollStudents(courseId: string, studentIds: string[]): Promise<{
    successful: string[];
    failed: Array<{ studentId: string; error: string }>;
  }> {
    const successful: string[] = [];
    const failed: Array<{ studentId: string; error: string }> = [];

    for (const studentId of studentIds) {
      try {
        await this.enrollStudent({ courseId, studentId });
        successful.push(studentId);
      } catch (error) {
        failed.push({
          studentId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log(`✅ Bulk enrollment completed: ${successful.length} successful, ${failed.length} failed`);
    
    return { successful, failed };
  }

  /**
   * Gets enrollment analytics for dashboard
   */
  static async getEnrollmentAnalytics(): Promise<{
    totalEnrollments: number;
    enrollmentsThisMonth: number;
    topCourses: Array<{ courseTitle: string; enrollmentCount: number }>;
    recentEnrollments: any[];
  }> {
    try {
      const totalEnrollments = await CourseEnrollment.countDocuments({ isActive: true });
      
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      
      const enrollmentsThisMonth = await CourseEnrollment.countDocuments({
        isActive: true,
        enrolledAt: { $gte: thisMonth }
      });

      // Top courses by enrollment count
      const topCoursesData = await CourseEnrollment.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$courseId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'courses',
            localField: '_id',
            foreignField: '_id',
            as: 'course'
          }
        },
        { $unwind: '$course' },
        {
          $project: {
            courseTitle: '$course.title',
            enrollmentCount: '$count'
          }
        }
      ]);

      // Recent enrollments
      const recentEnrollments = await CourseEnrollment.find({ isActive: true })
        .sort({ enrolledAt: -1 })
        .limit(10)
        .populate('courseId', 'title')
        .populate('studentId', 'full_name');

      return {
        totalEnrollments,
        enrollmentsThisMonth,
        topCourses: topCoursesData,
        recentEnrollments
      };
    } catch (error) {
      console.error('❌ Failed to get enrollment analytics:', error);
      throw error;
    }
  }
}