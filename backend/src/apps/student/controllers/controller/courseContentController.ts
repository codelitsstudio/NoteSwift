// backend/controllers/courseController.ts
import { Request, Response } from "express";
import Course from "../../models/Course.model";
import CourseEnrollment from "../../models/CourseEnrollment";
import HomepageSettings from "@core/models/HomepageSettings";
import { Types } from "mongoose";
import auditLogger from "../../lib/audit-logger";

// Import SubjectContent model
import SubjectContent from "../../models/SubjectContent.model";

// Import Teacher model and interface
import Teacher from "../../models/Teacher.model";
import { ITeacher } from "../../models/Teacher.model";

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

    // TODO: Re-enable enrollment check after testing
    // // Verify student is enrolled in this course
    // if (studentId) {
    //   const enrollment = await CourseEnrollment.findOne({
    //     courseId: new Types.ObjectId(courseId),
    //     studentId: new Types.ObjectId(studentId),
    //     isActive: true
    //   });

    //   if (!enrollment) {
    //     res.status(403).json({
    //       success: false,
    //       message: "You are not enrolled in this course"
    //     });
    //     return;
    //   }
    // }

    // Get course details using raw MongoDB query to avoid Mongoose schema issues
    const courseData = await Course.findById(courseId).lean();
    
    if (!courseData) {
      res.status(404).json({
        success: false,
        message: "Course not found"
      });
      return;
    }

    const course: any = courseData;

    // Get all subject contents for this course (from SubjectContent collection)
    const subjectContents = await SubjectContent.find({
      courseId: courseId,
      isActive: true
    }).populate('teacherId', 'firstName lastName email verificationDocuments');

    console.log('📚 Found subject contents:', subjectContents.length);

    // Create a map of subject name to subject content (case-insensitive)
    const subjectContentMap = new Map();
    subjectContents.forEach((sc: any) => {
      const key = sc.subjectName?.toLowerCase()?.trim();
      if (key) {
        subjectContentMap.set(key, sc);
        console.log('📚 Mapped subject content:', key, '-> modules:', sc.modules?.length || 0);
      }
    });

    // Get course subjects and merge with subject content data
    const subjects = course.subjects || [];

    // Map course subjects with their modules, preferring SubjectContent data when available
    const enrichedSubjects = subjects.map((subject: any) => {
      const subjectKey = subject.name?.toLowerCase()?.trim();
      const subjectContent = subjectContentMap.get(subjectKey);
      
      console.log('🔄 Processing subject:', subject.name, {
        subjectKey,
        hasSubjectContent: !!subjectContent,
        courseModules: subject.modules?.length || 0,
        subjectContentModules: subjectContent?.modules?.length || 0
      });
      
      return {
        name: subject.name,
        description: subject.description,
        teacher: subjectContent ? {
          id: (subjectContent.teacherId as any)?._id?.toString() || subjectContent.teacherId?.toString(),
          name: subjectContent.teacherName || 'Course Instructor',
          email: subjectContent.teacherEmail
        } : {
          id: null,
          name: course.offeredBy || 'Course Instructor',
          email: null
        },
        modules: (subject.modules || []).map((module: any, index: number) => {
          // Try to find matching module in SubjectContent by name first, then by order
          let subjectContentModule = null;
          
          if (subjectContent?.modules) {
            // First try to match by module name (case-insensitive)
            subjectContentModule = subjectContent.modules.find((m: any) => 
              m.moduleName?.toLowerCase()?.trim() === module.name?.toLowerCase()?.trim()
            );
            
            // If no name match, try by order/index
            if (!subjectContentModule) {
              subjectContentModule = subjectContent.modules.find((m: any) => 
                m.order === (module.order || index + 1) || m.moduleNumber === (module.order || index + 1)
              );
            }
            
            // Last resort: match by index
            if (!subjectContentModule && subjectContent.modules[index]) {
              subjectContentModule = subjectContent.modules[index];
            }
          }
          
          const result = {
            moduleNumber: index + 1,
            moduleName: subjectContentModule?.moduleName || module.name,
            description: subjectContentModule?.description || module.description || '',
            order: subjectContentModule?.order || module.order || index + 1,
            isActive: subjectContentModule?.isActive !== false,

            // Video content - prefer SubjectContent data
            hasVideo: subjectContentModule?.hasVideo === true || module.hasVideo === true || module.hasVideo === 'true' || false,
            video: (subjectContentModule?.hasVideo === true || module.hasVideo === true || module.hasVideo === 'true') ? {
              url: subjectContentModule?.videoUrl || module.videoUrl,
              title: subjectContentModule?.videoTitle || module.videoTitle,
              duration: subjectContentModule?.videoDuration || module.videoDuration,
              uploadedAt: subjectContentModule?.videoUploadedAt || module.videoUploadedAt
            } : null,

            // Notes content - prefer SubjectContent data
            hasNotes: subjectContentModule?.hasNotes === true || module.hasNotes === true || module.hasNotes === 'true' || false,
            notes: (subjectContentModule?.hasNotes === true || module.hasNotes === true || module.hasNotes === 'true') ? {
              url: subjectContentModule?.notesUrl || module.notesUrl,
              title: subjectContentModule?.notesTitle || module.notesTitle,
              uploadedAt: subjectContentModule?.notesUploadedAt || module.notesUploadedAt
            } : null,

            // Live classes
            hasLiveClass: subjectContentModule?.hasLiveClass || module.hasLiveClass || false,
            liveClasses: (subjectContentModule?.liveClassSchedule || module.liveClassSchedule || []).filter((lc: any) =>
              lc.status === 'scheduled' || lc.status === 'ongoing'
            ).map((lc: any) => ({
              scheduledAt: lc.scheduledAt,
              duration: lc.duration,
              meetingLink: lc.meetingLink,
              status: lc.status
            })) || [],

            // Tests and questions
            hasTest: subjectContentModule?.hasTest || module.hasTest || false,
            testCount: subjectContentModule?.testIds?.length || module.testIds?.length || 0,
            hasQuestions: subjectContentModule?.hasQuestions || module.hasQuestions || false,
            questionCount: subjectContentModule?.questionIds?.length || module.questionIds?.length || 0,
          };
          
          console.log('📝 Module result:', {
            moduleName: result.moduleName,
            hasVideo: result.hasVideo,
            hasNotes: result.hasNotes,
            matchedBy: subjectContentModule ? 'SubjectContent' : 'Course'
          });
          
          return result;
        }),
        syllabus: course.syllabus?.find((s: any) => s.title?.toLowerCase().includes(subject.name.toLowerCase()))?.description,
        objectives: course.learningPoints || [],
        lastUpdated: subjectContent?.lastUpdated || course.updatedAt
      };
    });

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
        assignedSubjects: enrichedSubjects.length // All subjects from course are assigned
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
// Get subject content for a specific subject in a course
export const getSubjectContent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId, subjectName } = req.params;
    const studentId = req.user?.id;

    console.log('🔍 getSubjectContent called with:', { courseId, subjectName, studentId });

    if (!courseId || !subjectName) {
      res.status(400).json({
        success: false,
        message: "Course ID and subject name are required"
      });
      return;
    }

    // TODO: Re-enable enrollment check after testing
    // // Verify student is enrolled
    // if (studentId) {
    //   const enrollment = await CourseEnrollment.findOne({
    //     courseId: new Types.ObjectId(courseId),
    //     studentId: new Types.ObjectId(studentId),
    //     isActive: true
    //   });

    //   if (!enrollment) {
    //     res.status(403).json({
    //       success: false,
    //       message: "You are not enrolled in this course"
    //     });
    //     return;
    //   }
    // }

    // Try to get subject content from SubjectContent collection first
    let subjectContent = await SubjectContent.findOne({
      courseId: courseId,
      subjectName: { $regex: new RegExp(`^${decodeURIComponent(subjectName).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      isActive: true
    }).populate('teacherId', 'firstName lastName email verificationDocuments');

    console.log('🎯 SubjectContent lookup result:', subjectContent ? 'FOUND' : 'NOT FOUND', {
      searchedFor: decodeURIComponent(subjectName),
      found: subjectContent?.subjectName
    });

    // If no SubjectContent exists, fall back to Course data
    if (!subjectContent) {
      console.log('🎯 Falling back to Course data for subject content');
      
      // Get course data for fallback
      const course = await Course.findById(courseId).lean() as any;
      
      if (!course) {
        res.status(404).json({
          success: false,
          message: "Course not found"
        });
        return;
      }
      
      // Find the subject in the course (case-insensitive)
      const subject = course.subjects?.find((s: any) =>
        s.name?.toLowerCase()?.trim() === decodeURIComponent(subjectName).toLowerCase()?.trim()
      );

      console.log('🎯 Subject search in Course:', {
        subjectName: decodeURIComponent(subjectName),
        availableSubjects: course.subjects?.map((s: any) => s.name) || [],
        subjectFound: !!subject,
        subjectData: subject ? { name: subject.name, modulesCount: subject.modules?.length } : null
      });

      if (!subject) {
        res.status(404).json({
          success: false,
          message: "Subject not found in this course"
        });
        return;
      }

      // Transform the subject data to match the expected SubjectContent format
      subjectContent = {
        courseId: course._id,
        courseName: course.title,
        subjectName: subject.name,
        teacherId: null,
        teacherName: course.offeredBy || 'Course Instructor',
        teacherEmail: null,
        teacherAvatar: null,
        modules: (subject.modules || []).map((module: any, index: number) => ({
          moduleNumber: index + 1,
          moduleName: module.name,
          description: module.description,
          hasVideo: module.hasVideo === true || module.hasVideo === 'true' || false,
          videoUrl: module.videoUrl,
          videoTitle: module.videoTitle,
          videoDuration: module.videoDuration,
          videoUploadedAt: module.videoUploadedAt,
          hasNotes: module.hasNotes === true || module.hasNotes === 'true' || false,
          notesUrl: module.notesUrl,
          notesTitle: module.notesTitle,
          notesUploadedAt: module.notesUploadedAt,
          hasLiveClass: module.hasLiveClass || false,
          liveClassSchedule: module.liveClassSchedule || [],
          hasTest: module.hasTest || false,
          testIds: module.testIds || [],
          hasQuestions: module.hasQuestions || false,
          questionIds: module.questionIds || [],
          order: module.order || index + 1,
          isActive: module.isActive !== false
        })),
        description: subject.description,
        syllabus: course.syllabus?.find((s: any) => s.title?.toLowerCase().includes(subject.name.toLowerCase()))?.description,
        objectives: course.learningPoints || [],
        isActive: true,
        lastUpdated: course.updatedAt,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt
      } as any;
    } else {
      // SubjectContent exists, get teacher info and merge with Course descriptions if needed
      let teacherInfo = null;
      if (subjectContent.teacherId) {
        const teacher = subjectContent.teacherId as any;
        teacherInfo = {
          id: (teacher._id as any).toString(),
          name: subjectContent.teacherName || `${teacher.firstName} ${teacher.lastName}`.trim(),
          email: subjectContent.teacherEmail || teacher.email,
          avatar: teacher.verificationDocuments || 'https://randomuser.me/api/portraits/men/32.jpg'
        };
      }

      // Update teacher info in the response
      (subjectContent as any).teacherId = teacherInfo?.id || null;
      (subjectContent as any).teacherName = teacherInfo?.name || subjectContent.teacherName;
      (subjectContent as any).teacherEmail = teacherInfo?.email || subjectContent.teacherEmail;
      (subjectContent as any).teacherAvatar = teacherInfo?.avatar || null;
    }

    // Simple approach: modify the response data directly
    if (!subjectContent) {
      res.status(404).json({
        success: false,
        message: "Subject content not found"
      });
      return;
    }

    const responseData = subjectContent.toObject ? subjectContent.toObject() : subjectContent;

    // Ensure all modules have descriptions from Course data if missing
    if (responseData.modules && Array.isArray(responseData.modules)) {
      // Get course data for descriptions
      const course = await Course.findById(responseData.courseId).lean() as any;
      if (course) {
        const subject = course.subjects?.find((s: any) =>
          s.name?.toLowerCase()?.trim() === responseData.subjectName?.toLowerCase()?.trim()
        );

        if (subject?.modules) {
          responseData.modules = responseData.modules.map((module: any) => {
            // If module doesn't have description, get it from course
            if (!module.description || !module.description.trim()) {
              const courseModule = subject.modules.find((cm: any) =>
                cm.name?.toLowerCase()?.trim() === module.moduleName?.toLowerCase()?.trim()
              );
              module.description = courseModule?.description || '';
            }
            return module;
          });
        }
      }
    }

    console.log('📤 Sending subject content response:', {
      success: true,
      data: responseData,
      modulesCount: responseData?.modules?.length || 0,
      firstModule: responseData?.modules?.[0] || null
    });

    res.json({
      success: true,
      data: responseData,
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

// Get teachers assigned to subjects in a course
export const getCourseTeachers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      res.status(400).json({
        success: false,
        message: "Course ID is required"
      });
      return;
    }

    // Get course to verify it exists and get subject names
    const course = await Course.findById(courseId).lean() as any;

    if (!course) {
      res.status(404).json({
        success: false,
        message: "Course not found"
      });
      return;
    }

    // Get all teachers assigned to this course
    const teachers = await Teacher.find({
      'assignedCourses.courseId': new Types.ObjectId(courseId),
      registrationStatus: 'approved'
    }).select('firstName lastName email assignedCourses') as ITeacher[];

    console.log('👨‍🏫 Found teachers for course:', teachers.length);
    teachers.forEach(teacher => {
      console.log('👨‍🏫 Teacher:', {
        name: `${teacher.firstName} ${teacher.lastName}`,
        assignedCourses: teacher.assignedCourses
      });
    });

    // Create a map of subject -> teacher
    const subjectTeacherMap: { [subjectName: string]: { id: string; name: string; email: string } } = {};

    teachers.forEach((teacher: ITeacher) => {
      const teacherName = `${teacher.firstName} ${teacher.lastName}`.trim();
      
      teacher.assignedCourses?.forEach((assignment: any) => {
        if (assignment.courseId.toString() === courseId) {
          subjectTeacherMap[assignment.subject] = {
            id: (teacher._id as any).toString(),
            name: teacherName,
            email: teacher.email
          };
        }
      });
    });

    // Get all subjects from the course and map with teachers
    const subjectsWithTeachers = course.subjects?.map((subject: any) => ({
      subjectName: subject.name,
      teacher: subjectTeacherMap[subject.name] || null // null if no teacher assigned
    })) || [];

    console.log('👨‍🏫 Course teachers fetched:', {
      courseId,
      courseTitle: course.title,
      totalTeachers: teachers.length,
      subjectsWithTeachers: subjectsWithTeachers.length,
      assignedSubjects: subjectsWithTeachers.filter((s: { subjectName: string; teacher: { id: string; name: string; email: string } | null }) => s.teacher !== null).length
    });

    res.json({
      success: true,
      data: {
        courseId,
        courseTitle: course.title,
        subjects: subjectsWithTeachers
      },
      message: "Course teachers retrieved successfully"
    });

  } catch (error) {
    console.error("Error fetching course teachers:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get teacher profile by ID (for students to view teacher info)
export const getTeacherProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { teacherId } = req.params;

    if (!teacherId) {
      res.status(400).json({
        success: false,
        message: "Teacher ID is required"
      });
      return;
    }

    // Get teacher profile (only approved teachers)
    const teacher = await Teacher.findOne({
      _id: teacherId,
      registrationStatus: 'approved'
    }).select('firstName lastName email verificationDocuments assignedCourses') as ITeacher | null;

    if (!teacher) {
      res.status(404).json({
        success: false,
        message: "Teacher not found"
      });
      return;
    }

    // Return teacher profile data for students
    res.json({
      success: true,
      data: {
        teacher: {
          id: (teacher._id as any).toString(),
          name: `${teacher.firstName} ${teacher.lastName}`.trim(),
          email: teacher.email,
          avatar: teacher.verificationDocuments || 'https://randomuser.me/api/portraits/men/32.jpg' // Default avatar
        }
      },
      message: "Teacher profile retrieved successfully"
    });

  } catch (error) {
    console.error("Error fetching teacher profile:", error);
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
    // TODO: Re-enable enrollment check after testing
    // const enrollment = await CourseEnrollment.findOne({ courseId, studentId });
    // if (!enrollment) {
    //   res.status(404).json({ success: false, message: "Enrollment not found" });
    //   return;
    // }

    // For testing, return mock progress data
    res.json({
      success: true,
      data: {
        progress: 0,
        completedLessons: [],
        lastAccessedAt: new Date(),
        moduleProgress: [],
        overallProgress: 0
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
    // TODO: Re-enable enrollment check after testing
    // const enrollment = await CourseEnrollment.findOne({ courseId, studentId });
    // if (!enrollment) {
    //   res.status(404).json({ success: false, message: "Enrollment not found" });
    //   return;
    // }

    // For testing, just return success
    res.json({
      success: true,
      data: {
        progress: 0,
        completedLessons: [],
        moduleProgress: [],
        overallProgress: 0
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

    // TODO: Re-enable enrollment check after testing
    // const enrollment = await CourseEnrollment.findOne({ courseId, studentId });
    // if (!enrollment) {
    //   res.status(404).json({ success: false, message: "Enrollment not found" });
    //   return;
    // }

    // For testing, just return success
    res.json({
      success: true,
      data: {
        progress: 0,
        moduleProgress: [],
        overallProgress: 0
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

    // TODO: Re-enable enrollment check after testing
    // const enrollment = await CourseEnrollment.findOne({ courseId, studentId });
    // if (!enrollment) {
    //   res.status(404).json({ success: false, message: "Enrollment not found" });
    //   return;
    // }

    const moduleNum = parseInt(moduleNumber);
    if (moduleNum < 1 || moduleNum > 5) {
      res.status(400).json({
        success: false,
        message: "Module number must be between 1 and 5"
      });
      return;
    }

    // For testing, return mock progress
    const moduleProgress = {
      videosCompleted: 0,
      notesCompleted: 0,
      quizCompleted: false,
      completed: false
    };

    res.json({
      success: true,
      data: {
        moduleProgress,
        overallProgress: 0
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
    // First try to find a featured course
    let featuredCourse = await Course.findOne({
      isFeatured: true,
      status: 'Published'
    }).sort({ createdAt: -1 });

    // If no featured course exists, return any published course as fallback
    if (!featuredCourse) {
      featuredCourse = await Course.findOne({
        status: 'Published'
      }).sort({ createdAt: -1 });

      if (featuredCourse) {
        console.log('📤 No featured course found, returning fallback course:', featuredCourse.title);
      }
    }

    // If still no courses exist, return a placeholder course to prevent app crashes
    if (!featuredCourse) {
      console.log('📤 No courses found, returning placeholder course');
      const placeholderCourse = {
        _id: 'placeholder-course-id',
        title: 'Welcome to NoteSwift',
        description: 'Get started with our learning platform. Courses will be available soon.',
        subjects: [],
        tags: ['welcome', 'getting-started'],
        status: 'Published',
        type: 'featured',
        price: 0,
        program: 'General',
        duration: 'Self-paced',
        rating: 5.0,
        enrolledCount: 0,
        skills: ['Learning', 'Study Skills'],
        features: ['Interactive Content', 'Progress Tracking'],
        learningPoints: ['Learn at your own pace', 'Track your progress'],
        offeredBy: 'NoteSwift Team',
        courseOverview: 'Welcome to NoteSwift - your learning companion.',
        syllabus: [],
        faq: [],
        icon: '📚',
        thumbnail: '',
        isFeatured: true,
        keyFeatures: ['Free Access', 'Self-paced Learning'],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      res.json({
        success: true,
        data: placeholderCourse,
        message: "Placeholder course returned - no courses available yet",
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

// Generate signed URL for video access
export const getVideoSignedUrl = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId, subjectName, moduleNumber } = req.params;
    const studentId = req.user?.id;

    if (!courseId || !subjectName || !moduleNumber || !studentId) {
      res.status(400).json({
        success: false,
        message: "Course ID, subject name, module number, and authentication required"
      });
      return;
    }

    // TODO: Re-enable enrollment check after testing
    // // Verify student is enrolled in this course
    // const enrollment = await CourseEnrollment.findOne({
    //   courseId: new Types.ObjectId(courseId),
    //   studentId: new Types.ObjectId(studentId),
    //   isActive: true
    // });

    // if (!enrollment) {
    //   res.status(403).json({
    //     success: false,
    //     message: "You are not enrolled in this course"
    //   });
    //   return;
    // }

    // Get subject content to find the video storage path
    const subjectContent = await SubjectContent.findOne({
      courseId: courseId,
      subjectName: { $regex: new RegExp(`^${decodeURIComponent(subjectName).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      isActive: true
    });

    if (!subjectContent) {
      res.status(404).json({
        success: false,
        message: "Subject content not found"
      });
      return;
    }

    // Find the module
    const module = subjectContent.modules.find(m => m.moduleNumber === parseInt(moduleNumber));
    if (!module || !module.hasVideo || !module.videoUrl) {
      res.status(404).json({
        success: false,
        message: "Video not found for this module"
      });
      return;
    }

    // Import FirebaseService dynamically
    const FirebaseService = (await import('../../../../services/firebaseService')).default;

    // Generate signed URL (valid for 20 minutes)
    const signedUrl = await FirebaseService.generateVideoSignedUrl(
      module.videoUrl,
      subjectContent.subjectName,
      20
    );

    res.json({
      success: true,
      data: {
        signedUrl,
        title: module.videoTitle,
        duration: module.videoDuration,
        expiresIn: 20 * 60 * 1000 // 20 minutes in milliseconds
      },
      message: "Video signed URL generated successfully"
    });

  } catch (error) {
    console.error("Error generating video signed URL:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate video access URL"
    });
  }
};

// Generate signed URL for notes access
export const getNotesSignedUrl = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId, subjectName, moduleNumber } = req.params;
    const studentId = req.user?.id;

    if (!courseId || !subjectName || !moduleNumber || !studentId) {
      res.status(400).json({
        success: false,
        message: "Course ID, subject name, module number, and authentication required"
      });
      return;
    }

    // TODO: Re-enable enrollment check after testing
    // // Verify student is enrolled in this course
    // const enrollment = await CourseEnrollment.findOne({
    //   courseId: new Types.ObjectId(courseId),
    //   studentId: new Types.ObjectId(studentId),
    //   isActive: true
    // });

    // if (!enrollment) {
    //   res.status(403).json({
    //     success: false,
    //     message: "You are not enrolled in this course"
    //   });
    //   return;
    // }

    // Get subject content to find the notes storage path
    const subjectContent = await SubjectContent.findOne({
      courseId: courseId,
      subjectName: { $regex: new RegExp(`^${decodeURIComponent(subjectName).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      isActive: true
    });

    if (!subjectContent) {
      res.status(404).json({
        success: false,
        message: "Subject content not found"
      });
      return;
    }

    // Find the module
    const module = subjectContent.modules.find(m => m.moduleNumber === parseInt(moduleNumber));
    if (!module || !module.hasNotes || !module.notesUrl) {
      res.status(404).json({
        success: false,
        message: "Notes not found for this module"
      });
      return;
    }

    // Import FirebaseService dynamically
    const FirebaseService = (await import('../../../../services/firebaseService')).default;

    // Generate signed URL (valid for 20 minutes)
    const signedUrl = await FirebaseService.generateNotesSignedUrl(
      module.notesUrl,
      subjectContent.subjectName,
      20
    );

    res.json({
      success: true,
      data: {
        signedUrl,
        title: module.notesTitle,
        expiresIn: 20 * 60 * 1000 // 20 minutes in milliseconds
      },
      message: "Notes signed URL generated successfully"
    });

  } catch (error) {
    console.error("Error generating notes signed URL:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate notes access URL"
    });
  }
};