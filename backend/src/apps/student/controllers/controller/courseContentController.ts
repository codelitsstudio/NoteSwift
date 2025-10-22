// backend/controllers/courseController.ts
import { Request, Response } from "express";
import Course from "../../models/Course.model";
import CourseEnrollment from "../../models/CourseEnrollment";
import HomepageSettings from "@core/models/HomepageSettings";
import SubjectContent from "../../models/SubjectContent.model";
import { Types } from "mongoose";
import auditLogger from "../../lib/audit-logger";

// Extend Express Request to include user injected by auth middleware
interface AuthRequest extends Request {
  user?: {
    id: string;
    role?: string;
  };
}

// ============================================================================
// COURSE CONTENT ENDPOINTS
// ============================================================================

// Get full course content with all subjects and teacher-managed modules
export const getCourseContent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const studentId = req.user?.id;

    if (!courseId) {
      res.status(400).json({
        success: false,
        message: "Course ID is required"
      });
      return;
    }

    // Verify student is enrolled in this course
    if (studentId) {
      const enrollment = await CourseEnrollment.findOne({
        courseId: new Types.ObjectId(courseId),
        studentId: new Types.ObjectId(studentId),
        isActive: true
      });

      if (!enrollment) {
        res.status(403).json({
          success: false,
          message: "You are not enrolled in this course"
        });
        return;
      }
    }

    // Get course details
    const courseData = await Course.findById(courseId).lean();
    
    if (!courseData) {
      res.status(404).json({
        success: false,
        message: "Course not found"
      });
      return;
    }

    const course: any = courseData;

    // Get all subject contents for this course
    const subjectContents = await SubjectContent.find({
      courseId: new Types.ObjectId(courseId),
      isActive: true
    })
    .populate('teacherId', 'firstName lastName email')
    .lean();

    // Map course subjects with teacher-managed content
    const enrichedSubjects = course.subjects?.map((subject: any) => {
      // Find teacher-managed content for this subject
      const teacherContent = subjectContents.find(
        (sc: any) => sc.subjectName === subject.name
      );

      if (teacherContent) {
        return {
          name: subject.name,
          description: teacherContent.description || subject.description,
          teacher: {
            id: (teacherContent as any).teacherId?._id,
            name: `${(teacherContent as any).teacherId?.firstName || ''} ${(teacherContent as any).teacherId?.lastName || ''}`.trim(),
            email: (teacherContent as any).teacherId?.email
          },
          modules: (teacherContent as any).modules.map((module: any) => ({
            moduleNumber: module.moduleNumber,
            moduleName: module.moduleName,
            description: subject.modules?.find((m: any) => m.name === module.moduleName)?.description || '',
            order: module.order,
            isActive: module.isActive,
            
            // Video content
            hasVideo: module.hasVideo,
            video: module.hasVideo ? {
              url: module.videoUrl,
              title: module.videoTitle,
              duration: module.videoDuration,
              uploadedAt: module.videoUploadedAt
            } : null,
            
            // Notes content
            hasNotes: module.hasNotes,
            notes: module.hasNotes ? {
              url: module.notesUrl,
              title: module.notesTitle,
              uploadedAt: module.notesUploadedAt
            } : null,
            
            // Live classes
            hasLiveClass: module.hasLiveClass,
            liveClasses: module.liveClassSchedule?.filter((lc: any) => 
              lc.status === 'scheduled' || lc.status === 'ongoing'
            ).map((lc: any) => ({
              scheduledAt: lc.scheduledAt,
              duration: lc.duration,
              meetingLink: lc.meetingLink,
              status: lc.status
            })) || [],
            
            // Tests and questions
            hasTest: module.hasTest,
            testCount: module.testIds?.length || 0,
            hasQuestions: module.hasQuestions,
            questionCount: module.questionIds?.length || 0,
          })),
          syllabus: teacherContent.syllabus,
          objectives: teacherContent.objectives,
          lastUpdated: teacherContent.lastUpdated
        };
      } else {
        // Subject exists but no teacher assigned yet
        return {
          name: subject.name,
          description: subject.description,
          teacher: null,
          modules: subject.modules?.map((module: any, index: number) => ({
            moduleNumber: index + 1,
            moduleName: module.name,
            description: module.description,
            order: index + 1,
            isActive: false,
            hasVideo: false,
            video: null,
            hasNotes: false,
            notes: null,
            hasLiveClass: false,
            liveClasses: [],
            hasTest: false,
            testCount: 0,
            hasQuestions: false,
            questionCount: 0,
          })) || [],
          syllabus: null,
          objectives: [],
          lastUpdated: null
        };
      }
    }) || [];

    res.json({
      success: true,
      data: {
        course: {
          _id: course._id,
          title: course.title,
          description: course.description,
          program: course.program,
          duration: course.duration,
          thumbnail: course.thumbnail,
          icon: course.icon,
          status: course.status,
          type: course.type,
        },
        subjects: enrichedSubjects,
        totalSubjects: enrichedSubjects.length,
        assignedSubjects: enrichedSubjects.filter((s: any) => s.teacher !== null).length
      },
      message: "Course content retrieved successfully"
    });

  } catch (error) {
    console.error("Error fetching course content:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get subject content for a specific subject in a course
export const getSubjectContent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId, subjectName } = req.params;
    const studentId = req.user?.id;

    if (!courseId || !subjectName) {
      res.status(400).json({
        success: false,
        message: "Course ID and subject name are required"
      });
      return;
    }

    // Verify student is enrolled
    if (studentId) {
      const enrollment = await CourseEnrollment.findOne({
        courseId: new Types.ObjectId(courseId),
        studentId: new Types.ObjectId(studentId),
        isActive: true
      });

      if (!enrollment) {
        res.status(403).json({
          success: false,
          message: "You are not enrolled in this course"
        });
        return;
      }
    }

    // Get subject content
    const subjectContent = await SubjectContent.findOne({
      courseId: new Types.ObjectId(courseId),
      subjectName: decodeURIComponent(subjectName),
      isActive: true
    })
    .populate('teacherId', 'firstName lastName email')
    .populate('courseId', 'title description program')
    .lean();

    if (!subjectContent) {
      res.status(404).json({
        success: false,
        message: "Subject content not found or no teacher assigned yet"
      });
      return;
    }

    res.json({
      success: true,
      data: subjectContent,
      message: "Subject content retrieved successfully"
    });

  } catch (error) {
    console.error("Error fetching subject content:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ============================================================================
// LESSON & MODULE PROGRESS ENDPOINTS
// ============================================================================

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

// ============================================================================
// COURSE ENROLLMENT ENDPOINTS
// ============================================================================

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

// ============================================================================
// COURSE RETRIEVAL ENDPOINTS
// ============================================================================

// Get all courses (for students - published only)
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

// Get course by ID
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

// Get all courses for admin (includes drafts)
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

// ============================================================================
// HOMEPAGE & FEATURED COURSE ENDPOINTS
// ============================================================================

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

// ============================================================================
// PERSONALIZED RECOMMENDATIONS
// ============================================================================

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

// ============================================================================
// ADMIN COURSE MANAGEMENT
// ============================================================================

// Create course
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

// Update course
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

// Delete course
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

// ============================================================================
// HOMEPAGE SETTINGS MANAGEMENT
// ============================================================================

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

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

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