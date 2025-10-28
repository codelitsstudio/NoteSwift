import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Test, { IQuestion, ITestAttempt } from '../models/Test.model';
import SubjectContent from '../models/SubjectContent.model';
import Teacher from '../models/Teacher.model';
import CourseEnrollment from '../models/CourseEnrollment';
import FirebaseService from '../../../services/firebaseService';

const verifySubjectOwnership = async (teacherEmail: string, subjectContentId: string): Promise<boolean> => {
  console.log('🔍 Verifying subject ownership:', { teacherEmail, subjectContentId });

  // First try to find SubjectContent by _id directly (new approach)
  let subjectContent = await SubjectContent.findById(subjectContentId);

  if (subjectContent) {
    console.log('📄 SubjectContent found by _id:', {
      _id: subjectContent._id,
      teacherEmail: subjectContent.teacherEmail,
      subjectName: subjectContent.subjectName,
      courseId: subjectContent.courseId
    });
    const isAuthorized = subjectContent.teacherEmail === teacherEmail;
    console.log('✅ Authorization result:', isAuthorized);
    return isAuthorized;
  }

  // Fallback: try parsing as constructed ID (old approach)
  const parts = subjectContentId.split('_');
  if (parts.length >= 2) {
    const courseId = parts[0];
    const subjectName = parts.slice(1).join('_'); // Handle subject names with underscores

    console.log('🔍 Fallback: Parsed constructed ID:', { courseId, subjectName });

    subjectContent = await SubjectContent.findOne({
      courseId,
      subjectName,
      teacherEmail,
      isActive: true
    });

    console.log('📄 SubjectContent found by constructed ID:', subjectContent ? {
      _id: subjectContent._id,
      teacherEmail: subjectContent.teacherEmail,
      subjectName: subjectContent.subjectName,
      courseId: subjectContent.courseId
    } : 'NOT FOUND');

    const isAuthorized = !!subjectContent;
    console.log('✅ Authorization result:', isAuthorized);
    return isAuthorized;
  }

  console.log('❌ Invalid subjectContentId format and not found by _id');
  return false;
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
      type, category, questions, totalQuestions, duration, startTime, endTime,
      moduleNumber, moduleName, pdfUrl, pdfFileName, answerKeyUrl,
      allowMultipleAttempts, maxAttempts, showResultsImmediately, showCorrectAnswers,
      shuffleQuestions, shuffleOptions, targetAudience, batchIds, studentIds,
      totalMarks, passingMarks
    } = req.body;

    console.log('📝 Creating test with data:', {
      title, subjectContentId, teacherEmail, type, duration
    });

    if (!await verifySubjectOwnership(teacherEmail, subjectContentId)) {
      return res.status(403).json({ success: false, message: 'Not authorized for this subject' });
    }

    // Find the SubjectContent document - it might be by _id or constructed ID
    let subjectContent = await SubjectContent.findById(subjectContentId);

    if (!subjectContent) {
      // Try parsing as constructed ID
      const parts = subjectContentId.split('_');
      if (parts.length >= 2) {
        const courseId = parts[0];
        const subjectName = parts.slice(1).join('_');

        subjectContent = await SubjectContent.findOne({
          courseId,
          subjectName,
          teacherEmail,
          isActive: true
        });
      }
    }

    if (!subjectContent) {
      return res.status(404).json({ success: false, message: 'Subject content not found' });
    }

    const teacher = await Teacher.findOne({ email: teacherEmail });
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const test = new Test({
      title, description, instructions,
      subjectContentId: subjectContent._id, // Store the actual SubjectContent document _id
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
      totalQuestions: totalQuestions || 0,
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

// POST /api/teacher/tests/:id/upload-pdf - Upload PDF for test
export const uploadTestPDF = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get teacher from JWT token (similar to auth middleware)
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const JWT_SECRET = process.env.SESSION_SECRET || 'your-secret-key-change-in-production';
    let teacherId: string;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      teacherId = decoded.teacherId || decoded.id;
    } catch (err: any) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const teacherEmail = teacher.email;

    const test = await Test.findById(id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    if (test.teacherEmail !== teacherEmail) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Find PDF file from uploaded files
    const pdfFile = (req.files as any[])?.find(file => file.fieldname === 'pdf');
    if (!pdfFile) {
      return res.status(400).json({ success: false, message: 'No PDF file provided' });
    }

    // Upload PDF to Firebase (use separate PDF folder)
    const uploadResult = await FirebaseService.uploadPDF(
      pdfFile.buffer,
      pdfFile.originalname,
      pdfFile.mimetype,
      test.subjectName,
      {
        title: test.title,
        teacherId: test.teacherId.toString(),
        courseId: test.courseId.toString()
      }
    );

    // Update test with PDF URL
    test.pdfUrl = uploadResult.downloadUrl;
    test.pdfFileName = uploadResult.fileName;
    await test.save();

    return res.status(200).json({
      success: true,
      message: 'PDF uploaded successfully',
      data: {
        pdfUrl: uploadResult.downloadUrl,
        pdfFileName: uploadResult.fileName
      }
    });
  } catch (error: any) {
    console.error('Error uploading PDF:', error);
    return res.status(500).json({ success: false, message: 'Failed to upload PDF', error: error.message });
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
