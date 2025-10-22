import { Router } from "express";
import Announcement from "../../models/Announcement.model";
import SubjectContent from "../../models/SubjectContent.model";
import CourseEnrollment from "../../models/CourseEnrollment";
import JsonResponse from "../../lib/Response";

const router = Router();

// GET /api/teacher/announcements?teacherEmail=email&subjectContentId=id
router.get("/", async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const { teacherEmail, subjectContentId } = req.query;
    const teacher = res.locals.teacher;

    if (!teacher) {
      return jsonResponse.notAuthorized("Teacher not authenticated");
    }

    let query: any = { teacherId: teacher._id, isActive: true };

    // Filter by subject content if provided
    if (subjectContentId) {
      query.subjectContentId = subjectContentId;
    }

    const announcements = await Announcement.find(query)
      .sort({ createdAt: -1 })
      .populate('courseId', 'title subject')
      .populate('subjectContentId', 'title');

    // Calculate stats for dashboard
    const totalAnnouncements = announcements.length;
    const sentThisMonth = announcements.filter(ann =>
      ann.status === 'sent' &&
      ann.sentAt &&
      new Date(ann.sentAt).getMonth() === new Date().getMonth() &&
      new Date(ann.sentAt).getFullYear() === new Date().getFullYear()
    ).length;

    const avgReadRate = totalAnnouncements > 0
      ? announcements.reduce((sum, ann) => sum + (ann.readCount / ann.totalRecipients || 0), 0) / totalAnnouncements
      : 0;

    const scheduled = announcements.filter(ann => ann.status === 'scheduled').length;

    jsonResponse.success({
      announcements: announcements.map(ann => ({
        _id: ann._id,
        title: ann.title,
        message: ann.message,
        priority: ann.priority,
        status: ann.status,
        scheduledFor: ann.scheduledFor,
        sentAt: ann.sentAt,
        totalRecipients: ann.totalRecipients,
        readCount: ann.readCount,
        courseName: ann.courseName,
        subjectName: ann.subjectName,
        createdAt: ann.createdAt,
        updatedAt: ann.updatedAt
      })),
      stats: {
        totalAnnouncements,
        sentThisMonth,
        avgReadRate: Math.round(avgReadRate * 100),
        scheduled
      }
    });

  } catch (error) {
    console.error("Error fetching announcements:", error);
    jsonResponse.serverError("Failed to fetch announcements");
  }
});

// POST /api/teacher/announcements
router.post("/", async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const teacher = res.locals.teacher;

    if (!teacher) {
      return jsonResponse.notAuthorized("Teacher not authenticated");
    }

    const {
      title,
      message,
      priority = 'medium',
      subjectContentId,
      targetAudience = 'all',
      batchIds,
      studentIds,
      scheduledFor
    } = req.body;

    // Validate required fields
    if (!title || !message || !subjectContentId) {
      return jsonResponse.clientError("Title, message, and subjectContentId are required");
    }

    // Get subject content to validate teacher has access
    const subjectContent = await SubjectContent.findOne({
      _id: subjectContentId,
      teacherId: teacher._id
    });

    if (!subjectContent) {
      return jsonResponse.notAuthorized("You don't have access to this subject content");
    }

    // Calculate total recipients based on target audience
    let totalRecipients = 0;
    if (targetAudience === 'all') {
      // Count all enrolled students in this course
      const enrollments = await CourseEnrollment.find({ courseId: subjectContent.courseId });
      totalRecipients = enrollments.length;
    } else if (targetAudience === 'batch' && batchIds?.length > 0) {
      // Count students in specified batches
      // This would need batch-student relationship, for now use enrolled students
      const enrollments = await CourseEnrollment.find({ courseId: subjectContent.courseId });
      totalRecipients = enrollments.length;
    } else if (targetAudience === 'specific' && studentIds?.length > 0) {
      totalRecipients = studentIds.length;
    }

    const announcement = new Announcement({
      title,
      message,
      priority,
      subjectContentId,
      courseId: subjectContent.courseId,
      courseName: subjectContent.courseName,
      subjectName: subjectContent.subjectName,
      teacherId: teacher._id,
      teacherName: teacher.name,
      teacherEmail: teacher.email,
      targetAudience,
      batchIds,
      studentIds,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      status: scheduledFor ? 'scheduled' : 'draft',
      totalRecipients
    });

    await announcement.save();

    jsonResponse.success({
      announcement: {
        _id: announcement._id,
        title: announcement.title,
        message: announcement.message,
        priority: announcement.priority,
        status: announcement.status,
        scheduledFor: announcement.scheduledFor,
        totalRecipients: announcement.totalRecipients,
        courseName: announcement.courseName,
        subjectName: announcement.subjectName,
        createdAt: announcement.createdAt
      }
    }, "Announcement created successfully");

  } catch (error) {
    console.error("Error creating announcement:", error);
    jsonResponse.serverError("Failed to create announcement");
  }
});

// PATCH /api/teacher/announcements/:id
router.patch("/:id", async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const { id } = req.params;
    const teacher = res.locals.teacher;

    if (!teacher) {
      return jsonResponse.notAuthorized("Teacher not authenticated");
    }

    const announcement = await Announcement.findOne({
      _id: id,
      teacherId: teacher._id,
      isActive: true
    });

    if (!announcement) {
      return jsonResponse.notFound("Announcement not found");
    }

    // Don't allow editing sent announcements
    if (announcement.status === 'sent') {
      return jsonResponse.clientError("Cannot edit sent announcements");
    }

    const updateFields = [
      'title', 'message', 'priority', 'targetAudience',
      'batchIds', 'studentIds', 'scheduledFor'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        (announcement as any)[field] = req.body[field];
      }
    });

    // Update status if scheduledFor changed
    if (req.body.scheduledFor) {
      announcement.status = 'scheduled';
    } else if (!announcement.scheduledFor) {
      announcement.status = 'draft';
    }

    await announcement.save();

    jsonResponse.success({
      announcement: {
        _id: announcement._id,
        title: announcement.title,
        message: announcement.message,
        priority: announcement.priority,
        status: announcement.status,
        scheduledFor: announcement.scheduledFor,
        totalRecipients: announcement.totalRecipients,
        updatedAt: announcement.updatedAt
      }
    }, "Announcement updated successfully");

  } catch (error) {
    console.error("Error updating announcement:", error);
    jsonResponse.serverError("Failed to update announcement");
  }
});

// POST /api/teacher/announcements/:id/send
router.post("/:id/send", async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const { id } = req.params;
    const { teacherEmail } = req.body;
    const teacher = res.locals.teacher;

    if (!teacher) {
      return jsonResponse.notAuthorized("Teacher not authenticated");
    }

    const announcement = await Announcement.findOne({
      _id: id,
      teacherId: teacher._id,
      isActive: true
    });

    if (!announcement) {
      return jsonResponse.notFound("Announcement not found");
    }

    if (announcement.status === 'sent') {
      return jsonResponse.clientError("Announcement already sent");
    }

    // Update announcement status
    announcement.status = 'sent';
    announcement.sentAt = new Date();
    await announcement.save();

    // TODO: Implement actual notification sending logic here
    // This would involve sending push notifications, emails, etc.

    jsonResponse.success({
      announcement: {
        _id: announcement._id,
        status: announcement.status,
        sentAt: announcement.sentAt
      }
    }, "Announcement sent successfully");

  } catch (error) {
    console.error("Error sending announcement:", error);
    jsonResponse.serverError("Failed to send announcement");
  }
});

// DELETE /api/teacher/announcements/:id?teacherEmail=email
router.delete("/:id", async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const { id } = req.params;
    const { teacherEmail } = req.query;
    const teacher = res.locals.teacher;

    if (!teacher) {
      return jsonResponse.notAuthorized("Teacher not authenticated");
    }

    const announcement = await Announcement.findOne({
      _id: id,
      teacherId: teacher._id,
      isActive: true
    });

    if (!announcement) {
      return jsonResponse.notFound("Announcement not found");
    }

    // Don't allow deleting sent announcements
    if (announcement.status === 'sent') {
      return jsonResponse.clientError("Cannot delete sent announcements");
    }

    announcement.isActive = false;
    await announcement.save();

    jsonResponse.success({ message: "Announcement deleted successfully" });

  } catch (error) {
    console.error("Error deleting announcement:", error);
    jsonResponse.serverError("Failed to delete announcement");
  }
});

export default router;