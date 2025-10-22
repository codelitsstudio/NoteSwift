import { Request, Response } from 'express';
import Question, { IAnswer } from '../models/Question.model';
import SubjectContent from '../models/SubjectContent.model';
import Teacher from '../models/Teacher.model';
import CourseEnrollment from '../models/CourseEnrollment';

// GET /api/teacher/questions - Get questions for teacher's subjects
export const getTeacherQuestions = async (req: Request, res: Response) => {
  try {
    const { teacherEmail, subjectContentId, status, priority } = req.query;

    if (!teacherEmail) {
      return res.status(400).json({ success: false, message: 'Teacher email required' });
    }

    // Get teacher's subjects
    const teacher = await Teacher.findOne({ email: teacherEmail });
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const query: any = { isActive: true };
    
    if (subjectContentId) {
      query.subjectContentId = subjectContentId;
    } else {
      // Get all questions for teacher's subjects
      const subjectContents = await SubjectContent.find({ teacherEmail });
      const subjectContentIds = subjectContents.map(sc => sc._id);
      query.subjectContentId = { $in: subjectContentIds };
    }
    
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const questions = await Question.find(query).sort({ createdAt: -1 });

    const stats = {
      total: questions.length,
      pending: questions.filter(q => q.status === 'pending').length,
      answered: questions.filter(q => q.status === 'answered').length,
      resolved: questions.filter(q => q.status === 'resolved').length,
      highPriority: questions.filter(q => q.priority === 'high').length
    };

    return res.status(200).json({ success: true, data: { questions, stats } });
  } catch (error: any) {
    console.error('Error fetching questions:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch questions', error: error.message });
  }
};

// GET /api/teacher/questions/:id - Get single question with details
export const getQuestionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { teacherEmail } = req.query;

    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Verify teacher has access (check if subjectContent belongs to teacher)
    const subjectContent = await SubjectContent.findById(question.subjectContentId);
    if (!subjectContent || subjectContent.teacherEmail !== teacherEmail) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Increment view count
    question.views += 1;
    await question.save();

    return res.status(200).json({ success: true, data: question });
  } catch (error: any) {
    console.error('Error fetching question:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch question', error: error.message });
  }
};

// POST /api/teacher/questions/:id/answer - Answer a question
export const answerQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { teacherEmail, answerText, attachments } = req.body;

    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Verify teacher has access
    const subjectContent = await SubjectContent.findById(question.subjectContentId);
    if (!subjectContent || subjectContent.teacherEmail !== teacherEmail) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const teacher = await Teacher.findOne({ email: teacherEmail });
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const answer: IAnswer = {
      answeredBy: teacher._id as any,
      answeredByName: teacher.fullName || `${teacher.firstName} ${teacher.lastName}`,
      answeredByRole: 'teacher',
      answerText,
      attachments: attachments || [],
      isAccepted: false,
      upvotes: [],
      downvotes: [],
      createdAt: new Date(),
      updatedAt: new Date()
    } as any;

    question.answers.push(answer);
    question.status = 'answered';
    
    await question.save();

    return res.status(201).json({ success: true, message: 'Answer posted', data: answer });
  } catch (error: any) {
    console.error('Error posting answer:', error);
    return res.status(500).json({ success: false, message: 'Failed to post answer', error: error.message });
  }
};

// PATCH /api/teacher/questions/:id/priority - Set question priority
export const setQuestionPriority = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { teacherEmail, priority } = req.body;

    if (!['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({ success: false, message: 'Invalid priority value' });
    }

    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Verify teacher has access
    const subjectContent = await SubjectContent.findById(question.subjectContentId);
    if (!subjectContent || subjectContent.teacherEmail !== teacherEmail) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    question.priority = priority;
    await question.save();

    return res.status(200).json({ success: true, message: 'Priority updated', data: question });
  } catch (error: any) {
    console.error('Error updating priority:', error);
    return res.status(500).json({ success: false, message: 'Failed to update priority', error: error.message });
  }
};

// POST /api/teacher/questions/:id/resolve - Mark question as resolved
export const resolveQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { teacherEmail } = req.body;

    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Verify teacher has access
    const subjectContent = await SubjectContent.findById(question.subjectContentId);
    if (!subjectContent || subjectContent.teacherEmail !== teacherEmail) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const teacher = await Teacher.findOne({ email: teacherEmail });
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    question.status = 'resolved';
    question.resolvedAt = new Date();
    question.resolvedBy = teacher._id as any;
    
    await question.save();

    return res.status(200).json({ success: true, message: 'Question resolved', data: question });
  } catch (error: any) {
    console.error('Error resolving question:', error);
    return res.status(500).json({ success: false, message: 'Failed to resolve question', error: error.message });
  }
};

// POST /api/teacher/questions/:id/answers/:answerId/accept - Accept an answer as best
export const acceptAnswer = async (req: Request, res: Response) => {
  try {
    const { id, answerId } = req.params;
    const { teacherEmail } = req.body;

    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Verify teacher has access
    const subjectContent = await SubjectContent.findById(question.subjectContentId);
    if (!subjectContent || subjectContent.teacherEmail !== teacherEmail) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const answer = question.answers.find((a: any) => a._id?.toString() === answerId);
    if (!answer) {
      return res.status(404).json({ success: false, message: 'Answer not found' });
    }

    // Unaccept previous accepted answers
    question.answers.forEach((a: any) => {
      a.isAccepted = false;
    });

    answer.isAccepted = true;
    question.acceptedAnswerId = answerId as any;
    
    await question.save();

    return res.status(200).json({ success: true, message: 'Answer accepted', data: question });
  } catch (error: any) {
    console.error('Error accepting answer:', error);
    return res.status(500).json({ success: false, message: 'Failed to accept answer', error: error.message });
  }
};

// DELETE /api/teacher/questions/:id - Delete/close question
export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { teacherEmail } = req.query;

    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Verify teacher has access
    const subjectContent = await SubjectContent.findById(question.subjectContentId);
    if (!subjectContent || subjectContent.teacherEmail !== teacherEmail) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    question.status = 'closed';
    question.isActive = false;
    await question.save();

    return res.status(200).json({ success: true, message: 'Question closed' });
  } catch (error: any) {
    console.error('Error closing question:', error);
    return res.status(500).json({ success: false, message: 'Failed to close question', error: error.message });
  }
};
