import { Router } from "express";
import Test from "../../models/Test.model";
import SubjectContent from "../../models/SubjectContent.model";
import JsonResponse from "../../lib/Response";

const router = Router();

// GET /api/teacher/tests?teacherEmail=email&subjectContentId=id&status=status
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

    const tests = await Test.find(query)
      .sort({ createdAt: -1 })
      .populate('courseId', 'title subject');

    // Calculate stats for dashboard
    const totalTests = tests.length;
    const activeTests = tests.filter(test => test.status === 'active').length;
    const completedTests = tests.filter(test => test.status === 'closed').length;
    const questionBankSize = tests.reduce((sum, test) => sum + test.totalQuestions, 0);
    const completionRate = totalTests > 0
      ? tests.reduce((sum, test) => sum + (test.totalAttempts / Math.max(test.attempts.length, 1) || 0), 0) / totalTests
      : 0;

    jsonResponse.success({
      tests: tests.map(test => ({
        _id: test._id,
        title: test.title,
        description: test.description,
        type: test.type,
        category: test.category,
        status: test.status,
        duration: test.duration,
        totalQuestions: test.totalQuestions,
        totalMarks: test.totalMarks,
        totalAttempts: test.totalAttempts,
        avgScore: test.avgScore,
        passRate: test.passRate,
        courseName: test.courseName,
        subjectName: test.subjectName,
        moduleName: test.moduleName,
        startTime: test.startTime,
        endTime: test.endTime,
        createdAt: test.createdAt,
        updatedAt: test.updatedAt
      })),
      stats: {
        totalTests,
        activeTests,
        completedTests,
        questionBankSize,
        completionRate: Math.round(completionRate * 100)
      }
    });

  } catch (error) {
    console.error("Error fetching tests:", error);
    jsonResponse.serverError("Failed to fetch tests");
  }
});

// POST /api/teacher/tests
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
      type,
      category = 'quiz',
      questions,
      totalMarks,
      passingMarks,
      pdfUrl,
      pdfFileName,
      answerKeyUrl,
      duration,
      startTime,
      endTime,
      allowMultipleAttempts = false,
      maxAttempts = 1,
      showResultsImmediately = true,
      showCorrectAnswers = true,
      shuffleQuestions = false,
      shuffleOptions = false,
      targetAudience = 'all',
      batchIds,
      studentIds
    } = req.body;

    // Validate required fields
    if (!title || !description || !subjectContentId || !type || !duration) {
      return jsonResponse.clientError("Title, description, subjectContentId, type, and duration are required");
    }

    // Get subject content to validate teacher has access
    const subjectContent = await SubjectContent.findOne({
      _id: subjectContentId,
      teacherId: teacher._id
    });

    if (!subjectContent) {
      return jsonResponse.notAuthorized("You don't have access to this subject content");
    }

    const test = new Test({
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
      category,
      questions,
      totalMarks,
      passingMarks,
      pdfUrl,
      pdfFileName,
      answerKeyUrl,
      duration,
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
      allowMultipleAttempts,
      maxAttempts,
      showResultsImmediately,
      showCorrectAnswers,
      shuffleQuestions,
      shuffleOptions,
      targetAudience,
      batchIds,
      studentIds,
      status: 'draft'
    });

    await test.save();

    jsonResponse.success({
      test: {
        _id: test._id,
        title: test.title,
        description: test.description,
        type: test.type,
        category: test.category,
        status: test.status,
        duration: test.duration,
        totalQuestions: test.totalQuestions,
        totalMarks: test.totalMarks,
        courseName: test.courseName,
        subjectName: test.subjectName,
        createdAt: test.createdAt
      }
    }, "Test created successfully");

  } catch (error) {
    console.error("Error creating test:", error);
    jsonResponse.serverError("Failed to create test");
  }
});

// PATCH /api/teacher/tests/:id
router.patch("/:id", async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const { id } = req.params;
    const teacher = res.locals.teacher;

    if (!teacher) {
      return jsonResponse.notAuthorized("Teacher not authenticated");
    }

    const test = await Test.findOne({
      _id: id,
      teacherId: teacher._id,
      isActive: true
    });

    if (!test) {
      return jsonResponse.notFound("Test not found");
    }

    // Don't allow editing active tests
    if (test.status === 'active') {
      return jsonResponse.clientError("Cannot edit active tests");
    }

    const updateFields = [
      'title', 'description', 'instructions', 'type', 'category',
      'questions', 'totalMarks', 'passingMarks', 'pdfUrl', 'pdfFileName',
      'answerKeyUrl', 'duration', 'startTime', 'endTime', 'allowMultipleAttempts',
      'maxAttempts', 'showResultsImmediately', 'showCorrectAnswers',
      'shuffleQuestions', 'shuffleOptions', 'targetAudience', 'batchIds', 'studentIds'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        (test as any)[field] = req.body[field];
      }
    });

    await test.save();

    jsonResponse.success({
      test: {
        _id: test._id,
        title: test.title,
        description: test.description,
        type: test.type,
        status: test.status,
        duration: test.duration,
        totalQuestions: test.totalQuestions,
        totalMarks: test.totalMarks,
        updatedAt: test.updatedAt
      }
    }, "Test updated successfully");

  } catch (error) {
    console.error("Error updating test:", error);
    jsonResponse.serverError("Failed to update test");
  }
});

// GET /api/teacher/tests/:id/attempts?teacherEmail=email
router.get("/:id/attempts", async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const { id } = req.params;
    const { teacherEmail } = req.query;
    const teacher = res.locals.teacher;

    if (!teacher) {
      return jsonResponse.notAuthorized("Teacher not authenticated");
    }

    const test = await Test.findOne({
      _id: id,
      teacherId: teacher._id,
      isActive: true
    });

    if (!test) {
      return jsonResponse.notFound("Test not found");
    }

    jsonResponse.success({
      test: {
        _id: test._id,
        title: test.title,
        totalMarks: test.totalMarks,
        totalQuestions: test.totalQuestions
      },
      attempts: test.attempts.map((attempt: any, index: number) => ({
        _id: attempt._id || `attempt_${index}`,
        studentId: attempt.studentId,
        studentName: attempt.studentName,
        studentEmail: attempt.studentEmail,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        timeSpent: attempt.timeSpent,
        totalScore: attempt.totalScore,
        percentage: attempt.percentage,
        status: attempt.status,
        gradedAt: attempt.gradedAt,
        feedback: attempt.feedback,
        attemptNumber: attempt.attemptNumber
      }))
    });

  } catch (error) {
    console.error("Error fetching test attempts:", error);
    jsonResponse.serverError("Failed to fetch test attempts");
  }
});

// PATCH /api/teacher/tests/:id/attempts/:attemptId/grade
router.patch("/:id/attempts/:attemptId/grade", async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const { id, attemptId } = req.params;
    const { feedback } = req.body;
    const teacher = res.locals.teacher;

    if (!teacher) {
      return jsonResponse.notAuthorized("Teacher not authenticated");
    }

    const test = await Test.findOne({
      _id: id,
      teacherId: teacher._id,
      isActive: true
    });

    if (!test) {
      return jsonResponse.notFound("Test not found");
    }

    // Find the attempt in the array
    const attemptIndex = test.attempts.findIndex((att: any) => att._id?.toString() === attemptId);
    if (attemptIndex === -1) {
      return jsonResponse.notFound("Attempt not found");
    }

    const attempt = test.attempts[attemptIndex] as any;

    // Update grading information
    attempt.feedback = feedback;
    attempt.status = 'evaluated';
    attempt.gradedAt = new Date();
    attempt.gradedBy = teacher._id;

    await test.save();

    jsonResponse.success({
      attempt: {
        _id: attempt._id || `attempt_${attemptIndex}`,
        feedback: attempt.feedback,
        status: attempt.status,
        gradedAt: attempt.gradedAt
      }
    }, "Attempt graded successfully");

  } catch (error) {
    console.error("Error grading attempt:", error);
    jsonResponse.serverError("Failed to grade attempt");
  }
});

// POST /api/teacher/tests/:id/publish
router.post("/:id/publish", async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const { id } = req.params;
    const { teacherEmail } = req.body;
    const teacher = res.locals.teacher;

    if (!teacher) {
      return jsonResponse.notAuthorized("Teacher not authenticated");
    }

    const test = await Test.findOne({
      _id: id,
      teacherId: teacher._id,
      isActive: true
    });

    if (!test) {
      return jsonResponse.notFound("Test not found");
    }

    if (test.status === 'active') {
      return jsonResponse.clientError("Test already published");
    }

    // Update test status
    test.status = 'active';
    await test.save();

    jsonResponse.success({
      test: {
        _id: test._id,
        status: test.status
      }
    }, "Test published successfully");

  } catch (error) {
    console.error("Error publishing test:", error);
    jsonResponse.serverError("Failed to publish test");
  }
});

// DELETE /api/teacher/tests/:id?teacherEmail=email
router.delete("/:id", async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const { id } = req.params;
    const { teacherEmail } = req.query;
    const teacher = res.locals.teacher;

    if (!teacher) {
      return jsonResponse.notAuthorized("Teacher not authenticated");
    }

    const test = await Test.findOne({
      _id: id,
      teacherId: teacher._id,
      isActive: true
    });

    if (!test) {
      return jsonResponse.notFound("Test not found");
    }

    // Don't allow deleting active tests
    if (test.status === 'active') {
      return jsonResponse.clientError("Cannot delete active tests");
    }

    test.isActive = false;
    await test.save();

    jsonResponse.success({ message: "Test deleted successfully" });

  } catch (error) {
    console.error("Error deleting test:", error);
    jsonResponse.serverError("Failed to delete test");
  }
});

export default router;