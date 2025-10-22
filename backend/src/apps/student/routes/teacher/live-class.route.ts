import { Router } from "express";
import LiveClass from "../../models/LiveClass.model";
import JsonResponse from "../../lib/Response";

const router = Router();

// GET /api/teacher/live-classes?teacherEmail=email&subjectContentId=id&upcoming=boolean
router.get("/", async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const teacher = res.locals.teacher;

    if (!teacher) {
      return jsonResponse.notAuthorized("Teacher not authenticated");
    }

    // Get teacher's assigned courses
    const assignedCourses = teacher.assignedCourses || [];
    const courseIds = assignedCourses.map((ac: any) => ac.courseId);

    // Build query to filter live classes for teacher's courses
    const query: any = {
      courseId: { $in: courseIds }
    };

    // Add additional filters
    if (req.query.upcoming === 'true') {
      query.scheduledAt = { $gt: new Date() };
      query.status = 'scheduled';
    }

    const liveClasses = await LiveClass.find(query).sort({ scheduledAt: 1 });

    // Calculate average attendance from all classes
    const completedClasses = liveClasses.filter(lc => lc.status === 'completed');
    const totalAttended = completedClasses.reduce((sum, lc) => sum + (lc.totalAttended || 0), 0);
    const totalRegistered = completedClasses.reduce((sum, lc) => sum + (lc.totalRegistered || 0), 0);
    const avgAttendance = totalRegistered > 0 ? Math.round((totalAttended / totalRegistered) * 100) : 0;

    // Calculate stats
    const stats = {
      total: liveClasses.length,
      avgAttendance
    };

    jsonResponse.success({
      liveClasses,
      stats
    });

  } catch (error) {
    console.error("Error fetching live classes:", error);
    jsonResponse.serverError("Failed to fetch live classes");
  }
});

export default router;