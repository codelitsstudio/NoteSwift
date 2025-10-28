import { Router } from "express";
import Test, { ITestAttempt } from "../../models/Test.model";
import { Student } from "../../models/students/Student.model";
import CourseEnrollment from "../../models/CourseEnrollment";
import JsonResponse from "../../lib/Response";

const router = Router();

// GET /api/student/tests - Get student's available tests
router.get("/", async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const student = res.locals.student;

    if (!student) {
      return jsonResponse.notAuthorized("Student not authenticated");
    }

    // Get student's enrolled courses with module progress
    const enrollments = await CourseEnrollment.find({
      studentId: student._id,
      isActive: true
    }).populate('courseId');

    console.log('📚 Student enrollments found:', enrollments.length);
    console.log('📚 Student ID:', student._id);
    console.log('📚 Enrollments:', enrollments.map(e => ({ courseId: e.courseId, courseName: (e.courseId as any)?.title })));

    // Get enrolled course IDs
    const enrolledCourseIds = enrollments.map((e: any) => e.courseId._id || e.courseId);

    console.log('📚 Enrolled course IDs:', enrolledCourseIds);

    // Get active tests for enrolled courses, filtered by modules the student has access to
    const tests = await Test.find({
      courseId: { $in: enrolledCourseIds },
      status: 'active',
      isActive: true
    }).populate('subjectContentId', 'subjectName modules.moduleNumber modules.moduleName')
      .sort({ createdAt: -1 });

    console.log('📚 Tests found in database:', tests.length);
    console.log('📚 Test details:', tests.map(t => ({ 
      title: t.title, 
      courseId: t.courseId, 
      courseName: t.courseName,
      status: t.status,
      isActive: t.isActive
    })));

    // Filter tests based on module access and other criteria
    const availableTests = tests.filter(test => {
      // Check if test is within time limits
      const now = new Date();
      if (test.startTime && now < test.startTime) return false;
      if (test.endTime && now > test.endTime) return false;

      // Check if student has access to this module
      // Students enrolled in a course have access to all modules in that course
      const enrollment = enrollments.find((e: any) =>
        (e.courseId._id || e.courseId).toString() === test.courseId.toString()
      );

      if (!enrollment) return false;

      // For now, allow access to all modules in enrolled courses
      // TODO: Add module-specific access control if needed
      return true;
    });

    // Add attempt information for each test
    const testsWithAttempts = availableTests.map(test => {
      const studentAttempt = test.attempts.find((attempt: any) =>
        attempt.studentId.toString() === student._id.toString()
      );

      const result = {
        _id: test._id,
        title: test.title,
        description: test.description,
        type: test.type,
        category: test.category,
        duration: test.duration,
        totalMarks: test.totalMarks,
        passingMarks: test.passingMarks,
        totalQuestions: test.totalQuestions,
        courseName: test.courseName,
        subjectName: test.subjectName,
        moduleName: test.moduleName,
        startTime: test.startTime,
        endTime: test.endTime,
        allowMultipleAttempts: test.allowMultipleAttempts,
        maxAttempts: test.maxAttempts,
        showResultsImmediately: test.showResultsImmediately,
        instructions: test.instructions,
        attemptInfo: studentAttempt ? {
          attemptNumber: studentAttempt.attemptNumber,
          status: studentAttempt.status,
          startedAt: studentAttempt.startedAt,
          submittedAt: studentAttempt.submittedAt,
          totalScore: studentAttempt.totalScore,
          percentage: studentAttempt.percentage,
          timeSpent: studentAttempt.timeSpent
        } : null,
        canAttempt: !studentAttempt ||
          (test.allowMultipleAttempts &&
           (!test.maxAttempts || studentAttempt.attemptNumber < test.maxAttempts) &&
           studentAttempt.status === 'submitted')
      };

      console.log(`📝 Test ${test._id}: attemptInfo=${!!result.attemptInfo}, status=${result.attemptInfo?.status}, canAttempt=${result.canAttempt}, allowMultiple=${test.allowMultipleAttempts}`);

      return result;
    });

    jsonResponse.success({
      tests: testsWithAttempts,
      stats: {
        total: testsWithAttempts.length,
        available: testsWithAttempts.filter(t => t.canAttempt).length,
        completed: testsWithAttempts.filter(t => t.attemptInfo?.status === 'submitted' || t.attemptInfo?.status === 'evaluated').length,
        inProgress: testsWithAttempts.filter(t => t.attemptInfo?.status === 'in-progress').length
      }
    });

  } catch (error) {
    console.error("Error fetching student tests:", error);
    jsonResponse.serverError("Failed to fetch tests");
  }
});

// GET /api/student/tests/:id - Get test details for taking
router.get("/:id", async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const { id } = req.params;
    const student = res.locals.student;

    if (!student) {
      return jsonResponse.notAuthorized("Student not authenticated");
    }

    const test = await Test.findOne({
      _id: id,
      status: 'active',
      isActive: true
    });

    if (!test) {
      return jsonResponse.notFound("Test not found");
    }

    // Check if student is enrolled in the course
    const enrollment = await CourseEnrollment.findOne({
      studentId: student._id,
      courseId: test.courseId,
      isActive: true
    });

    if (!enrollment) {
      return jsonResponse.notAuthorized("Student is not enrolled in this course");
    }

    // Check target audience eligibility
    if (test.targetAudience === 'specific') {
      if (test.studentIds && !test.studentIds.includes(student._id.toString())) {
        return jsonResponse.notAuthorized("Not eligible for this test");
      }
      if (test.batchIds && test.batchIds.length > 0) {
        const studentBatches: any[] = []; // TODO: Implement batch enrollment tracking
        const hasMatchingBatch = test.batchIds.some(batchId =>
          studentBatches.includes(batchId.toString())
        );
        if (!hasMatchingBatch) {
          return jsonResponse.notAuthorized("Not eligible for this test");
        }
      }
    }

    // Check time limits
    const now = new Date();
    if (test.startTime && now < test.startTime) {
      return jsonResponse.clientError("Test has not started yet");
    }
    if (test.endTime && now > test.endTime) {
      return jsonResponse.clientError("Test has ended");
    }

    // Find student's attempt
    const studentAttempt = test.attempts.find((attempt: any) =>
      attempt.studentId.toString() === student._id.toString() &&
      attempt.status === 'in-progress'
    );

    const response: any = {
      _id: test._id,
      title: test.title,
      description: test.description,
      instructions: test.instructions,
      type: test.type,
      duration: test.duration,
      totalMarks: test.totalMarks,
      totalQuestions: test.totalQuestions,
      shuffleQuestions: test.shuffleQuestions,
      shuffleOptions: test.shuffleOptions,
      showResultsImmediately: test.showResultsImmediately,
      courseName: test.courseName,
      subjectName: test.subjectName,
      moduleName: test.moduleName
    };

    if (test.type === 'mcq' || test.type === 'mixed') {
      // Return questions for MCQ/mixed tests
      response.questions = test.questions.map((q: any, index: number) => ({
        questionNumber: index + 1,
        question: q.questionText,
        options: test.shuffleOptions ? shuffleArray([...q.options]) : q.options,
        type: q.questionType || 'mcq',
        marks: q.marks || 1,
        explanation: q.explanation
      }));

      // Include PDF info for mixed tests
      if (test.type === 'mixed' && test.pdfUrl) {
        response.pdfUrl = test.pdfUrl;
        response.pdfFileName = test.pdfFileName;
      }
    } else if (test.type === 'pdf') {
      // Return PDF info for PDF tests
      response.pdfUrl = test.pdfUrl;
      response.pdfFileName = test.pdfFileName;
      response.answerKeyUrl = test.answerKeyUrl;
    }

    // Include attempt info if exists
    if (studentAttempt) {
      response.attemptInfo = {
        attemptId: (studentAttempt as any)._id,
        startedAt: studentAttempt.startedAt,
        timeSpent: studentAttempt.timeSpent,
        answers: studentAttempt.answers
      };
    }

    jsonResponse.success(response);

  } catch (error) {
    console.error("Error fetching test details:", error);
    jsonResponse.serverError("Failed to fetch test details");
  }
});

// POST /api/student/tests/:id/start - Start a test attempt
router.post("/:id/start", async (req, res) => {
  const jsonResponse = new JsonResponse(res);
  console.log('🎯 START TEST ATTEMPT - Test ID:', req.params.id);

  try {
    const { id } = req.params;
    const student = res.locals.student;
    console.log('👤 Student:', student._id, student.full_name);

    if (!student) {
      return jsonResponse.notAuthorized("Student not authenticated");
    }

    const test = await Test.findOne({
      _id: id,
      status: 'active',
      isActive: true
    });
    console.log('📝 Test found:', test ? test._id : 'NOT FOUND');

    if (!test) {
      return jsonResponse.notFound("Test not found");
    }

    // Check eligibility
    const enrollment = await CourseEnrollment.findOne({
      studentId: student._id,
      courseId: test.courseId,
      isActive: true
    });
    console.log('📚 Enrollment found:', enrollment ? 'YES' : 'NO');

    if (!enrollment) {
      return jsonResponse.notAuthorized("Student is not enrolled in this course");
    }

    // Check time limits
    const now = new Date();
    if (test.startTime && now < test.startTime) {
      console.log('⏰ Test not started yet');
      return jsonResponse.clientError("Test has not started yet");
    }
    if (test.endTime && now > test.endTime) {
      console.log('⏰ Test has ended');
      return jsonResponse.clientError("Test has ended");
    }

    // Find existing attempts
    const existingAttempts = test.attempts.filter((attempt: any) =>
      attempt.studentId.toString() === student._id.toString()
    );
    console.log('📊 Existing attempts:', existingAttempts.length);
    if (existingAttempts.length > 0) {
      console.log('📊 Attempt statuses:', existingAttempts.map(a => ({ number: a.attemptNumber, status: a.status })));
    }

    // Check attempt limits
    if (!test.allowMultipleAttempts && existingAttempts.length > 0) {
      console.log('🚫 Multiple attempts not allowed');
      return jsonResponse.clientError("Multiple attempts not allowed");
    }

    if (test.maxAttempts && existingAttempts.length >= test.maxAttempts) {
      console.log('🚫 Max attempts reached');
      return jsonResponse.clientError("Maximum attempts reached");
    }

    // Check if there's already an in-progress attempt
    const inProgressAttempt = existingAttempts.find((attempt: any) =>
      attempt.status === 'in-progress'
    );

    if (inProgressAttempt) {
      console.log('▶️ Continuing existing attempt:', (inProgressAttempt as any)._id);
      return jsonResponse.success({
        attemptId: (inProgressAttempt as any)._id,
        message: "Continuing existing attempt"
      });
    }

    // Create new attempt
    console.log('🆕 Creating new attempt');
    const attemptNumber = existingAttempts.length + 1;
    const newAttempt = {
      studentId: student._id,
      studentName: student.full_name || student.email || 'Unknown Student',
      studentEmail: student.email,
      attemptNumber,
      status: 'in-progress' as const,
      startedAt: new Date(),
      answers: [],
      timeSpent: 0
    };

    console.log('📝 New attempt data:', {
      studentId: newAttempt.studentId,
      studentName: newAttempt.studentName,
      attemptNumber: newAttempt.attemptNumber
    });

    test.attempts.push(newAttempt as any);
    console.log('💾 Saving test...');
    await test.save();
    console.log('✅ Test saved successfully');

    // Get the attempt that was just added (should be the last one)
    const savedAttempt = test.attempts[test.attempts.length - 1];
    console.log('🎯 Attempt ID:', (savedAttempt as any)._id);

    jsonResponse.success({
      attemptId: (savedAttempt as any)._id,
      attemptNumber,
      message: "Test attempt started"
    });

  } catch (error) {
    console.error("❌ Error starting test:", error);
    jsonResponse.serverError("Failed to start test");
  }
});

// POST /api/student/tests/:id/submit - Submit test answers
router.post("/:id/submit", async (req, res) => {
  const jsonResponse = new JsonResponse(res);
  console.log('🎯 SUBMIT TEST - Test ID:', req.params.id);

  try {
    const { id } = req.params;
    const { answers, timeSpent } = req.body;
    const student = res.locals.student;
    console.log('👤 Student:', student._id, 'Answers count:', answers?.length, 'Time spent:', timeSpent);
    console.log('📝 Received answers:', answers);

    if (!student) {
      return jsonResponse.notAuthorized("Student not authenticated");
    }

    const test = await Test.findOne({
      _id: id,
      status: 'active',
      isActive: true
    });
    console.log('📝 Test found:', test ? test._id : 'NOT FOUND');

    if (!test) {
      return jsonResponse.notFound("Test not found");
    }

    // Find student's in-progress attempt
    const attemptIndex = test.attempts.findIndex((attempt: any) =>
      attempt.studentId.toString() === student._id.toString() &&
      attempt.status === 'in-progress'
    );
    console.log('🔍 Attempt index:', attemptIndex);

    if (attemptIndex === -1) {
      return jsonResponse.notFound("No active attempt found");
    }

    const attempt = test.attempts[attemptIndex] as any;
    console.log('📝 Found attempt:', attempt._id, 'Status:', attempt.status);

    // Update attempt with answers
    attempt.answers = answers;
    attempt.timeSpent = timeSpent;
    attempt.submittedAt = new Date();
    attempt.status = 'submitted';
    console.log('📝 Updated attempt with answers');

    // Calculate score for MCQ questions
    let totalScore = 0;
    if (test.type === 'mcq' || test.type === 'mixed') {
      console.log('🧮 Calculating score for', answers.length, 'answers');
      answers.forEach((answer: any) => {
        const question = test.questions[answer.questionNumber - 1];
        if (question && answer.answer !== undefined) {
          console.log(`Question ${answer.questionNumber}: selected=${answer.answer}, correct=${question.correctAnswer}`);
          // Check if selected option index matches correct answer
          if (answer.answer === question.correctAnswer) {
            totalScore += question.marks || 1;
            console.log(`✅ Correct! Score: ${totalScore}`);
          }
        }
      });
    }

    attempt.totalScore = totalScore;
    attempt.percentage = (totalScore / test.totalMarks) * 100;
    console.log('📊 Final score:', totalScore, 'Percentage:', attempt.percentage);

    // Update test statistics
    test.totalAttempts = test.attempts.length;
    const submittedAttempts = test.attempts.filter((a: any) => a.status === 'submitted' || a.status === 'evaluated');
    test.avgScore = submittedAttempts.reduce((sum: number, a: any) => sum + (a.totalScore || 0), 0) / submittedAttempts.length;
    test.passRate = submittedAttempts.filter((a: any) => (a.totalScore || 0) >= (test.passingMarks || 0)).length / submittedAttempts.length;
    console.log('📈 Updated test statistics');

    console.log('💾 Saving test...');
    await test.save();
    console.log('✅ Test saved successfully');

    const submitResponse = {
      attemptId: attempt._id,
      totalScore,
      percentage: attempt.percentage,
      passed: totalScore >= (test.passingMarks || 0),
      showResults: test.showResultsImmediately,
      message: "Test submitted successfully"
    };
    console.log('📤 Submit response:', submitResponse);

    jsonResponse.success(submitResponse);

  } catch (error) {
    console.error("❌ Error submitting test:", error);
    jsonResponse.serverError("Failed to submit test");
  }
});

// GET /api/student/tests/:id/results/:attemptId - Get test results
router.get("/:id/results/:attemptId", async (req, res) => {
  const jsonResponse = new JsonResponse(res);
  console.log('🎯 GET TEST RESULTS - Test ID:', req.params.id, 'Attempt ID:', req.params.attemptId);

  try {
    const { id, attemptId } = req.params;
    const student = res.locals.student;
    console.log('👤 Student:', student ? student._id : 'NOT AUTHENTICATED');

    if (!student) {
      console.log('❌ No student authenticated');
      return jsonResponse.notAuthorized("Student not authenticated");
    }

    const test = await Test.findOne({
      _id: id,
      isActive: true
    });
    console.log('📝 Test found:', test ? { id: test._id, title: test.title, showResultsImmediately: test.showResultsImmediately, showCorrectAnswers: test.showCorrectAnswers } : 'NOT FOUND');

    if (!test) {
      console.log('❌ Test not found');
      return jsonResponse.notFound("Test not found");
    }

    // Find the attempt
    const attempt = test.attempts.find((att: any) =>
      att._id?.toString() === attemptId &&
      att.studentId.toString() === student._id.toString()
    );
    console.log('🔍 Attempt search result:', attempt ? { id: (attempt as any)._id, status: attempt.status, totalScore: attempt.totalScore, answersCount: attempt.answers?.length } : 'NOT FOUND');

    if (!attempt) {
      console.log('❌ Attempt not found');
      console.log('Available attempts for this student:', test.attempts.filter(a => a.studentId.toString() === student._id.toString()).map(a => ({ id: (a as any)._id, status: a.status })));
      return jsonResponse.notFound("Attempt not found");
    }

    // Check if results can be shown
    if (!test.showResultsImmediately && attempt.status !== 'evaluated') {
      console.log('❌ Results not available yet');
      return jsonResponse.clientError("Results not available yet");
    }

    console.log('✅ Building result object...');
    const result = {
      test: {
        _id: test._id,
        title: test.title,
        type: test.type,
        totalMarks: test.totalMarks,
        passingMarks: test.passingMarks,
        totalQuestions: test.totalQuestions,
        showCorrectAnswers: test.showCorrectAnswers
      },
      attempt: {
        attemptId: (attempt as any)._id,
        attemptNumber: attempt.attemptNumber,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        timeSpent: attempt.timeSpent,
        totalScore: attempt.totalScore,
        percentage: attempt.percentage,
        status: attempt.status,
        feedback: attempt.feedback,
        gradedAt: attempt.gradedAt,
        passed: (attempt.totalScore || 0) >= (test.passingMarks || 0),
        answers: [] as any[] // Will be populated below if allowed
      }
    };

    // Include detailed answers if allowed
    if (test.showCorrectAnswers && (test.type === 'mcq' || test.type === 'mixed')) {
      console.log('📝 Processing answers...');
      const attemptWithAnswers = attempt as any; // Cast to access answers
      result.attempt.answers = attemptWithAnswers.answers?.map((answer: any, index: number) => {
        console.log(`Answer ${index + 1}:`, answer);
        const question = test.questions[answer.questionNumber - 1];
        console.log(`Question ${answer.questionNumber}:`, question ? { text: question.questionText.substring(0, 50), correctAnswer: question.correctAnswer, optionsCount: question.options?.length } : 'NOT FOUND');
        
        // Convert letter answer to index for display
        const letterToIndex = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
        const selectedIndex = typeof answer.answer === 'string' ? letterToIndex[answer.answer as keyof typeof letterToIndex] : answer.answer;
        const correctIndex = typeof question.correctAnswer === 'string' ? letterToIndex[question.correctAnswer as keyof typeof letterToIndex] : question.correctAnswer;
        
        console.log(`Conversion: answer=${answer.answer} -> selectedIndex=${selectedIndex}, correct=${question.correctAnswer} -> correctIndex=${correctIndex}`);
        
        const answerResult = {
          questionNumber: answer.questionNumber,
          question: question.questionText,
          selectedOption: selectedIndex,
          selectedOptionText: selectedIndex !== undefined && selectedIndex >= 0 && question.options && question.options[selectedIndex] ? question.options[selectedIndex] : null,
          isCorrect: answer.answer !== undefined ? answer.answer === question.correctAnswer : false,
          correctOption: correctIndex,
          correctOptionText: correctIndex !== undefined && correctIndex >= 0 && question.options && question.options[correctIndex] ? question.options[correctIndex] : null,
          marks: question.marks || 1,
          explanation: question.explanation
        };
        
        console.log(`Result:`, { selected: answerResult.selectedOptionText?.substring(0, 30), correct: answerResult.correctOptionText?.substring(0, 30), isCorrect: answerResult.isCorrect });
        return answerResult;
      }) || [];
      console.log('✅ Answers processed, count:', result.attempt.answers.length);
    }

    console.log('🎉 Sending success response');
    jsonResponse.success(result);

  } catch (error) {
    console.error("❌ Error fetching test results:", error);
    jsonResponse.serverError("Failed to fetch test results");
  }
});

// Helper function to shuffle array
function shuffleArray(array: any[]) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default router;