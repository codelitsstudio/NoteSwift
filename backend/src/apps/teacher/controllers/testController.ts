import { Request, Response } from 'express';
import Test, { IQuestion, ITestAttempt } from '../models/Test.model';
import SubjectContent from '../models/SubjectContent.model';
import Teacher from '../models/Teacher.model';
import CourseEnrollment from '../models/CourseEnrollment';

const verifySubjectOwnership = async (teacherEmail: string, subjectContentId: string): Promise<boolean> => {
  const subjectContent = await SubjectContent.findById(subjectContentId);
  return subjectContent ? subjectContent.teacherEmail === teacherEmail : false;
};

// GET /api/teacher/tests - Get teacher's tests
export const getTeacherTests = async (req: Request, res: Response) => {
  try {
    const { teacherEmail, subjectContentId, status, type } = req.query;

    if (!teacherEmail) {
      return res.status(400).json({ success: false, message: 'Teacher email required' });
    }

    const query: any = { teacherEmail, isActive: true };
    if (subjectContentId) query.subjectContentId = subjectContentId;
    if (status) query.status = status;
    if (type) query.type = type;

    const tests = await Test.find(query).sort({ createdAt: -1 });

    const stats = {
      total: tests.length,
      active: tests.filter(t => t.status === 'active').length,
      draft: tests.filter(t => t.status === 'draft').length,
      totalAttempts: tests.reduce((sum, t) => sum + t.totalAttempts, 0),
      avgScore: tests.filter(t => t.avgScore).reduce((sum, t) => sum + (t.avgScore || 0), 0) / tests.filter(t => t.avgScore).length || 0
    };

    return res.status(200).json({ success: true, data: { tests, stats } });
  } catch (error: any) {
    console.error('Error fetching tests:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch tests', error: error.message });
  }
};

// POST /api/teacher/tests - Create test
export const createTest = async (req: Request, res: Response) => {
  try {
    const {
      title, description, instructions, subjectContentId, teacherEmail,
      type, category, questions, duration, startTime, endTime,
      moduleNumber, moduleName, pdfUrl, pdfFileName, answerKeyUrl,
      allowMultipleAttempts, maxAttempts, showResultsImmediately, showCorrectAnswers,
      shuffleQuestions, shuffleOptions, targetAudience, batchIds, studentIds,
      totalMarks, passingMarks
    } = req.body;

    if (!await verifySubjectOwnership(teacherEmail, subjectContentId)) {
      return res.status(403).json({ success: false, message: 'Not authorized for this subject' });
    }

    const subjectContent = await SubjectContent.findById(subjectContentId);
    if (!subjectContent) {
      return res.status(404).json({ success: false, message: 'Subject content not found' });
    }

    const teacher = await Teacher.findOne({ email: teacherEmail });
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const test = new Test({
      title, description, instructions,
      subjectContentId,
      courseId: subjectContent.courseId,
      courseName: subjectContent.courseName,
      subjectName: subjectContent.subjectName,
      moduleNumber, moduleName,
      teacherId: teacher._id,
      teacherName: teacher.fullName || `${teacher.firstName} ${teacher.lastName}`,
      teacherEmail: teacher.email,
      type: type || 'mcq',
      category: category || 'quiz',
      questions: questions || [],
      duration,
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
      pdfUrl, pdfFileName, answerKeyUrl,
      allowMultipleAttempts: allowMultipleAttempts || false,
      maxAttempts: maxAttempts || 1,
      showResultsImmediately: showResultsImmediately !== false,
      showCorrectAnswers: showCorrectAnswers !== false,
      shuffleQuestions: shuffleQuestions || false,
      shuffleOptions: shuffleOptions || false,
      targetAudience: targetAudience || 'all',
      batchIds, studentIds,
      totalMarks, passingMarks,
      status: 'draft'
    });

    await test.save();

    // Update SubjectContent hasTest flag
    if (moduleNumber) {
      const module = subjectContent.modules.find(m => m.moduleNumber === moduleNumber);
      if (module) {
        module.hasTest = true;
        if (!module.testIds) module.testIds = [];
        module.testIds.push(test._id as any);
        await subjectContent.save();
      }
    }

    return res.status(201).json({ success: true, message: 'Test created', data: test });
  } catch (error: any) {
    console.error('Error creating test:', error);
    return res.status(500).json({ success: false, message: 'Failed to create test', error: error.message });
  }
};

// PATCH /api/teacher/tests/:id - Update test
export const updateTest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { teacherEmail } = req.query;
    const updates = req.body;

    const test = await Test.findById(id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    if (test.teacherEmail !== teacherEmail) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Cannot edit active tests with attempts
    if (test.status === 'active' && test.totalAttempts > 0) {
      return res.status(400).json({ success: false, message: 'Cannot edit test with student attempts' });
    }

    Object.assign(test, updates);
    await test.save();

    return res.status(200).json({ success: true, message: 'Test updated', data: test });
  } catch (error: any) {
    console.error('Error updating test:', error);
    return res.status(500).json({ success: false, message: 'Failed to update test', error: error.message });
  }
};

// GET /api/teacher/tests/:id/attempts - Get test attempts
export const getTestAttempts = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { teacherEmail } = req.query;

    const test = await Test.findById(id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    if (test.teacherEmail !== teacherEmail) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const stats = {
      total: test.totalAttempts,
      completed: test.attempts.filter(a => a.status === 'submitted' || a.status === 'evaluated').length,
      inProgress: test.attempts.filter(a => a.status === 'in-progress').length,
      avgScore: test.avgScore || 0,
      passRate: test.passRate || 0
    };

    return res.status(200).json({
      success: true,
      data: {
        test: {
          _id: test._id,
          title: test.title,
          totalMarks: test.totalMarks,
          passingMarks: test.passingMarks,
          type: test.type
        },
        attempts: test.attempts,
        stats
      }
    });
  } catch (error: any) {
    console.error('Error fetching attempts:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch attempts', error: error.message });
  }
};

// POST /api/teacher/tests/:id/grade - Grade subjective answers
export const gradeTestAttempt = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { teacherEmail, attemptId, questionGrades, feedback } = req.body;

    const test = await Test.findById(id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    if (test.teacherEmail !== teacherEmail) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const attempt = test.attempts.find((a: any) => a._id?.toString() === attemptId);
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }

    // Update grades for subjective questions
    let totalScore = 0;
    questionGrades.forEach((grade: { questionNumber: number; marksAwarded: number }) => {
      const answer = attempt.answers.find(a => a.questionNumber === grade.questionNumber);
      if (answer) {
        answer.marksAwarded = grade.marksAwarded;
        totalScore += grade.marksAwarded;
      }
    });

    attempt.totalScore = totalScore;
    attempt.percentage = (totalScore / test.totalMarks) * 100;
    attempt.status = 'evaluated' as any;
    attempt.feedback = feedback;
    attempt.gradedAt = new Date();
    
    const teacher = await Teacher.findOne({ email: teacherEmail });
    if (teacher) attempt.gradedBy = teacher._id as any;

    await test.save();

    return res.status(200).json({ success: true, message: 'Test graded', data: attempt });
  } catch (error: any) {
    console.error('Error grading test:', error);
    return res.status(500).json({ success: false, message: 'Failed to grade test', error: error.message });
  }
};

// POST /api/teacher/tests/:id/publish - Publish test
export const publishTest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { teacherEmail } = req.body;

    const test = await Test.findById(id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    if (test.teacherEmail !== teacherEmail) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (test.type !== 'pdf' && (!test.questions || test.questions.length === 0)) {
      return res.status(400).json({ success: false, message: 'Cannot publish test without questions' });
    }

    test.status = 'active';
    await test.save();

    return res.status(200).json({ success: true, message: 'Test published', data: test });
  } catch (error: any) {
    console.error('Error publishing test:', error);
    return res.status(500).json({ success: false, message: 'Failed to publish test', error: error.message });
  }
};

// DELETE /api/teacher/tests/:id - Delete test
export const deleteTest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { teacherEmail } = req.query;

    const test = await Test.findById(id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    if (test.teacherEmail !== teacherEmail) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    test.isActive = false;
    await test.save();

    return res.status(200).json({ success: true, message: 'Test deleted' });
  } catch (error: any) {
    console.error('Error deleting test:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete test', error: error.message });
  }
};
