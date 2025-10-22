import { Router } from "express";
import Assignment from "../../models/Assignment.model";
import SubjectContent from "../../models/SubjectContent.model";
import CourseEnrollment from "../../models/CourseEnrollment";
import JsonResponse from "../../lib/Response";

const router = Router();

// GET /api/teacher/assignments?teacherEmail=email&subjectContentId=id&status=status
router.get("/", async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const { teacherEmail, subjectContentId, status } = req.query;
    const teacher = res.locals.teacher;

    if (!teacher) {
      return jsonResponse.notAuthorized("Teacher not authenticated");
    }

    let query: any = { teacherId: teacher._id, isActive: true };

    // Filter by subject content if provided
    if (subjectContentId) {
      query.subjectContentId = subjectContentId;
    }

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const assignments = await Assignment.find(query)
      .sort({ createdAt: -1 })
      .populate('courseId', 'title subject');

    // Calculate stats for dashboard
    const totalAssignments = assignments.length;
    const activeAssignments = assignments.filter(ass => ass.status === 'active').length;
    const overdueAssignments = assignments.filter(ass =>
      ass.status === 'active' && ass.deadline < new Date()
    ).length;
    const pendingGrading = assignments.reduce((sum, ass) => sum + ass.pendingGrading, 0);
    const submissionRate = totalAssignments > 0
      ? assignments.reduce((sum, ass) => sum + (ass.totalSubmissions / (ass.submissions.length + ass.totalSubmissions) || 0), 0) / totalAssignments
      : 0;

    jsonResponse.success({
      assignments: assignments.map(ass => ({
        _id: ass._id,
        title: ass.title,
        description: ass.description,
        type: ass.type,
        status: ass.status,
        deadline: ass.deadline,
        totalMarks: ass.totalMarks,
        totalSubmissions: ass.totalSubmissions,
        pendingGrading: ass.pendingGrading,
        courseName: ass.courseName,
        subjectName: ass.subjectName,
        moduleName: ass.moduleName,
        createdAt: ass.createdAt,
        updatedAt: ass.updatedAt
      })),
      stats: {
        totalAssignments,
        activeAssignments,
        overdueAssignments,
        pendingGrading,
        submissionRate: Math.round(submissionRate * 100)
      }
    });

  } catch (error) {
    console.error("Error fetching assignments:", error);
    jsonResponse.serverError("Failed to fetch assignments");
  }
});

// POST /api/teacher/assignments
router.post("/", async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const teacher = res.locals.teacher;

    if (!teacher) {
      return jsonResponse.notAuthorized("Teacher not authenticated");
    }

    const {
      title,
      description,
      instructions,
      subjectContentId,
      moduleNumber,
      moduleName,
      type = 'homework',
      totalMarks,
      passingMarks,
      deadline,
      allowLateSubmission = true,
      latePenalty = 10,
      targetAudience = 'all',
      batchIds,
      studentIds,
      attachments,
      allowMultipleAttempts = false,
      maxAttempts = 1,
      requireFile = true,
      requireText = false
    } = req.body;

    // Validate required fields
    if (!title || !description || !subjectContentId || !totalMarks || !deadline) {
      return jsonResponse.clientError("Title, description, subjectContentId, totalMarks, and deadline are required");
    }

    // Get subject content to validate teacher has access
    const subjectContent = await SubjectContent.findOne({
      _id: subjectContentId,
      teacherId: teacher._id
    });

    if (!subjectContent) {
      return jsonResponse.notAuthorized("You don't have access to this subject content");
    }

    const assignment = new Assignment({
      title,
      description,
      instructions,
      subjectContentId,
      courseId: subjectContent.courseId,
      courseName: subjectContent.courseName,
      subjectName: subjectContent.subjectName,
      moduleNumber,
      moduleName,
      teacherId: teacher._id,
      teacherName: teacher.name,
      teacherEmail: teacher.email,
      type,
      totalMarks,
      passingMarks,
      assignedDate: new Date(),
      deadline: new Date(deadline),
      allowLateSubmission,
      latePenalty,
      targetAudience,
      batchIds,
      studentIds,
      attachments,
      allowMultipleAttempts,
      maxAttempts,
      requireFile,
      requireText,
      status: 'draft'
    });

    await assignment.save();

    jsonResponse.success({
      assignment: {
        _id: assignment._id,
        title: assignment.title,
        description: assignment.description,
        type: assignment.type,
        status: assignment.status,
        deadline: assignment.deadline,
        totalMarks: assignment.totalMarks,
        courseName: assignment.courseName,
        subjectName: assignment.subjectName,
        createdAt: assignment.createdAt
      }
    }, "Assignment created successfully");

  } catch (error) {
    console.error("Error creating assignment:", error);
    jsonResponse.serverError("Failed to create assignment");
  }
});

// PATCH /api/teacher/assignments/:id
router.patch("/:id", async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const { id } = req.params;
    const teacher = res.locals.teacher;

    if (!teacher) {
      return jsonResponse.notAuthorized("Teacher not authenticated");
    }

    const assignment = await Assignment.findOne({
      _id: id,
      teacherId: teacher._id,
      isActive: true
    });

    if (!assignment) {
      return jsonResponse.notFound("Assignment not found");
    }

    // Don't allow editing active assignments
    if (assignment.status === 'active') {
      return jsonResponse.clientError("Cannot edit active assignments");
    }

    const updateFields = [
      'title', 'description', 'instructions', 'type', 'totalMarks',
      'passingMarks', 'deadline', 'allowLateSubmission', 'latePenalty',
      'targetAudience', 'batchIds', 'studentIds', 'attachments',
      'allowMultipleAttempts', 'maxAttempts', 'requireFile', 'requireText'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        (assignment as any)[field] = req.body[field];
      }
    });

    await assignment.save();

    jsonResponse.success({
      assignment: {
        _id: assignment._id,
        title: assignment.title,
        description: assignment.description,
        type: assignment.type,
        status: assignment.status,
        deadline: assignment.deadline,
        totalMarks: assignment.totalMarks,
        updatedAt: assignment.updatedAt
      }
    }, "Assignment updated successfully");

  } catch (error) {
    console.error("Error updating assignment:", error);
    jsonResponse.serverError("Failed to update assignment");
  }
});

// GET /api/teacher/assignments/:id/submissions?teacherEmail=email
router.get("/:id/submissions", async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const { id } = req.params;
    const { teacherEmail } = req.query;
    const teacher = res.locals.teacher;

    if (!teacher) {
      return jsonResponse.notAuthorized("Teacher not authenticated");
    }

    const assignment = await Assignment.findOne({
      _id: id,
      teacherId: teacher._id,
      isActive: true
    });

    if (!assignment) {
      return jsonResponse.notFound("Assignment not found");
    }

    jsonResponse.success({
      assignment: {
        _id: assignment._id,
        title: assignment.title,
        totalMarks: assignment.totalMarks
      },
      submissions: assignment.submissions.map((sub: any, index: number) => ({
        _id: sub._id || `submission_${index}`,
        studentId: sub.studentId,
        studentName: sub.studentName,
        studentEmail: sub.studentEmail,
        submittedAt: sub.submittedAt,
        fileUrl: sub.fileUrl,
        fileName: sub.fileName,
        textAnswer: sub.textAnswer,
        status: sub.status,
        score: sub.score,
        feedback: sub.feedback,
        gradedAt: sub.gradedAt,
        isLate: sub.isLate,
        attemptNumber: sub.attemptNumber
      }))
    });

  } catch (error) {
    console.error("Error fetching assignment submissions:", error);
    jsonResponse.serverError("Failed to fetch assignment submissions");
  }
});

// PATCH /api/teacher/assignments/:id/submissions/:submissionId/grade
router.patch("/:id/submissions/:submissionId/grade", async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const { id, submissionId } = req.params;
    const { score, feedback } = req.body;
    const teacher = res.locals.teacher;

    if (!teacher) {
      return jsonResponse.notAuthorized("Teacher not authenticated");
    }

    const assignment = await Assignment.findOne({
      _id: id,
      teacherId: teacher._id,
      isActive: true
    });

    if (!assignment) {
      return jsonResponse.notFound("Assignment not found");
    }

    // Find the submission in the array
    const submissionIndex = assignment.submissions.findIndex((sub: any) => sub._id?.toString() === submissionId);
    if (submissionIndex === -1) {
      return jsonResponse.notFound("Submission not found");
    }

    const submission = assignment.submissions[submissionIndex] as any;

    // Update grading information
    submission.score = score;
    submission.feedback = feedback;
    submission.status = 'graded';
    submission.gradedAt = new Date();
    submission.gradedBy = teacher._id;

    await assignment.save();

    jsonResponse.success({
      submission: {
        _id: submission._id || `submission_${submissionIndex}`,
        score: submission.score,
        feedback: submission.feedback,
        status: submission.status,
        gradedAt: submission.gradedAt
      }
    }, "Submission graded successfully");

  } catch (error) {
    console.error("Error grading submission:", error);
    jsonResponse.serverError("Failed to grade submission");
  }
});

// POST /api/teacher/assignments/:id/publish
router.post("/:id/publish", async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const { id } = req.params;
    const { teacherEmail } = req.body;
    const teacher = res.locals.teacher;

    if (!teacher) {
      return jsonResponse.notAuthorized("Teacher not authenticated");
    }

    const assignment = await Assignment.findOne({
      _id: id,
      teacherId: teacher._id,
      isActive: true
    });

    if (!assignment) {
      return jsonResponse.notFound("Assignment not found");
    }

    if (assignment.status === 'active') {
      return jsonResponse.clientError("Assignment already published");
    }

    // Update assignment status
    assignment.status = 'active';
    await assignment.save();

    jsonResponse.success({
      assignment: {
        _id: assignment._id,
        status: assignment.status
      }
    }, "Assignment published successfully");

  } catch (error) {
    console.error("Error publishing assignment:", error);
    jsonResponse.serverError("Failed to publish assignment");
  }
});

// DELETE /api/teacher/assignments/:id?teacherEmail=email
router.delete("/:id", async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const { id } = req.params;
    const { teacherEmail } = req.query;
    const teacher = res.locals.teacher;

    if (!teacher) {
      return jsonResponse.notAuthorized("Teacher not authenticated");
    }

    const assignment = await Assignment.findOne({
      _id: id,
      teacherId: teacher._id,
      isActive: true
    });

    if (!assignment) {
      return jsonResponse.notFound("Assignment not found");
    }

    // Don't allow deleting active assignments
    if (assignment.status === 'active') {
      return jsonResponse.clientError("Cannot delete active assignments");
    }

    assignment.isActive = false;
    await assignment.save();

    jsonResponse.success({ message: "Assignment deleted successfully" });

  } catch (error) {
    console.error("Error deleting assignment:", error);
    jsonResponse.serverError("Failed to delete assignment");
  }
});

export default router;