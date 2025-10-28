import { Router } from "express";
import Question from "../../models/Question.model";
import SubjectContent from "../../models/SubjectContent.model";
import { Student } from "../../models/students/Student.model";
import JsonResponse from "../../lib/Response";
import { pushNotificationService } from "../../../../services/pushNotificationService";

const router = Router();

// GET /api/teacher/questions?teacherEmail=email&status=status&priority=priority
router.get("/", async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const { teacherEmail, status, priority } = req.query;
    const teacher = res.locals.teacher;

    if (!teacher) {
      return jsonResponse.notAuthorized("Teacher not authenticated");
    }

    // Get teacher's assigned courses
    const assignedCourses = teacher.assignedCourses || [];
    const courseIds = assignedCourses.map((ac: any) => ac.courseId);

    let query: any = {
      courseId: { $in: courseIds },
      isActive: true
    };

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Filter by priority if provided
    if (priority) {
      query.priority = priority;
    }

    const questions = await Question.find(query)
      .sort({ createdAt: -1 })
      .populate('courseId', 'title subject')
      .populate('studentId', 'firstName lastName email')
      .populate('assignedToTeacherId', 'name email');

    // Calculate stats for dashboard
    const totalQuestions = questions.length;
    const openQuestions = questions.filter(q => q.status === 'pending' || q.status === 'answered').length;
    const resolvedToday = questions.filter(q =>
      q.status === 'resolved' &&
      q.resolvedAt &&
      new Date(q.resolvedAt).toDateString() === new Date().toDateString()
    ).length;

    const avgResponseTime = totalQuestions > 0
      ? questions.reduce((sum, q) => {
          if (q.answers.length > 0) {
            const firstAnswer = q.answers.sort((a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            )[0];
            const responseTime = new Date(firstAnswer.createdAt).getTime() - new Date(q.createdAt).getTime();
            return sum + (responseTime / (1000 * 60 * 60)); // Convert to hours
          }
          return sum;
        }, 0) / totalQuestions
      : 0;

    jsonResponse.success({
      questions: questions.map(q => ({
        _id: q._id,
        title: q.title,
        questionText: q.questionText,
        priority: q.priority,
        status: q.status,
        courseName: q.courseName,
        subjectName: q.subjectName,
        moduleName: q.moduleName,
        studentName: q.isAnonymous ? 'Anonymous' : q.studentName,
        studentEmail: q.isAnonymous ? null : q.studentEmail,
        answersCount: q.answers.length,
        views: q.views,
        createdAt: q.createdAt,
        updatedAt: q.updatedAt,
        assignedToTeacherName: q.assignedToTeacherName
      })),
      stats: {
        totalQuestions,
        openQuestions,
        resolvedToday,
        avgResponseTime: Math.round(avgResponseTime * 10) / 10 // Round to 1 decimal
      }
    });

  } catch (error) {
    console.error("Error fetching questions:", error);
    jsonResponse.serverError("Failed to fetch questions");
  }
});

// GET /api/teacher/questions/:id?teacherEmail=email
router.get("/:id", async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const { id } = req.params;
    const { teacherEmail } = req.query;
    const teacher = res.locals.teacher;

    if (!teacher) {
      return jsonResponse.notAuthorized("Teacher not authenticated");
    }

    // Get teacher's assigned courses
    const assignedCourses = teacher.assignedCourses || [];
    const courseIds = assignedCourses.map((ac: any) => ac.courseId);

    const question = await Question.findOne({
      _id: id,
      courseId: { $in: courseIds },
      isActive: true
    })
    .populate('courseId', 'title subject')
    .populate('studentId', 'firstName lastName email')
    .populate('assignedToTeacherId', 'name email');

    if (!question) {
      return jsonResponse.notFound("Question not found");
    }

    // Increment view count
    question.views += 1;
    await question.save();

    jsonResponse.success({
      question: {
        _id: question._id,
        title: question.title,
        questionText: question.questionText,
        tags: question.tags,
        priority: question.priority,
        status: question.status,
        courseName: question.courseName,
        subjectName: question.subjectName,
        moduleName: question.moduleName,
        topicName: question.topicName,
        studentName: question.isAnonymous ? 'Anonymous' : question.studentName,
        studentEmail: question.isAnonymous ? null : question.studentEmail,
        isAnonymous: question.isAnonymous,
        attachments: question.attachments,
        answers: question.answers.map((answer: any, index: number) => ({
          _id: answer._id || `answer_${index}`,
          answeredBy: answer.answeredBy,
          answeredByName: answer.answeredByName,
          answeredByRole: answer.answeredByRole,
          answerText: answer.answerText,
          attachments: answer.attachments,
          isAccepted: answer.isAccepted,
          upvotes: answer.upvotes.length,
          downvotes: answer.downvotes.length,
          createdAt: answer.createdAt,
          updatedAt: answer.updatedAt
        })),
        acceptedAnswerId: question.acceptedAnswerId,
        assignedToTeacherName: question.assignedToTeacherName,
        views: question.views,
        upvotes: question.upvotes.length,
        downvotes: question.downvotes.length,
        createdAt: question.createdAt,
        updatedAt: question.updatedAt
      }
    });

  } catch (error) {
    console.error("Error fetching question:", error);
    jsonResponse.serverError("Failed to fetch question");
  }
});

// POST /api/teacher/questions/:id/answer
router.post("/:id/answer", async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const { id } = req.params;
    const { answerText, attachments } = req.body;
    const teacher = res.locals.teacher;

    if (!teacher) {
      return jsonResponse.notAuthorized("Teacher not authenticated");
    }

    // Get teacher's assigned courses
    const assignedCourses = teacher.assignedCourses || [];
    const courseIds = assignedCourses.map((ac: any) => ac.courseId);

    const question = await Question.findOne({
      _id: id,
      courseId: { $in: courseIds },
      isActive: true
    });

    if (!question) {
      return jsonResponse.notFound("Question not found");
    }

    if (!answerText) {
      return jsonResponse.clientError("Answer text is required");
    }

    // Add answer
    const newAnswer = {
      answeredBy: teacher._id,
      answeredByName: teacher.name,
      answeredByRole: 'teacher',
      answerText,
      attachments,
      isAccepted: false,
      upvotes: [],
      downvotes: []
    };

    question.answers.push(newAnswer as any);

    // Update question status if it was pending
    if (question.status === 'pending') {
      question.status = 'answered';
    }

    await question.save();

    // Send push notification to student
    try {
      const student = await Student.findById(question.studentId);
      if (student && student.pushToken) {
        await pushNotificationService.sendPushNotification(
          student.pushToken,
          "Question Answered",
          `Your question "${question.title.length > 50 ? question.title.substring(0, 50) + '...' : question.title}" has been answered by ${teacher.name}`,
          {
            type: 'question_answered',
            questionId: question._id,
            teacherName: teacher.name
          }
        );
        console.log(`Push notification sent to student ${student._id} for answered question ${question._id}`);
      }
    } catch (notificationError) {
      console.error('Error sending push notification:', notificationError);
      // Don't fail the request if notification fails
    }

    jsonResponse.success({
      answer: {
        _id: (question.answers[question.answers.length - 1] as any)._id,
        answeredBy: teacher._id,
        answeredByName: teacher.name,
        answeredByRole: 'teacher',
        answerText,
        attachments,
        isAccepted: false,
        upvotes: 0,
        downvotes: 0,
        createdAt: new Date()
      }
    }, "Answer posted successfully");

  } catch (error) {
    console.error("Error posting answer:", error);
    jsonResponse.serverError("Failed to post answer");
  }
});

// PATCH /api/teacher/questions/:id/priority
router.patch("/:id/priority", async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const { id } = req.params;
    const { priority, teacherEmail } = req.body;
    const teacher = res.locals.teacher;

    if (!teacher) {
      return jsonResponse.notAuthorized("Teacher not authenticated");
    }

    // Get teacher's assigned courses
    const assignedCourses = teacher.assignedCourses || [];
    const courseIds = assignedCourses.map((ac: any) => ac.courseId);

    const question = await Question.findOne({
      _id: id,
      courseId: { $in: courseIds },
      isActive: true
    });

    if (!question) {
      return jsonResponse.notFound("Question not found");
    }

    if (!['low', 'medium', 'high'].includes(priority)) {
      return jsonResponse.clientError("Invalid priority value");
    }

    question.priority = priority;
    await question.save();

    jsonResponse.success({
      question: {
        _id: question._id,
        priority: question.priority
      }
    }, "Question priority updated successfully");

  } catch (error) {
    console.error("Error updating question priority:", error);
    jsonResponse.serverError("Failed to update question priority");
  }
});

// PATCH /api/teacher/questions/:id/resolve
router.patch("/:id/resolve", async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const { id } = req.params;
    const { teacherEmail } = req.body;
    const teacher = res.locals.teacher;

    if (!teacher) {
      return jsonResponse.notAuthorized("Teacher not authenticated");
    }

    // Get teacher's assigned courses
    const assignedCourses = teacher.assignedCourses || [];
    const courseIds = assignedCourses.map((ac: any) => ac.courseId);

    const question = await Question.findOne({
      _id: id,
      courseId: { $in: courseIds },
      isActive: true
    });

    if (!question) {
      return jsonResponse.notFound("Question not found");
    }

    question.status = 'resolved';
    question.resolvedAt = new Date();
    question.resolvedBy = teacher._id;
    await question.save();

    jsonResponse.success({
      question: {
        _id: question._id,
        status: question.status,
        resolvedAt: question.resolvedAt
      }
    }, "Question resolved successfully");

  } catch (error) {
    console.error("Error resolving question:", error);
    jsonResponse.serverError("Failed to resolve question");
  }
});

// PATCH /api/teacher/questions/:id/answers/:answerId/accept
router.patch("/:id/answers/:answerId/accept", async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const { id, answerId } = req.params;
    const { teacherEmail } = req.body;
    const teacher = res.locals.teacher;

    if (!teacher) {
      return jsonResponse.notAuthorized("Teacher not authenticated");
    }

    // Get teacher's assigned courses
    const assignedCourses = teacher.assignedCourses || [];
    const courseIds = assignedCourses.map((ac: any) => ac.courseId);

    const question = await Question.findOne({
      _id: id,
      courseId: { $in: courseIds },
      isActive: true
    });

    if (!question) {
      return jsonResponse.notFound("Question not found");
    }

    // Find the answer in the array
    const answerIndex = question.answers.findIndex((ans: any) => ans._id?.toString() === answerId);
    if (answerIndex === -1) {
      return jsonResponse.notFound("Answer not found");
    }

    const answer = question.answers[answerIndex] as any;

    // Remove previous accepted answer
    question.answers.forEach((ans: any) => {
      ans.isAccepted = false;
    });

    // Accept this answer
    answer.isAccepted = true;
    question.acceptedAnswerId = answer._id;
    question.status = 'resolved';
    question.resolvedAt = new Date();
    question.resolvedBy = teacher._id;

    await question.save();

    jsonResponse.success({
      answer: {
        _id: answer._id || `answer_${answerIndex}`,
        isAccepted: answer.isAccepted
      },
      question: {
        _id: question._id,
        acceptedAnswerId: question.acceptedAnswerId,
        status: question.status,
        resolvedAt: question.resolvedAt
      }
    }, "Answer accepted successfully");

  } catch (error) {
    console.error("Error accepting answer:", error);
    jsonResponse.serverError("Failed to accept answer");
  }
});

// DELETE /api/teacher/questions/:id?teacherEmail=email
router.delete("/:id", async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const { id } = req.params;
    const { teacherEmail } = req.query;
    const teacher = res.locals.teacher;

    if (!teacher) {
      return jsonResponse.notAuthorized("Teacher not authenticated");
    }

    // Get teacher's assigned courses
    const assignedCourses = teacher.assignedCourses || [];
    const courseIds = assignedCourses.map((ac: any) => ac.courseId);

    const question = await Question.findOne({
      _id: id,
      courseId: { $in: courseIds },
      isActive: true
    });

    if (!question) {
      return jsonResponse.notFound("Question not found");
    }

    question.isActive = false;
    await question.save();

    jsonResponse.success({ message: "Question deleted successfully" });

  } catch (error) {
    console.error("Error deleting question:", error);
    jsonResponse.serverError("Failed to delete question");
  }
});

export default router;