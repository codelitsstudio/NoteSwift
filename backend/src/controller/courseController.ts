// backend/controllers/courseController.ts
import { Request, Response } from "express";
import Course from "../models/Course";
import CourseEnrollment from "../models/CourseEnrollment";
import { Types } from "mongoose";

// Extend Express Request to include user injected by auth middleware
interface AuthRequest extends Request {
  user?: {
    id: string;
    role?: string;
  };
}

// Get featured course
export const getFeaturedCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const featuredCourse = await Course.findOne({
      isActive: true,
      isFeatured: true,
    }).sort({ createdAt: -1 });

    if (!featuredCourse) {
      res.status(404).json({
        success: false,
        message: "No featured course found",
      });
      return;
    }

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
    }).populate("courseId", "title description thumbnail");

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

    const courses = await Course.find({ isActive: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Course.countDocuments({ isActive: true });

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
