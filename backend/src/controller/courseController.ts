// backend/controllers/courseController.ts
import { Request, Response } from "express";
import Course from "../models/Course.model";
import CourseEnrollment from "../models/CourseEnrollment";
import { Types } from "mongoose";

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
    // Update progress percentage
    // (Assume frontend sends totalLessons or calculate from chapter data if available)
    // For now, just set progress = (completedLessons.length / totalLessons) * 100
    if (req.body.totalLessons) {
      enrollment.progress = Math.round((enrollment.completedLessons.length / req.body.totalLessons) * 100);
    }
    enrollment.lastAccessedAt = new Date();
    await enrollment.save();
    res.json({
      success: true,
      data: {
        progress: enrollment.progress,
        completedLessons: enrollment.completedLessons,
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
    const { moduleNumber, videoCompleted, notesCompleted, progress } = req.body;
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

    // Update module progress
    if (progress !== undefined) {
      await enrollment.updateModuleProgress(moduleNumber, videoCompleted, notesCompleted, progress);
    } else {
      await enrollment.updateModuleProgress(moduleNumber, videoCompleted, notesCompleted);
    }
    console.log(`Updated module ${moduleNumber} progress to:`, progress);
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

// Get module progress for a specific module
export const getModuleProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId, moduleNumber } = req.params;
    const studentId = req.user?.id;

    if (!courseId || !studentId || !moduleNumber) {
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

    const moduleProgress = enrollment.moduleProgress.find(
      m => m.moduleNumber === parseInt(moduleNumber)
    );
    console.log(`Fetching module ${moduleNumber} progress:`, moduleProgress);

    res.json({
      success: true,
      data: {
        moduleProgress: moduleProgress || {
          moduleNumber: parseInt(moduleNumber),
          videoCompleted: false,
          notesCompleted: false,
          progress: 0
        },
        overallProgress: enrollment.progress
      },
    });
  } catch (error) {
    console.error("Error fetching module progress:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
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
    }).populate("courseId", "title description subject tags");

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
