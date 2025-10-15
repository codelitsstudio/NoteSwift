import { Request, Response } from "express";
import Course from "../models/Course.model";
import CourseEnrollment from "../models/CourseEnrollment";
import SubjectContent from "../models/SubjectContent.model";
import { Types } from "mongoose";

interface AuthRequest extends Request {
  user?: {
    id: string;
    role?: string;
  };
}

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
