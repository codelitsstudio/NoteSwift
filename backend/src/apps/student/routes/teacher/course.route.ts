import { Router } from "express";
import SubjectContent from "../../models/SubjectContent.model";
import Course from "../../models/Course.model";
import JsonResponse from "../../lib/Response";

const router = Router();

// GET /api/teacher/courses/subject-content?courseId=id&subjectName=name
router.get("/subject-content", async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const { courseId, subjectName, teacherEmail } = req.query;
    const teacher = res.locals.teacher;

    if (!teacher) {
      return jsonResponse.notAuthorized("Teacher not authenticated");
    }

    let subjectContent;

    // If courseId and subjectName are provided, fetch specific subject content
    if (courseId && subjectName) {
      // Fetch directly from Course collection (same as admin page)
      const course = await Course.findById(courseId);
      if (!course) {
        return jsonResponse.notFound("Course not found");
      }

      // Find the subject in the course (same as admin page)
      const subjectData = course.subjects?.find((s: any) => s.name === subjectName);
      if (!subjectData) {
        return jsonResponse.notFound("Subject not found in course");
      }

      // Check if teacher is assigned to this course
      const isAssigned = teacher.assignedCourses?.some((ac: any) => 
        ac.courseId === courseId && ac.subject === subjectName
      );

      if (!isAssigned) {
        return jsonResponse.clientError("Teacher not assigned to this subject");
      }

      // Build subjectContent from course data (same structure as before)
      subjectContent = {
        _id: `${course._id}_${subjectData.name}`, // Generate a composite ID
        courseId: course._id,
        courseName: course.title,
        courseProgram: course.program || '',
        courseThumbnail: course.thumbnail,
        subjectName: subjectData.name,
        description: subjectData.description,
        syllabus: subjectData.syllabus,
        objectives: subjectData.objectives,
        modules: subjectData.modules?.map((module: any, index: number) => ({
          _id: `${course._id}_${subjectData.name}_${index}`, // Generate module ID
          moduleNumber: index + 1,
          title: module.name || `Module ${index + 1}`,
          description: module.description || '',
          hasVideo: module.hasVideo === true || module.hasVideo === 'true' || false,
          hasNotes: module.hasNotes === true || module.hasNotes === 'true' || false,
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
        lastUpdated: course.updatedAt || new Date(),
        createdAt: course.createdAt || new Date()
      };

      // Calculate stats
      const stats = {
        totalModules: subjectContent.modules.length,
        completedModules: subjectContent.modules.filter((m: any) => m.isActive).length,
        totalContent: subjectContent.modules.filter((m: any) => m.hasVideo || m.hasNotes).length,
        videosUploaded: subjectContent.modules.filter((m: any) => m.hasVideo).length,
        notesUploaded: subjectContent.modules.filter((m: any) => m.hasNotes).length,
        testsCreated: subjectContent.modules.filter((m: any) => m.hasTest).length,
        liveClassesScheduled: subjectContent.modules.reduce((acc: number, m: any) => 
          acc + (m.liveClassSchedule?.length || 0), 0)
      };

      return jsonResponse.success({
        subjectContent,
        course: {
          _id: course._id,
          title: course.title,
          subjectName: course.subject,
          description: course.description,
          program: course.program,
          thumbnail: course.thumbnail
        },
        stats
      });
    }

    // Original logic: Get teacher's assigned courses
    const assignedCourses = teacher.assignedCourses || [];
    if (assignedCourses.length === 0) {
      return jsonResponse.success({
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
      });
    }

    // Find courses that match teacher's assigned courses
    const courseIds = assignedCourses.map((ac: any) => ac.courseId);
    const courses = await Course.find({ _id: { $in: courseIds } });

    if (courses.length === 0) {
      return jsonResponse.success({
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
      });
    }

    // For now, return the first assigned course
    // TODO: Allow teacher to select which course to view
    const course = courses[0];
    
    // Find the subject in the course (same as admin page)
    const subjectData = course.subjects?.find((s: any) => s.name === assignedCourses[0].subject);
    if (subjectData) {
      subjectContent = {
        _id: `${course._id}_${subjectData.name}`, // Generate a composite ID
        courseId: course._id,
        courseName: course.title,
        courseProgram: course.program || '',
        courseThumbnail: course.thumbnail,
        subjectName: subjectData.name,
        description: subjectData.description,
        syllabus: subjectData.syllabus,
        objectives: subjectData.objectives,
        modules: subjectData.modules?.map((module: any, index: number) => ({
          _id: `${course._id}_${subjectData.name}_${index}`, // Generate module ID
          moduleNumber: index + 1,
          title: module.name || `Module ${index + 1}`,
          description: module.description || '',
          hasVideo: module.hasVideo === true || module.hasVideo === 'true' || false,
          hasNotes: module.hasNotes === true || module.hasNotes === 'true' || false,
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
        lastUpdated: course.updatedAt || new Date(),
        createdAt: course.createdAt || new Date()
      };
    }

    // Calculate stats
    let stats = {
      totalModules: 0,
      completedModules: 0,
      totalContent: 0,
      videosUploaded: 0,
      notesUploaded: 0,
      testsCreated: 0,
      liveClassesScheduled: 0
    };

    if (subjectContent) {
      const modules = subjectContent.modules || [];
      stats.totalModules = modules.length;
      stats.completedModules = modules.filter((m: any) => m.isActive).length;
      stats.videosUploaded = modules.filter((m: any) => m.hasVideo).length;
      stats.notesUploaded = modules.filter((m: any) => m.hasNotes).length;
      stats.testsCreated = modules.filter((m: any) => m.hasTest).length;
      stats.liveClassesScheduled = modules.filter((m: any) => m.hasLiveClass).length;
      stats.totalContent = stats.videosUploaded + stats.notesUploaded;
    }

    jsonResponse.success({
      subjectContent,
      course: {
        _id: course._id,
        title: course.title,
        subjectName: course.subject,
        description: course.description,
        program: course.program
      },
      stats
    });

  } catch (error) {
    console.error("Error fetching subject content:", error);
    jsonResponse.serverError("Failed to fetch subject content");
  }
});

// GET /api/teacher/courses/all-subject-content
router.get("/all-subject-content", async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const teacher = res.locals.teacher;
    console.log('🎯 ALL-SUBJECT-CONTENT: Teacher found:', teacher._id, teacher.email);
    console.log('🎯 ALL-SUBJECT-CONTENT: Teacher assignedCourses:', teacher.assignedCourses);

    if (!teacher) {
      return jsonResponse.notAuthorized("Teacher not authenticated");
    }

    // Get teacher's assigned courses
    const assignedCourses = teacher.assignedCourses || [];
    console.log('🎯 ALL-SUBJECT-CONTENT: Assigned courses count:', assignedCourses.length);
    
    if (assignedCourses.length === 0) {
      console.log('🎯 ALL-SUBJECT-CONTENT: No assigned courses, returning empty');
      return jsonResponse.success({
        subjects: [],
        courses: []
      });
    }

    // Fetch all subject content for assigned courses
    const subjects = [];
    const courses = [];

    for (const assignment of assignedCourses) {
      console.log('🎯 ALL-SUBJECT-CONTENT: Processing assignment:', assignment);
      try {
        // Fetch directly from Course collection (same as admin page)
        const course = await Course.findById(assignment.courseId);
        console.log('🎯 ALL-SUBJECT-CONTENT: Course found:', !!course);
        
        if (course) {
          // Find the subject in the course (same as admin page)
          const subjectData = course.subjects?.find((s: any) => s.name === assignment.subject);
          console.log('🎯 ALL-SUBJECT-CONTENT: Subject data found:', !!subjectData);
          
          if (subjectData) {
            console.log('🎯 ALL-SUBJECT-CONTENT: Subject modules:', subjectData.modules?.length || 0);

            subjects.push({
              _id: `${course._id}_${subjectData.name}`, // Generate a composite ID
              courseId: course._id,
              courseName: course.title,
              courseProgram: course.program || '',
              courseThumbnail: course.thumbnail,
              subjectName: subjectData.name,
              description: subjectData.description,
              syllabus: subjectData.syllabus,
              objectives: subjectData.objectives,
              modules: subjectData.modules?.map((module: any, index: number) => ({
                _id: `${course._id}_${subjectData.name}_${index}`, // Generate module ID
                moduleNumber: index + 1,
                title: module.name || `Module ${index + 1}`,
                description: module.description || '',
                hasVideo: module.hasVideo === true || module.hasVideo === 'true' || false,
                hasNotes: module.hasNotes === true || module.hasNotes === 'true' || false,
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
              lastUpdated: course.updatedAt || new Date(),
              assignedAt: assignment.assignedAt,
              totalModules: subjectData.modules?.length || 0,
              modulesWithVideo: subjectData.modules?.filter((m: any) => m.hasVideo).length || 0,
              modulesWithNotes: subjectData.modules?.filter((m: any) => m.hasNotes).length || 0,
              scheduledLiveClasses: subjectData.modules?.reduce((acc: number, m: any) => 
                acc + (m.liveClassSchedule?.length || 0), 0) || 0,
            });

            courses.push({
              _id: course._id,
              title: course.title,
              program: course.program,
              thumbnail: course.thumbnail
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
    
    jsonResponse.success({
      subjects,
      courses
    });

  } catch (error) {
    console.error("Error fetching all subject content:", error);
    jsonResponse.serverError("Failed to fetch subject content");
  }
});

export default router;