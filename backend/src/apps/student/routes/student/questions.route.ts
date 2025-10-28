import { Router } from "express";
import { authenticateStudent } from "../../middlewares/student.middleware";
import Question from "../../models/Question.model";
import { Student } from "../../models/students/Student.model";
import Course from "../../models/Course.model";
import SubjectContent from "../../models/SubjectContent.model";
import JsonResponse from "../../lib/Response";
import Teacher from '../../../teacher/models/Teacher.model';

const router = Router();

// Apply student authentication to all routes
router.use(authenticateStudent);

// POST /api/student/questions - Ask a question
router.post("/", async (req, res) => {
  const jsonResponse = new JsonResponse(res);
  try {
    const {
      title,
      questionText,
      subjectContentId,
      courseId,
      subjectName,
      moduleNumber,
      moduleName,
      topicName,
      isAnonymous = false,
      isPublic = true,
      tags = [],
      attachments = []
    } = req.body;

    const student = res.locals.student;
    const studentId = student?._id;
    const studentEmail = student?.email;
    const studentName = student?.full_name;

    if (!studentId || !studentEmail) {
      return jsonResponse.notAuthorized("Student not authenticated");
    }

    if (!title || !questionText || !courseId || !subjectName) {
      return jsonResponse.clientError("Missing required fields: title, questionText, courseId, subjectName");
    }

    // Verify course exists and student is enrolled
    const course = await Course.findById(courseId);
    if (!course) {
      return jsonResponse.notFound("Course not found");
    }

    // If subjectContentId is provided, verify it exists and belongs to the course
    if (subjectContentId) {
      const subjectContent = await SubjectContent.findById(subjectContentId);
      if (!subjectContent) {
        return jsonResponse.notFound("Subject content not found");
      }
      if (subjectContent.courseId?.toString() !== courseId) {
        return jsonResponse.clientError("Subject content does not belong to the specified course");
      }
    }

    // Create the question
    const question = new Question({
      title,
      questionText,
      tags,
      subjectContentId,
      courseId,
      courseName: course.title,
      subjectName,
      moduleNumber,
      moduleName,
      topicName,
      studentId,
      studentName,
      studentEmail,
      isAnonymous,
      isPublic,
      attachments,
      priority: 'medium',
      status: 'pending',
      answers: [],
      views: 0,
      upvotes: [],
      downvotes: [],
      isActive: true
    });

    await question.save();

    // Populate teacher assignment if subjectContent has a teacher
    if (subjectContentId) {
      const subjectContent = await SubjectContent.findById(subjectContentId);
      if (subjectContent?.teacherEmail) {
        question.assignedToTeacherName = subjectContent.teacherEmail;
        await question.save();
      }
    }

    return jsonResponse.success({
      question: {
        _id: question._id,
        title: question.title,
        questionText: question.questionText,
        status: question.status,
        createdAt: question.createdAt
      }
    }, "Question posted successfully");
  } catch (error: any) {
    console.error("Error creating question:", error);
    return jsonResponse.serverError("Failed to create question");
  }
});

// GET /api/student/questions - Get student's questions
router.get("/", async (req, res) => {
  const jsonResponse = new JsonResponse(res);
  try {
    const student = res.locals.student;
    const studentId = student?._id;
    const { status, courseId, subjectName } = req.query;

    if (!studentId) {
      return jsonResponse.notAuthorized("Student not authenticated");
    }

    const query: any = {
      studentId,
      isActive: true
    };

    if (status) query.status = status;
    if (courseId) query.courseId = courseId;
    if (subjectName) query.subjectName = subjectName;

    const questions = await Question.find(query)
      .sort({ createdAt: -1 })
      .populate('courseId', 'title')
      .lean();

    const transformedQuestions = questions.map(q => ({
      _id: q._id,
      title: q.title,
      questionText: q.questionText,
      subjectName: q.subjectName,
      courseName: q.courseName,
      status: q.status,
      priority: q.priority,
      answersCount: q.answers?.length || 0,
      hasAcceptedAnswer: !!q.acceptedAnswerId,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
      tags: q.tags,
      views: q.views
    }));

    return jsonResponse.success({
      questions: transformedQuestions,
      total: transformedQuestions.length
    }, "Questions retrieved successfully");
  } catch (error: any) {
    console.error("Error fetching questions:", error);
    return jsonResponse.serverError("Failed to fetch questions");
  }
});

// GET /api/student/questions/:id - Get single question with answers
router.get("/:id", async (req, res) => {
  const jsonResponse = new JsonResponse(res);
  try {
    const { id } = req.params;
    const student = res.locals.student;
    const studentId = student?._id;

    if (!studentId) {
      return jsonResponse.notAuthorized("Student not authenticated");
    }

    const question = await Question.findById(id).populate('answers.answeredBy', 'fullName email');
    if (!question) {
      console.log('Question not found in DB:', id);
      return jsonResponse.notFound("Question not found");
    }

    console.log('Question found:', question._id, 'Owner:', question.studentId, 'isPublic:', question.isPublic, 'isActive:', question.isActive);

    if (!question.isActive) {
      console.log('Question is soft-deleted:', id);
      return jsonResponse.notFound("Question is deleted");
    }

    if (question.studentId.toString() !== studentId.toString() && !question.isPublic) {
      console.log('Not authorized: question owner', question.studentId, 'requesting student', studentId);
      return jsonResponse.clientError("Not authorized to view this question");
    }

    // Increment view count if not the owner
    if (question.studentId.toString() !== studentId.toString()) {
      question.views += 1;
      await question.save();
    }

    return jsonResponse.success({ question }, "Question retrieved successfully");
  } catch (error: any) {
    console.error("Error fetching question:", error);
    return jsonResponse.serverError("Failed to fetch question");
  }
});

// PATCH /api/student/questions/:id - Update question
router.patch("/:id", async (req, res) => {
  const jsonResponse = new JsonResponse(res);
  try {
    const { id } = req.params;
    const student = res.locals.student;
    const studentId = student?._id;
    const updates = req.body;

    if (!studentId) {
      return jsonResponse.notAuthorized("Student not authenticated");
    }

    const question = await Question.findById(id);
    if (!question) {
      return jsonResponse.notFound("Question not found");
    }

    // Check if student owns this question
    if (question.studentId.toString() !== studentId.toString()) {
      return jsonResponse.clientError("Not authorized to update this question");
    }

    // Prevent updating certain fields
    const allowedUpdates = ['title', 'questionText', 'tags', 'isPublic'];
    const filteredUpdates: any = {};

    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    if (Object.keys(filteredUpdates).length === 0) {
      return jsonResponse.clientError("No valid fields to update");
    }

    filteredUpdates.updatedAt = new Date();

    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      filteredUpdates,
      { new: true }
    );

    return jsonResponse.success({ question: updatedQuestion }, "Question updated successfully");
  } catch (error: any) {
    console.error("Error updating question:", error);
    return jsonResponse.serverError("Failed to update question");
  }
});

// DELETE /api/student/questions/:id - Delete question (soft delete)
router.delete("/:id", async (req, res) => {
  const jsonResponse = new JsonResponse(res);
  try {
    const { id } = req.params;
    const student = res.locals.student;
    const studentId = student?._id;

    if (!studentId) {
      return jsonResponse.notAuthorized("Student not authenticated");
    }

    const question = await Question.findById(id);
    if (!question) {
      return jsonResponse.notFound("Question not found");
    }

    // Check if student owns this question
    if (question.studentId.toString() !== studentId.toString()) {
      return jsonResponse.clientError("Not authorized to delete this question");
    }

    // Soft delete
    question.isActive = false;
    await question.save();

    return jsonResponse.success("Question deleted successfully");
  } catch (error: any) {
    console.error("Error deleting question:", error);
    return jsonResponse.serverError("Failed to delete question");
  }
});

// POST /api/student/questions/:id/upvote - Upvote/downvote question
router.post("/:id/vote", async (req, res) => {
  const jsonResponse = new JsonResponse(res);
  try {
    const { id } = req.params;
    const { voteType } = req.body; // 'upvote' or 'downvote'
    const student = res.locals.student;
    const studentId = student?._id;

    if (!studentId) {
      return jsonResponse.notAuthorized("Student not authenticated");
    }

    if (!['upvote', 'downvote'].includes(voteType)) {
      return jsonResponse.clientError("Invalid vote type");
    }

    const question = await Question.findById(id);
    if (!question) {
      return jsonResponse.notFound("Question not found");
    }

    const studentIdStr = studentId.toString();

    // Remove from opposite vote first
    if (voteType === 'upvote') {
      question.downvotes = question.downvotes.filter(id => id.toString() !== studentIdStr);
      if (!question.upvotes.some(id => id.toString() === studentIdStr)) {
        question.upvotes.push(studentId as any);
      }
    } else {
      question.upvotes = question.upvotes.filter(id => id.toString() !== studentIdStr);
      if (!question.downvotes.some(id => id.toString() === studentIdStr)) {
        question.downvotes.push(studentId as any);
      }
    }

    await question.save();

    return jsonResponse.success({
      upvotes: question.upvotes.length,
      downvotes: question.downvotes.length
    }, "Vote recorded successfully");
  } catch (error: any) {
    console.error("Error recording vote:", error);
    return jsonResponse.serverError("Failed to record vote");
  }
});

export default router;