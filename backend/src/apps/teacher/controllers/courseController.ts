// backend/controllers/courseController.ts
import { Request, Response } from "express";
import Course from "../models/Course.model";
import CourseEnrollment from "../models/CourseEnrollment";
import HomepageSettings from "@core/models/HomepageSettings";
import mongoose, { Types } from "mongoose";
import auditLogger from '@core/lib/audit-logger';

// Extend Express Request to include user injected by auth middleware
interface AuthRequest extends Request {
  user?: {
    id: string;
    role?: string;
  };
}

// Get lesson progress for a user in a course (chapter)
export const getLessonProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const studentId = req.user?.id;
    if (!courseId || !studentId) {
      res.status(400).json({ success: false, message: "Course ID and authentication required" });
      return;
    }
    const enrollment = await CourseEnrollment.findOne({ courseId, studentId });
    if (!enrollment) {
      res.status(404).json({ success: false, message: "Enrollment not found" });
      return;
    }
    res.json({
      success: true,
      data: {
        progress: enrollment.progress,
        completedLessons: enrollment.completedLessons,
        lastAccessedAt: enrollment.lastAccessedAt,
        moduleProgress: enrollment.moduleProgress,
        overallProgress: enrollment.progress
      },
    });
  } catch (error) {
    console.error("Error fetching lesson progress:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Update lesson progress (mark lesson as started/completed)
export const updateLessonProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { lessonId, completed } = req.body;
    const studentId = req.user?.id;
    if (!courseId || !lessonId || !studentId) {
      res.status(400).json({ success: false, message: "Course ID, lesson ID, and authentication required" });
      return;
    }
    const enrollment = await CourseEnrollment.findOne({ courseId, studentId });
    if (!enrollment) {
      res.status(404).json({ success: false, message: "Enrollment not found" });
      return;
    }
    // Check if lesson already in completedLessons
    const alreadyCompleted = enrollment.completedLessons.some((l: any) => l.lessonId.toString() === lessonId);
    if (!alreadyCompleted) {
      enrollment.completedLessons.push({ lessonId, completedAt: new Date() });
    }
    // Optionally, allow marking as incomplete (remove from completedLessons)
    if (completed === false) {
      enrollment.completedLessons = enrollment.completedLessons.filter((l: any) => l.lessonId.toString() !== lessonId);
    }
    // Progress is always backend-calculated via moduleProgress
    enrollment.lastAccessedAt = new Date();
    await enrollment.save();
    res.json({
      success: true,
      data: {
        progress: enrollment.progress,
        completedLessons: enrollment.completedLessons,
        moduleProgress: enrollment.moduleProgress,
        overallProgress: enrollment.progress
      },
      message: "Lesson progress updated successfully",
    });
  } catch (error) {
    console.error("Error updating lesson progress:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Update module progress (video or notes completion)
export const updateModuleProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
  const { moduleNumber, videoCompleted, sectionIndex } = req.body;
    const studentId = req.user?.id;

    if (!courseId || !studentId || moduleNumber === undefined) {
      res.status(400).json({ 
        success: false, 
        message: "Course ID, student ID, and module number are required" 
      });
      return;
    }

    if (moduleNumber < 1 || moduleNumber > 5) {
      res.status(400).json({ 
        success: false, 
        message: "Module number must be between 1 and 5" 
      });
      return;
    }

    const enrollment = await CourseEnrollment.findOne({ courseId, studentId });
    if (!enrollment) {
      res.status(404).json({ success: false, message: "Enrollment not found" });
      return;
    }

    // Update module progress using backend logic only
    await enrollment.updateModuleProgress(moduleNumber, videoCompleted, sectionIndex);
    console.log(`Updated module ${moduleNumber} progress.`);
    console.log('Enrollment moduleProgress after update:', enrollment.moduleProgress);

    res.json({
      success: true,
      data: {
        progress: enrollment.progress,
        moduleProgress: enrollment.moduleProgress,
        overallProgress: enrollment.progress
      },
      message: "Module progress updated successfully",
    });
  } catch (error) {
    console.error("Error updating module progress:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get homepage featured courses
export const getHomepageFeaturedCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const courses = await Course.find({
      status: 'Published',
      isFeatured: true
    })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        courses
      },
      message: "Homepage featured courses retrieved successfully"
    });
  } catch (error) {
    console.error('Error fetching homepage featured courses:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch homepage featured courses"
    });
  }
};

// Get personalized recommendations for a student
export const getPersonalizedRecommendations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;

    if (!studentId) {
      res.status(401).json({
        success: false,
        message: "Authentication required"
      });
      return;
    }

    // Get homepage settings to see which featured courses are selected for display
    const homepageSettings = await HomepageSettings.findOne();
    const selectedFeaturedCourses = homepageSettings?.selectedFeaturedCourses || [];

    // Get featured courses that are selected for homepage display
    let recommendations = await Course.find({
      _id: { $in: selectedFeaturedCourses },
      type: 'featured',
      status: 'Published'
    })
      .sort({ createdAt: -1 })
      .limit(5);

    // If no selected featured courses, fall back to any featured courses
    if (recommendations.length === 0) {
      recommendations = await Course.find({
        type: 'featured',
        status: 'Published'
      })
        .sort({ createdAt: -1 })
        .limit(5);
    }

    // If still no featured courses, fall back to any published courses
    if (recommendations.length === 0) {
      recommendations = await Course.find({
        status: 'Published'
      })
        .sort({ createdAt: -1 })
        .limit(5);
    }

    // Add recommendation metadata
    const recommendationsWithData = recommendations.map(course => ({
      ...course.toObject(),
      recommendationData: {
        targetGrades: ['10', '11', '12'], // Default grades
        targetAudience: 'Students',
        difficultyLevel: 'Intermediate',
        recommendedFor: ['Grade 10 Students', 'Exam Preparation'],
        confidence: 0.85
      }
    }));

    res.json({
      success: true,
      data: {
        recommendations: recommendationsWithData
      },
      message: "Personalized recommendations retrieved successfully"
    });
  } catch (error) {
    console.error('Error fetching personalized recommendations:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch personalized recommendations"
    });
  }
};
// Get featured course
export const getFeaturedCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    // Only return the real featured course by title
    const featuredCourse = await Course.findOne({
      title: 'Learn How To Actually Study Before It\'s Too Late',
      status: 'Published'
    });

    if (!featuredCourse) {
      res.status(404).json({
        success: false,
        message: "No featured course found",
      });
      return;
    }

    console.log('📤 Returning featured course:', featuredCourse.title);
    res.json({
      success: true,
      data: featuredCourse,
      message: "Featured course retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching featured course:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Enroll in course
export const enrollInCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.body as { courseId?: string };
    const studentId = req.user?.id;

    if (!courseId) {
      res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
      return;
    }

    if (!studentId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!Types.ObjectId.isValid(courseId)) {
      res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({
        success: false,
        message: "Course not found",
      });
      return;
    }

    const existingEnrollment = await CourseEnrollment.findOne({
      courseId,
      studentId,
    });

    if (existingEnrollment) {
      res.status(400).json({
        success: false,
        message: "Already enrolled in this course",
      });
      return;
    }

    const enrollment = new CourseEnrollment({
      courseId,
      studentId,
      enrolledAt: new Date(),
      progress: 0,
      isActive: true,
    });

    await enrollment.save();

    res.status(201).json({
      success: true,
      data: enrollment,
      message: "Successfully enrolled in course",
    });
  } catch (error) {
    console.error("Error enrolling in course:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get user enrollments
export const getUserEnrollments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user?.id;

    if (userId !== requestingUserId) {
      res.status(403).json({
        success: false,
        message: "Access denied",
      });
      return;
    }

    const enrollments = await CourseEnrollment.find({
      studentId: userId,
      isActive: true,
    }).populate("courseId", "title description subjects tags");

    res.json({
      success: true,
      data: enrollments,
      message: "Enrollments retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching user enrollments:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all courses (optional - for admin or course listing)
export const getAllCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;

    const courses = await Course.find({ status: 'Published' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Course.countDocuments({ status: 'Published' });

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      message: "Courses retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Admin course management functions
export const createCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const courseData = req.body;

    // Set isFeatured based on type
    if (courseData.type === 'featured') {
      courseData.isFeatured = true;
    }

    const course = new Course(courseData);
    await course.save();

    // Log course creation
    await auditLogger.logCourseCreated(
      'system', // Admin action via API
      'admin',
      'Admin',
      course._id.toString(),
      course.title,
      undefined,
      {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        courseType: course.type,
        category: course.category
      }
    );

    res.status(201).json({
      success: true,
      data: { course },
      message: "Course created successfully",
    });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Set isFeatured based on type
    if (updateData.type === 'featured') {
      updateData.isFeatured = true;
    }

    const course = await Course.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    if (!course) {
      res.status(404).json({
        success: false,
        message: "Course not found",
      });
      return;
    }

    // Log course update
    await auditLogger.logCourseUpdated(
      'system', // Admin action via API
      'admin',
      'Admin',
      course._id.toString(),
      course.title,
      updateData,
      undefined,
      {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      }
    );

    res.json({
      success: true,
      data: { course },
      message: "Course updated successfully",
    });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const course = await Course.findByIdAndDelete(id);

    if (!course) {
      res.status(404).json({
        success: false,
        message: "Course not found",
      });
      return;
    }

    // Log course deletion
    await auditLogger.logCourseDeleted(
      'system', // Admin action via API
      'admin',
      'Admin',
      course._id.toString(),
      course.title,
      undefined,
      {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      }
    );

    res.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getCourseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);

    if (!course) {
      res.status(404).json({
        success: false,
        message: "Course not found",
      });
      return;
    }

    res.json({
      success: true,
      data: { course },
      message: "Course retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAllCoursesAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const courses = await Course.find({})
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { courses },
      message: "Courses retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get homepage settings for admin
export const getHomepageSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    let settings = await HomepageSettings.findOne();
    if (!settings) {
      // Create default settings if none exist
      settings = await HomepageSettings.create({
        selectedFeaturedCourses: []
      });
    }
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error("Error fetching homepage settings:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Update homepage settings
export const updateHomepageSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { selectedFeaturedCourses } = req.body;

    if (!Array.isArray(selectedFeaturedCourses)) {
      res.status(400).json({
        success: false,
        message: "selectedFeaturedCourses must be an array"
      });
      return;
    }

    let settings = await HomepageSettings.findOne();
    if (!settings) {
      settings = await HomepageSettings.create({
        selectedFeaturedCourses: selectedFeaturedCourses || []
      });
    } else {
      settings.selectedFeaturedCourses = selectedFeaturedCourses || [];
      await settings.save();
    }

    res.json({
      success: true,
      data: settings,
      message: "Homepage settings updated successfully"
    });
  } catch (error) {
    console.error("Error updating homepage settings:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get upcoming courses for student homepage
export const getHomepageUpcomingCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get draft courses that are marked as upcoming (have 'upcoming' tag)
    let courses = await Course.find({
      status: 'Draft',
      tags: { $in: ['upcoming'] }
    })
      .sort({ createdAt: -1 })
      .limit(10);

    // If no courses with upcoming tag, fall back to any draft courses
    if (courses.length === 0) {
      courses = await Course.find({
        status: 'Draft'
      })
        .sort({ createdAt: -1 })
        .limit(10);
    }

    // If no draft courses at all, return empty array (don't show published courses)
    res.json({
      success: true,
      data: {
        courses
      },
      message: "Homepage upcoming courses retrieved successfully"
    });
  } catch (error) {
    console.error('Error fetching homepage upcoming courses:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch homepage upcoming courses"
    });
  }
};

// Get recommendation stats for admin dashboard
export const getRecommendationStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalCourses = await Course.countDocuments();
    const analyzedCourses = await Course.countDocuments({
      'recommendationData.lastAnalyzed': { $exists: true }
    });

    // Get grade distribution from analyzed courses
    const gradeDistribution = await Course.aggregate([
      { $match: { 'recommendationData.lastAnalyzed': { $exists: true } } },
      { $unwind: '$recommendationData.targetGrades' },
      { $group: { _id: '$recommendationData.targetGrades', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      result: {
        stats: {
          totalCourses,
          analyzedCourses,
          gradeDistribution: gradeDistribution.map(item => [item._id, item.count])
        }
      }
    });
  } catch (error) {
    console.error("Error fetching recommendation stats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Analyze a single course for recommendations
export const analyzeCourseForRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, mode = 'auto' } = req.body;

    if (!courseId) {
      res.status(400).json({
        success: false,
        message: "Course ID is required"
      });
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({
        success: false,
        message: "Course not found"
      });
      return;
    }

    // Simulate AI analysis (in real implementation, this would call an AI service)
    const mockAnalysis = {
      targetGrades: generateTargetGrades(course.program),
      targetAudience: generateTargetAudience(course.program),
      difficultyLevel: generateDifficultyLevel(course.program),
      recommendedFor: generateRecommendedFor(course.program),
      confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0 confidence
      lastAnalyzed: new Date()
    };

    await Course.findByIdAndUpdate(courseId, {
      recommendationData: mockAnalysis
    });

    res.json({
      success: true,
      message: "Course analyzed successfully",
      data: mockAnalysis
    });
  } catch (error) {
    console.error("Error analyzing course:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Analyze all courses for recommendations
export const analyzeAllCoursesForRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const courses = await Course.find({});

    // Analyze courses in batches to avoid overwhelming the system
    const batchSize = 5;
    const results = [];

    for (let i = 0; i < courses.length; i += batchSize) {
      const batch = courses.slice(i, i + batchSize);
      const batchPromises = batch.map(async (course) => {
        try {
          const mockAnalysis = {
            targetGrades: generateTargetGrades(course.program),
            targetAudience: generateTargetAudience(course.program),
            difficultyLevel: generateDifficultyLevel(course.program),
            recommendedFor: generateRecommendedFor(course.program),
            confidence: Math.random() * 0.3 + 0.7,
            lastAnalyzed: new Date()
          };

          await Course.findByIdAndUpdate(course._id, {
            recommendationData: mockAnalysis
          });

          return { courseId: course._id, success: true };
        } catch (error) {
          console.error(`Error analyzing course ${course._id}:`, error);
          return { courseId: course._id, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Small delay between batches
      if (i + batchSize < courses.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    const successCount = results.filter(r => r.success).length;

    res.json({
      success: true,
      message: `Analyzed ${successCount} out of ${courses.length} courses`,
      data: {
        totalCourses: courses.length,
        analyzedCourses: successCount,
        results
      }
    });
  } catch (error) {
    console.error("Error analyzing all courses:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Helper functions for mock AI analysis
function generateTargetGrades(program: string): string[] {
  const gradeMap: { [key: string]: string[] } = {
    'Primary': ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'],
    'Secondary': ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'],
    'Higher Secondary': ['Grade 11', 'Grade 12'],
    'College': ['Undergraduate', 'Graduate']
  };

  return gradeMap[program] || ['Grade 1', 'Grade 2', 'Grade 3'];
}

function generateTargetAudience(program: string): string {
  const audienceMap: { [key: string]: string } = {
    'Primary': 'Young learners building foundational skills',
    'Secondary': 'Adolescent students developing critical thinking',
    'Higher Secondary': 'Pre-university students preparing for higher education',
    'College': 'University students and professionals'
  };

  return audienceMap[program] || 'General learners';
}

function generateDifficultyLevel(program: string): string {
  const levels = ['Beginner', 'Intermediate', 'Advanced'];
  const programIndex = ['Primary', 'Secondary', 'Higher Secondary', 'College'].indexOf(program);
  return levels[Math.min(programIndex, levels.length - 1)];
}

function generateRecommendedFor(program: string): string[] {
  const recommendations = [
    'Students struggling with the subject',
    'Students looking to excel',
    'Parents wanting to support their children',
    'Teachers seeking additional resources'
  ];

  return recommendations.slice(0, Math.floor(Math.random() * 3) + 2);
}

// Check for course changes since last analysis
export const checkCourseChanges = async (req: Request, res: Response): Promise<void> => {
  try {
    const { since } = req.query;

    let query: any = {};

    if (since) {
      // Check for courses updated since the given timestamp
      query.updatedAt = { $gt: new Date(since as string) };
    }

    // Get courses that have been modified or are new (no recommendation data)
    const modifiedCourses = await Course.find({
      ...query,
      $or: [
        { recommendationData: { $exists: false } },
        { updatedAt: { $gt: new Date(since as string || '2020-01-01') } }
      ]
    }).select('_id title status program updatedAt');

    // Also check for courses that exist but don't have recommendation data
    const unanalyzedCourses = await Course.find({
      recommendationData: { $exists: false }
    }).select('_id title status program updatedAt');

    const allChangedCourses = [...modifiedCourses, ...unanalyzedCourses.filter(course =>
      !modifiedCourses.some(modified => modified._id.toString() === course._id.toString())
    )];

    res.json({
      success: true,
      data: {
        changedCourses: allChangedCourses,
        hasChanges: allChangedCourses.length > 0,
        totalChanged: allChangedCourses.length
      }
    });
  } catch (error) {
    console.error("Error checking course changes:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get module progress for a specific course and module
export const getModuleProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId, moduleNumber } = req.params;
    const studentId = req.user?.id;

    if (!courseId || !studentId || moduleNumber === undefined) {
      res.status(400).json({
        success: false,
        message: "Course ID, student ID, and module number are required"
      });
      return;
    }

    const enrollment = await CourseEnrollment.findOne({ courseId, studentId });
    if (!enrollment) {
      res.status(404).json({ success: false, message: "Enrollment not found" });
      return;
    }

    const moduleNum = parseInt(moduleNumber);
    if (moduleNum < 1 || moduleNum > 5) {
      res.status(400).json({
        success: false,
        message: "Module number must be between 1 and 5"
      });
      return;
    }

    const moduleProgress = enrollment.moduleProgress?.[moduleNum - 1] || {
      videosCompleted: 0,
      notesCompleted: 0,
      quizCompleted: false,
      completed: false
    };

    res.json({
      success: true,
      data: {
        moduleProgress,
        overallProgress: enrollment.progress
      },
      message: "Module progress retrieved successfully"
    });
  } catch (error) {
    console.error('Error fetching module progress:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch module progress"
    });
  }
};

// ========================================
// TEACHER-SPECIFIC COURSE MANAGEMENT
// ========================================

import SubjectContent from "../models/SubjectContent.model";
import Teacher from "../models/Teacher.model";
import Assignment from "../models/Assignment.model";
import Test from "../models/Test.model";
import Resource from "../models/Resource.model";

// Get teacher's assigned subject content
export const getTeacherSubjectContent = async (req: Request, res: Response) => {
  try {
    const { teacherEmail } = req.query;

    if (!teacherEmail) {
      return res.status(400).json({ success: false, message: 'Teacher email is required' });
    }

    // Get teacher's assigned courses
    const teacher = await Teacher.findOne({ email: teacherEmail, isActive: true });
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    if (!teacher.assignedCourses || teacher.assignedCourses.length === 0) {
      return res.status(200).json({ success: true, message: 'No courses assigned', data: { 
        subjectContent: null,
        course: null,
        stats: {
          totalModules: 0,
          completedModules: 0,
          totalContent: 0,
          videosUploaded: 0,
          notesUploaded: 0,
          testsCreated: 0,
          liveClassesScheduled: 0
        }
      }});
    }

    // Get the first assigned course (teachers typically have one subject)
    const assignedCourse = teacher.assignedCourses[0];
    
    // Get course details
    const course = await Course.findById(assignedCourse.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Assigned course not found' });
    }

    // Get or create subject content
    let subjectContent = await SubjectContent.findOne({
      teacherId: teacher._id,
      courseId: assignedCourse.courseId,
      subjectName: assignedCourse.subject,
      isActive: true
    });

    // If no subject content exists, create initial structure from course
    if (!subjectContent) {
      const subject = course.subjects?.find((s: any) => s.name === assignedCourse.subject);
      
      if (subject && subject.modules) {
        subjectContent = await SubjectContent.create({
          courseId: assignedCourse.courseId,
          courseName: course.title,
          subjectName: assignedCourse.subject,
          teacherId: teacher._id,
          teacherName: teacher.fullName || `${teacher.firstName} ${teacher.lastName}`,
          teacherEmail: teacher.email,
          modules: subject.modules.map((mod: any, idx: number) => ({
            moduleNumber: idx + 1,
            moduleName: mod.name,
            description: mod.description || '',
            hasVideo: false,
            hasNotes: false,
            hasLiveClass: false,
            hasTest: false,
            hasQuestions: false,
            order: idx + 1,
            isActive: true
          })),
          description: subject.description,
          isActive: true
        });
      } else {
        // Create empty structure
        subjectContent = await SubjectContent.create({
          courseId: assignedCourse.courseId,
          courseName: course.title,
          subjectName: assignedCourse.subject,
          teacherId: teacher._id,
          teacherName: teacher.fullName || `${teacher.firstName} ${teacher.lastName}`,
          teacherEmail: teacher.email,
          modules: [],
          isActive: true
        });
      }
    }

    // Calculate stats
    const stats = {
      totalModules: subjectContent.modules.length,
      completedModules: subjectContent.modules.filter(m => 
        m.hasVideo && m.hasNotes
      ).length,
      totalContent: subjectContent.modules.reduce((acc, m) => 
        acc + (m.hasVideo ? 1 : 0) + (m.hasNotes ? 1 : 0) + (m.testIds?.length || 0), 0
      ),
      videosUploaded: subjectContent.modules.filter(m => m.hasVideo).length,
      notesUploaded: subjectContent.modules.filter(m => m.hasNotes).length,
      testsCreated: subjectContent.modules.reduce((acc, m) => acc + (m.testIds?.length || 0), 0),
      liveClassesScheduled: subjectContent.modules.reduce((acc, m) => 
        acc + (m.liveClassSchedule?.length || 0), 0
      )
    };

    return res.status(200).json({
      success: true,
      message: 'Subject content retrieved successfully',
      data: {
        subjectContent,
        course: {
          _id: course._id,
          title: course.title,
          description: course.description,
          subjectName: assignedCourse.subject,
          program: course.program
        },
        stats
      }
    });

  } catch (error: any) {
    console.error('Get teacher subject content error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve subject content' });
  }
};

// Get teacher's all assigned subject content
export const getAllTeacherSubjectContent = async (req: Request, res: Response) => {
  try {
    const teacher = (req as any).teacher;
    
    if (!teacher) {
      console.log('🎯 ALL-SUBJECT-CONTENT: No teacher in req.teacher');
      return res.status(401).json({ success: false, message: 'Teacher not authenticated' });
    }

    console.log('🎯 ALL-SUBJECT-CONTENT: Teacher found:', teacher._id, teacher.email);
    console.log('🎯 ALL-SUBJECT-CONTENT: Teacher assignedCourses:', teacher.assignedCourses);
    console.log('🎯 ALL-SUBJECT-CONTENT: Full teacher object:', JSON.stringify(teacher, null, 2));

    // Get teacher's assigned courses
    const assignedCourses = teacher.assignedCourses || [];
    console.log('🎯 ALL-SUBJECT-CONTENT: Assigned courses count:', assignedCourses.length);
    
    if (assignedCourses.length === 0) {
      console.log('🎯 ALL-SUBJECT-CONTENT: No assigned courses, returning empty');
      return res.status(200).json({
        success: true,
        result: {
          subjects: [],
          courses: []
        }
      });
    }

    // Fetch all subject content for assigned courses
    const subjects = [];
    const courses = [];

    for (const assignment of assignedCourses) {
      console.log('🎯 ALL-SUBJECT-CONTENT: Processing assignment:', assignment);
      try {
        // Fetch directly from Course collection using raw MongoDB query to avoid Mongoose schema issues
        const courseDoc = mongoose.connection.db ? await mongoose.connection.db.collection('courses').findOne({_id: new mongoose.Types.ObjectId(assignment.courseId)}) : null;
        console.log('🎯 ALL-SUBJECT-CONTENT: Course found:', !!courseDoc, 'Course ID:', assignment.courseId);
        
        if (courseDoc) {
          console.log('🎯 ALL-SUBJECT-CONTENT: Course title:', courseDoc.title);
          // Find the subject in the course
          const subjectData = courseDoc.subjects?.find((s: any) => s.name === assignment.subject);
          console.log('🎯 ALL-SUBJECT-CONTENT: Subject data found:', !!subjectData, 'Subject name:', assignment.subject);
          console.log('🎯 ALL-SUBJECT-CONTENT: Available subjects in course:', courseDoc.subjects?.map((s: any) => s.name));
          
          if (subjectData) {
            console.log('🎯 ALL-SUBJECT-CONTENT: Subject modules:', subjectData.modules?.length || 0);

            subjects.push({
              _id: `${courseDoc._id}_${subjectData.name}`,
              courseId: courseDoc._id,
              courseName: courseDoc.title,
              courseProgram: courseDoc.program || '',
              courseThumbnail: courseDoc.thumbnail,
              subjectName: subjectData.name,
              description: subjectData.description,
              syllabus: subjectData.syllabus,
              objectives: subjectData.objectives,
              modules: subjectData.modules?.map((module: any, index: number) => ({
                _id: `${courseDoc._id}_${subjectData.name}_${index}`,
                moduleNumber: index + 1,
                title: module.name || `Module ${index + 1}`,
                description: module.description || '',
                hasVideo: module.hasVideo || false,
                hasNotes: module.hasNotes || false,
                hasTest: module.hasTest || false,
                hasLiveClass: module.hasLiveClass || false,
                videoTitle: module.videoTitle || '',
                notesTitle: module.notesTitle || '',
                videoUrl: module.videoUrl || '',
                notesUrl: module.notesUrl || '',
                liveClassSchedule: module.liveClassSchedule || [],
                order: module.order || index + 1,
                isActive: module.isActive !== false
              })) || [],
              lastUpdated: courseDoc.updatedAt || new Date(),
              assignedAt: assignment.assignedAt,
              totalModules: subjectData.modules?.length || 0,
              modulesWithVideo: subjectData.modules?.filter((m: any) => m.hasVideo).length || 0,
              modulesWithNotes: subjectData.modules?.filter((m: any) => m.hasNotes).length || 0,
              scheduledLiveClasses: subjectData.modules?.reduce((acc: number, m: any) => 
                acc + (m.liveClassSchedule?.length || 0), 0) || 0,
            });

            courses.push({
              _id: courseDoc._id,
              title: courseDoc.title,
              program: courseDoc.program,
              thumbnail: courseDoc.thumbnail
            });
          } else {
            console.log('🎯 ALL-SUBJECT-CONTENT: Subject not found in course');
          }
        } else {
          console.log('🎯 ALL-SUBJECT-CONTENT: Course not found');
        }
      } catch (error) {
        console.error(`Error fetching subject content for ${assignment.subject}:`, error);
      }
    }

    console.log('🎯 ALL-SUBJECT-CONTENT: Final result - subjects:', subjects.length, 'courses:', courses.length);
    if (subjects.length > 0) {
      console.log('🎯 ALL-SUBJECT-CONTENT: First subject modules:', subjects[0].modules?.length || 0);
    }
    
    return res.status(200).json({
      success: true,
      result: {
        subjects,
        courses
      }
    });

  } catch (error: any) {
    console.error("Error fetching all subject content:", error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch subject content' });
  }
};

// Create a new chapter/module
export const createModule = async (req: Request, res: Response) => {
  try {
    const { teacherEmail } = req.query;
    const { moduleName, moduleNumber, description, order } = req.body;

    if (!teacherEmail) {
      return res.status(400).json({ success: false, message: 'Teacher email is required' });
    }

    if (!moduleName) {
      return res.status(400).json({ success: false, message: 'Module name is required' });
    }

    // Get teacher
    const teacher = await Teacher.findOne({ email: teacherEmail, isActive: true });
    if (!teacher || !teacher.assignedCourses || teacher.assignedCourses.length === 0) {
      return res.status(404).json({ success: false, message: 'Teacher not found or no courses assigned' });
    }

    // Get the assigned course and subject
    const assignedCourse = teacher.assignedCourses[0];

    // Get subject content for the assigned course and subject
    let subjectContent = await SubjectContent.findOne({
      teacherId: teacher._id,
      courseId: assignedCourse.courseId,
      subjectName: assignedCourse.subject,
      isActive: true
    });

    // If no subject content exists for the assigned subject, create it
    if (!subjectContent) {
      const course = await Course.findById(assignedCourse.courseId);
      const subjectData = course?.subjects?.find((s: any) => s.name === assignedCourse.subject);

      subjectContent = await SubjectContent.create({
        courseId: assignedCourse.courseId,
        courseName: course?.title || assignedCourse.courseName,
        subjectName: assignedCourse.subject,
        teacherId: teacher._id,
        teacherName: teacher.fullName || `${teacher.firstName} ${teacher.lastName}`,
        teacherEmail: teacher.email,
        modules: subjectData?.modules?.map((mod: any, idx: number) => ({
          moduleNumber: idx + 1,
          moduleName: mod.name,
          description: mod.description || '',
          hasVideo: mod.hasVideo || false,
          hasNotes: mod.hasNotes || false,
          hasLiveClass: mod.hasLiveClass || false,
          hasTest: mod.hasTest || false,
          hasQuestions: mod.hasQuestions || false,
          order: mod.order || idx + 1,
          isActive: mod.isActive !== false
        })) || [],
        description: subjectData?.description,
        isActive: true
      });
    }

    // Create new module
    const newModuleNumber = moduleNumber || subjectContent.modules.length + 1;
    const newModule = {
      moduleNumber: newModuleNumber,
      moduleName,
      description: description || '', // Add description
      hasVideo: false,
      hasNotes: false,
      hasLiveClass: false,
      hasTest: false,
      hasQuestions: false,
      order: order || newModuleNumber,
      isActive: true
    };

    subjectContent.modules.push(newModule as any);
    await subjectContent.save();

    // Also persist module to Course.subjects[].modules so admin and course listing stay in sync
    try {
      const course = await Course.findById(subjectContent.courseId);
      if (course) {
        const subject = course.subjects?.find((s: any) => s.name === subjectContent.subjectName);
        const moduleObj = {
          name: newModule.moduleName,
          description: newModule.description || '',
          duration: '',
          hasVideo: false,
          hasNotes: false,
          hasLiveClass: false,
          hasTest: false,
          order: newModule.order || newModule.moduleNumber,
          isActive: true,
        };
        if (subject) {
          subject.modules = subject.modules || [];
          // insert at proper position if moduleNumber provided
          const insertIndex = (newModule.moduleNumber ? newModule.moduleNumber - 1 : subject.modules.length);
          subject.modules.splice(insertIndex, 0, moduleObj);
        } else {
          // create subject entry if missing
          course.subjects = course.subjects || [];
          course.subjects.push({ name: subjectContent.subjectName, modules: [moduleObj], description: subjectContent.description || '' });
        }
        await course.save();
      }
    } catch (err) {
      console.error('Failed to sync new module to Course document:', err);
    }

    return res.status(200).json({ success: true, message: 'Module created successfully', data: { 
      module: newModule,
      subjectContent 
    }});

  } catch (error: any) {
    console.error('Create module error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to create module' });
  }
};

// Update existing module
export const updateModule = async (req: Request, res: Response) => {
  try {
    const { teacherEmail } = req.query;
    const { moduleNumber } = req.params;
    const updateData = req.body;

    if (!teacherEmail) {
      return res.status(400).json({ success: false, message: 'Teacher email is required' });
    }

    // Get teacher
    const teacher = await Teacher.findOne({ email: teacherEmail, isActive: true });
    if (!teacher || !teacher.assignedCourses || teacher.assignedCourses.length === 0) {
      return res.status(404).json({ success: false, message: 'Teacher not found or no courses assigned' });
    }

    // Get the assigned course and subject
    const assignedCourse = teacher.assignedCourses[0];

    // Get subject content for the assigned course and subject
    const subjectContent = await SubjectContent.findOne({
      teacherId: teacher._id,
      courseId: assignedCourse.courseId,
      subjectName: assignedCourse.subject,
      isActive: true
    });

    if (!subjectContent) {
      return res.status(404).json({ success: false, message: 'Subject content not found for assigned subject' });
    }

    // Find and update module
    const moduleIndex = subjectContent.modules.findIndex(
      m => m.moduleNumber === parseInt(moduleNumber)
    );

    if (moduleIndex === -1) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    // Update module fields
    Object.assign(subjectContent.modules[moduleIndex], updateData);
    await subjectContent.save();

    // Also update Course.subjects[].modules
    try {
      const course = await Course.findById(subjectContent.courseId);
      if (course) {
        const subject = course.subjects?.find((s: any) => s.name === subjectContent.subjectName);
        if (subject && Array.isArray(subject.modules)) {
          // Find module by matching name or by position (moduleNumber - 1)
          const moduleNumber = subjectContent.modules[moduleIndex].moduleNumber;
          let modIndex = subject.modules.findIndex((m: any, idx: number) => 
            m.name === subjectContent.modules[moduleIndex].moduleName || 
            idx === (moduleNumber - 1)
          );

          if (modIndex !== -1) {
            const moduleDescription = subjectContent.modules[moduleIndex].description?.trim() || 
                                    subjectContent.modules[moduleIndex].moduleName || 
                                    'No description available';
            subject.modules[modIndex] = {
              ...subject.modules[modIndex],
              name: subjectContent.modules[moduleIndex].moduleName,
              description: moduleDescription,
              order: subjectContent.modules[moduleIndex].order || subjectContent.modules[moduleIndex].moduleNumber
            };
          }
          await course.save();
        }
      }
    } catch (err) {
      console.error('Failed to sync updated module to Course document:', err);
    }
    return res.status(200).json({ success: true, message: 'Module updated successfully', data: { 
      module: subjectContent.modules[moduleIndex],
      subjectContent 
    }});

  } catch (error: any) {
    console.error('Update module error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to update module' });
  }
};

// Delete module
export const deleteModule = async (req: Request, res: Response) => {
  try {
    const { teacherEmail } = req.query;
    const { moduleNumber } = req.params;

    if (!teacherEmail) {
      return res.status(400).json({ success: false, message: 'Teacher email is required' });
    }

    // Get teacher
    const teacher = await Teacher.findOne({ email: teacherEmail, isActive: true });
    if (!teacher || !teacher.assignedCourses || teacher.assignedCourses.length === 0) {
      return res.status(404).json({ success: false, message: 'Teacher not found or no courses assigned' });
    }

    // Get the assigned course and subject
    const assignedCourse = teacher.assignedCourses[0];

    // Get subject content for the assigned course and subject
    const subjectContent = await SubjectContent.findOne({
      teacherId: teacher._id,
      courseId: assignedCourse.courseId,
      subjectName: assignedCourse.subject,
      isActive: true
    });

    if (!subjectContent) {
      return res.status(404).json({ success: false, message: 'Subject content not found for assigned subject' });
    }

    // Remove module
    subjectContent.modules = subjectContent.modules.filter(
      m => m.moduleNumber !== parseInt(moduleNumber)
    );

    await subjectContent.save();

    // Also remove module from Course.subjects[].modules
    try {
      const course = await Course.findById(subjectContent.courseId);
      if (course) {
        const subject = course.subjects?.find((s: any) => s.name === subjectContent.subjectName);
        if (subject && Array.isArray(subject.modules)) {
          // remove by moduleNumber
          subject.modules = subject.modules.filter((m: any, i: number) => (i !== (parseInt(moduleNumber) - 1)));
          // re-order module numbers if needed
          subject.modules = subject.modules.map((m: any, idx: number) => ({ ...m, order: idx + 1 }));
          await course.save();
        }
      }
    } catch (err) {
      console.error('Failed to sync deleted module to Course document:', err);
    }

    return res.status(200).json({ success: true, message: 'Module deleted successfully', data: { subjectContent }});

  } catch (error: any) {
    console.error('Delete module error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete module' });
  }
};

// Upload video to module (Firebase Storage)
export const uploadVideo = async (req: Request, res: Response) => {
  try {
    const { teacherEmail } = req.query;
    const { moduleNumber, videoTitle, videoDuration } = req.body;

    if (!teacherEmail || !moduleNumber) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Check if video file was uploaded
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No video file uploaded' });
    }

    // Get teacher and subject content
    const teacher = await Teacher.findOne({ email: teacherEmail, isActive: true });
    if (!teacher || !teacher.assignedCourses || teacher.assignedCourses.length === 0) {
      return res.status(404).json({ success: false, message: 'Teacher not found or no courses assigned' });
    }

    // Get the assigned course and subject
    const assignedCourse = teacher.assignedCourses[0];

    // Get course details
    const course = await Course.findById(assignedCourse.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Assigned course not found' });
    }

    let subjectContent = await SubjectContent.findOne({
      teacherId: teacher._id,
      courseId: assignedCourse.courseId,
      subjectName: assignedCourse.subject,
      isActive: true
    });

    // If no subject content exists, create initial structure from course
    if (!subjectContent) {
      const subject = course.subjects?.find((s: any) => s.name === assignedCourse.subject);

      if (subject && subject.modules) {
        subjectContent = await SubjectContent.create({
          courseId: assignedCourse.courseId,
          courseName: course.title,
          subjectName: assignedCourse.subject,
          teacherId: teacher._id,
          teacherName: teacher.fullName || `${teacher.firstName} ${teacher.lastName}`,
          teacherEmail: teacher.email,
          modules: subject.modules.map((mod: any, idx: number) => ({
            moduleNumber: idx + 1,
            moduleName: mod.name,
            description: mod.description || '',
            hasVideo: false,
            hasNotes: false,
            hasLiveClass: false,
            hasTest: false,
            hasQuestions: false,
            order: idx + 1,
            isActive: true
          })),
          description: subject.description,
          isActive: true
        });
      } else {
        // Create empty structure
        subjectContent = await SubjectContent.create({
          courseId: assignedCourse.courseId,
          courseName: course.title,
          subjectName: assignedCourse.subject,
          teacherId: teacher._id,
          teacherName: teacher.fullName || `${teacher.firstName} ${teacher.lastName}`,
          teacherEmail: teacher.email,
          modules: [],
          isActive: true
        });
      }
    }

    // Find module and update
    const module = subjectContent.modules.find(m => m.moduleNumber === parseInt(moduleNumber));
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    // Import FirebaseService dynamically to avoid circular imports
    const FirebaseService = (await import('../../../services/firebaseService')).default;

    // Upload video to Firebase Storage
    const uploadResult = await FirebaseService.uploadVideo(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      assignedCourse.subject,
      {
        title: videoTitle,
        duration: videoDuration,
        teacherId: (teacher._id as any).toString(),
        courseId: assignedCourse.courseId,
      }
    );

    module.hasVideo = true;
    module.videoUrl = uploadResult.storagePath; // Store storage path, not download URL
    module.videoTitle = videoTitle || req.file.originalname;
    module.videoDuration = videoDuration;
    module.videoUploadedAt = uploadResult.uploadedAt;

    await subjectContent.save();

    // Also update Course.subjects[].modules video fields
    try {
      const course = await Course.findById(subjectContent.courseId);
      if (course) {
        const subject = course.subjects?.find((s: any) => s.name === subjectContent.subjectName);
        if (subject && Array.isArray(subject.modules)) {
          const idx = subjectContent.modules.findIndex((m: any) => m.moduleNumber === parseInt(moduleNumber));
          if (idx !== -1 && subject.modules[idx]) {
            subject.modules[idx].hasVideo = true;
            subject.modules[idx].videoUrl = uploadResult.storagePath;
            subject.modules[idx].videoTitle = videoTitle || req.file.originalname;
            subject.modules[idx].videoDuration = videoDuration;
            subject.modules[idx].videoUploadedAt = uploadResult.uploadedAt;
            await course.save();
          }
        }
      }
    } catch (err) {
      console.error('Failed to sync uploaded video to Course document:', err);
    }

    return res.status(200).json({
      success: true,
      message: 'Video uploaded successfully',
      data: {
        module,
        subjectContent,
        uploadResult: {
          fileName: uploadResult.fileName,
          size: uploadResult.size,
          uploadedAt: uploadResult.uploadedAt,
        }
      }
    });

  } catch (error: any) {
    console.error('Upload video error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to upload video' });
  }
};

// Upload notes to module (Firebase Storage)
export const uploadNotes = async (req: Request, res: Response) => {
  try {
    const { teacherEmail } = req.query;
    const { moduleNumber, notesTitle } = req.body;

    if (!teacherEmail || !moduleNumber) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Check if notes file was uploaded
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No notes file uploaded' });
    }

    // Get teacher and subject content
    const teacher = await Teacher.findOne({ email: teacherEmail, isActive: true });
    if (!teacher || !teacher.assignedCourses || teacher.assignedCourses.length === 0) {
      return res.status(404).json({ success: false, message: 'Teacher not found or no courses assigned' });
    }

    // Get the assigned course and subject
    const assignedCourse = teacher.assignedCourses[0];

    // Get course details
    const course = await Course.findById(assignedCourse.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Assigned course not found' });
    }

    let subjectContent = await SubjectContent.findOne({
      teacherId: teacher._id,
      courseId: assignedCourse.courseId,
      subjectName: assignedCourse.subject,
      isActive: true
    });

    // If no subject content exists, create initial structure from course
    if (!subjectContent) {
      const subject = course.subjects?.find((s: any) => s.name === assignedCourse.subject);

      if (subject && subject.modules) {
        subjectContent = await SubjectContent.create({
          courseId: assignedCourse.courseId,
          courseName: course.title,
          subjectName: assignedCourse.subject,
          teacherId: teacher._id,
          teacherName: teacher.fullName || `${teacher.firstName} ${teacher.lastName}`,
          teacherEmail: teacher.email,
          modules: subject.modules.map((mod: any, idx: number) => ({
            moduleNumber: idx + 1,
            moduleName: mod.name,
            description: mod.description || '',
            hasVideo: false,
            hasNotes: false,
            hasLiveClass: false,
            hasTest: false,
            hasQuestions: false,
            order: idx + 1,
            isActive: true
          })),
          description: subject.description,
          isActive: true
        });
      } else {
        // Create empty structure
        subjectContent = await SubjectContent.create({
          courseId: assignedCourse.courseId,
          courseName: course.title,
          subjectName: assignedCourse.subject,
          teacherId: teacher._id,
          teacherName: teacher.fullName || `${teacher.firstName} ${teacher.lastName}`,
          teacherEmail: teacher.email,
          modules: [],
          isActive: true
        });
      }
    }

    // Find module and update
    const module = subjectContent.modules.find(m => m.moduleNumber === parseInt(moduleNumber));
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    // Import FirebaseService dynamically to avoid circular imports
    const FirebaseService = (await import('../../../services/firebaseService')).default;

    // Upload notes to Firebase Storage
    const uploadResult = await FirebaseService.uploadNotes(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      assignedCourse.subject,
      {
        title: notesTitle,
        teacherId: (teacher._id as any).toString(),
        courseId: assignedCourse.courseId,
      }
    );

    module.hasNotes = true;
    module.notesUrl = uploadResult.storagePath; // Store storage path, not download URL
    module.notesTitle = notesTitle || req.file.originalname;
    module.notesUploadedAt = uploadResult.uploadedAt;

    await subjectContent.save();

    // Also update Course.subjects[].modules notes fields
    try {
      const course = await Course.findById(subjectContent.courseId);
      if (course) {
        const subject = course.subjects?.find((s: any) => s.name === subjectContent.subjectName);
        if (subject && Array.isArray(subject.modules)) {
          const idx = subjectContent.modules.findIndex((m: any) => m.moduleNumber === parseInt(moduleNumber));
          if (idx !== -1 && subject.modules[idx]) {
            subject.modules[idx].hasNotes = true;
            subject.modules[idx].notesUrl = uploadResult.storagePath;
            subject.modules[idx].notesTitle = notesTitle || req.file.originalname;
            subject.modules[idx].notesUploadedAt = uploadResult.uploadedAt;
            await course.save();
          }
        }
      }
    } catch (err) {
      console.error('Failed to sync uploaded notes to Course document:', err);
    }

    return res.status(200).json({
      success: true,
      message: 'Notes uploaded successfully',
      data: {
        module,
        subjectContent,
        uploadResult: {
          fileName: uploadResult.fileName,
          size: uploadResult.size,
          uploadedAt: uploadResult.uploadedAt,
        }
      }
    });

  } catch (error: any) {
    console.error('Upload notes error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to upload notes' });
  }
};