import { Request, Response } from 'express';
import Assignment, { ISubmission } from '../models/Assignment.model';
import SubjectContent from '../models/SubjectContent.model';
import Teacher from '../models/Teacher.model';
import CourseEnrollment from '../models/CourseEnrollment';

// Helper: Verify teacher owns subject
const verifySubjectOwnership = async (teacherEmail: string, subjectContentId: string): Promise<boolean> => {
  const subjectContent = await SubjectContent.findById(subjectContentId);
  return subjectContent ? subjectContent.teacherEmail === teacherEmail : false;
};

// GET /api/teacher/assignments - Get teacher's assignments
export const getTeacherAssignments = async (req: Request, res: Response) => {
  try {
    const { teacherEmail, subjectContentId, status } = req.query;

    if (!teacherEmail) {
      return res.status(400).json({ success: false, message: 'Teacher email required' });
    }

    const query: any = { teacherEmail, isActive: true };
    if (subjectContentId) query.subjectContentId = subjectContentId;
    if (status) query.status = status;

    const assignments = await Assignment.find(query).sort({ createdAt: -1 });

    const stats = {
      total: assignments.length,
      active: assignments.filter(a => a.status === 'active').length,
      draft: assignments.filter(a => a.status === 'draft').length,
      totalSubmissions: assignments.reduce((sum, a) => sum + a.totalSubmissions, 0),
      pendingGrading: assignments.reduce((sum, a) => sum + a.pendingGrading, 0)
    };

    return res.status(200).json({ success: true, data: { assignments, stats } });
  } catch (error: any) {
    console.error('Error fetching assignments:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch assignments', error: error.message });
  }
};

// POST /api/teacher/assignments - Create assignment
export const createAssignment = async (req: Request, res: Response) => {
  try {
    const {
      title, description, instructions, subjectContentId, teacherEmail,
      type, totalMarks, passingMarks, deadline, allowLateSubmission, latePenalty,
      moduleNumber, moduleName, targetAudience, batchIds, studentIds,
      attachments, allowMultipleAttempts, maxAttempts, requireFile, requireText
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

    const assignment = new Assignment({
      title, description, instructions,
      subjectContentId,
      courseId: subjectContent.courseId,
      courseName: subjectContent.courseName,
      subjectName: subjectContent.subjectName,
      moduleNumber, moduleName,
      teacherId: teacher._id,
      teacherName: teacher.fullName || `${teacher.firstName} ${teacher.lastName}`,
      teacherEmail: teacher.email,
      type: type || 'homework',
      totalMarks, passingMarks,
      deadline: new Date(deadline),
      allowLateSubmission: allowLateSubmission !== false,
      latePenalty: latePenalty || 10,
      targetAudience: targetAudience || 'all',
      batchIds, studentIds, attachments,
      allowMultipleAttempts: allowMultipleAttempts || false,
      maxAttempts: maxAttempts || 1,
      requireFile: requireFile !== false,
      requireText: requireText || false,
      status: 'draft'
    });

    await assignment.save();

    // Update SubjectContent hasTest flag if moduleNumber provided
    if (moduleNumber) {
      const module = subjectContent.modules.find(m => m.moduleNumber === moduleNumber);
      if (module) {
        module.hasTest = true;
        await subjectContent.save();
      }
    }

    return res.status(201).json({ success: true, message: 'Assignment created', data: assignment });
  } catch (error: any) {
    console.error('Error creating assignment:', error);
    return res.status(500).json({ success: false, message: 'Failed to create assignment', error: error.message });
  }
};

// PATCH /api/teacher/assignments/:id - Update assignment
export const updateAssignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { teacherEmail } = req.query;
    const updates = req.body;

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    if (assignment.teacherEmail !== teacherEmail) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Cannot edit active assignments with submissions
    if (assignment.status === 'active' && assignment.totalSubmissions > 0) {
      return res.status(400).json({ success: false, message: 'Cannot edit assignment with submissions' });
    }

    Object.assign(assignment, updates);
    await assignment.save();

    return res.status(200).json({ success: true, message: 'Assignment updated', data: assignment });
  } catch (error: any) {
    console.error('Error updating assignment:', error);
    return res.status(500).json({ success: false, message: 'Failed to update assignment', error: error.message });
  }
};

// GET /api/teacher/assignments/:id/submissions - Get submissions
export const getAssignmentSubmissions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { teacherEmail } = req.query;

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    if (assignment.teacherEmail !== teacherEmail) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    return res.status(200).json({
      success: true,
      data: {
        assignment: {
          _id: assignment._id,
          title: assignment.title,
          totalMarks: assignment.totalMarks,
          deadline: assignment.deadline
        },
        submissions: assignment.submissions,
        stats: {
          total: assignment.totalSubmissions,
          pending: assignment.pendingGrading,
          graded: assignment.submissions.filter(s => s.status === 'graded').length
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching submissions:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch submissions', error: error.message });
  }
};

// POST /api/teacher/assignments/:id/grade - Grade submission
export const gradeSubmission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { teacherEmail, submissionId, score, feedback } = req.body;

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    if (assignment.teacherEmail !== teacherEmail) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const submission = assignment.submissions.find((s: any) => s._id.toString() === submissionId);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    if (score > assignment.totalMarks) {
      return res.status(400).json({ success: false, message: 'Score exceeds total marks' });
    }

    const teacher = await Teacher.findOne({ email: teacherEmail });
    
    submission.score = score;
    submission.feedback = feedback;
    submission.status = 'graded' as any;
    submission.gradedAt = new Date();
    if (teacher) submission.gradedBy = teacher._id as any;

    await assignment.save();

    return res.status(200).json({ success: true, message: 'Submission graded', data: submission });
  } catch (error: any) {
    console.error('Error grading submission:', error);
    return res.status(500).json({ success: false, message: 'Failed to grade submission', error: error.message });
  }
};

// POST /api/teacher/assignments/:id/publish - Publish assignment
export const publishAssignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { teacherEmail } = req.body;

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    if (assignment.teacherEmail !== teacherEmail) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    assignment.status = 'active';
    assignment.assignedDate = new Date();
    await assignment.save();

    return res.status(200).json({ success: true, message: 'Assignment published', data: assignment });
  } catch (error: any) {
    console.error('Error publishing assignment:', error);
    return res.status(500).json({ success: false, message: 'Failed to publish assignment', error: error.message });
  }
};

// DELETE /api/teacher/assignments/:id - Delete assignment
export const deleteAssignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { teacherEmail } = req.query;

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    if (assignment.teacherEmail !== teacherEmail) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    assignment.isActive = false;
    await assignment.save();

    return res.status(200).json({ success: true, message: 'Assignment deleted' });
  } catch (error: any) {
    console.error('Error deleting assignment:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete assignment', error: error.message });
  }
};

// POST /api/teacher/assignments/:id/plagiarism-check - Check plagiarism for submissions
export const checkPlagiarism = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { teacherEmail } = req.query;

    if (!teacherEmail) {
      return res.status(400).json({ success: false, message: 'Teacher email required' });
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    if (assignment.teacherEmail !== teacherEmail) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Simple plagiarism detection algorithm
    // In production, you would integrate with services like Turnitin, Copyleaks, etc.
    const submissions = assignment.submissions || [];
    const plagiarismResults: any[] = [];

    for (let i = 0; i < submissions.length; i++) {
      const submission1: any = submissions[i];
      if (!submission1.submissionText && !submission1.answerText) continue;

      const text1 = submission1.submissionText || submission1.answerText || '';
      const matches: any[] = [];
      let highestSimilarity = 0;

      for (let j = i + 1; j < submissions.length; j++) {
        const submission2: any = submissions[j];
        if (!submission2.submissionText && !submission2.answerText) continue;

        const text2 = submission2.submissionText || submission2.answerText || '';

        // Calculate similarity (simple Jaccard similarity)
        const similarity = calculateTextSimilarity(text1, text2);

        if (similarity > 30) { // More than 30% similarity
          matches.push({
            studentId: submission2.studentId,
            studentName: submission2.studentName,
            similarity: Math.round(similarity)
          });

          if (similarity > highestSimilarity) {
            highestSimilarity = similarity;
          }
        }
      }

      plagiarismResults.push({
        submissionId: submission1._id || submission1.studentId,
        studentId: submission1.studentId,
        studentName: submission1.studentName || 'Unknown',
        similarityScore: Math.round(highestSimilarity),
        matches: matches,
        risk: highestSimilarity > 70 ? 'high' : highestSimilarity > 40 ? 'medium' : 'low',
        status: highestSimilarity > 70 ? 'flagged' : 'clear'
      });
    }

    // Sort by similarity score (highest first)
    plagiarismResults.sort((a, b) => b.similarityScore - a.similarityScore);

    return res.status(200).json({
      success: true,
      data: {
        assignmentId: assignment._id,
        assignmentTitle: assignment.title,
        totalSubmissions: submissions.length,
        checkedSubmissions: plagiarismResults.length,
        flaggedCount: plagiarismResults.filter(r => r.status === 'flagged').length,
        results: plagiarismResults
      }
    });

  } catch (error: any) {
    console.error('Error checking plagiarism:', error);
    return res.status(500).json({ success: false, message: 'Failed to check plagiarism', error: error.message });
  }
};

// Helper function: Calculate text similarity (Jaccard similarity)
function calculateTextSimilarity(text1: string, text2: string): number {
  // Normalize texts
  const normalize = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3); // Ignore short words
  };

  const words1 = normalize(text1);
  const words2 = normalize(text2);

  if (words1.length === 0 || words2.length === 0) return 0;

  // Calculate intersection and union
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  let intersectionCount = 0;
  set1.forEach(word => {
    if (set2.has(word)) intersectionCount++;
  });

  const unionCount = set1.size + set2.size - intersectionCount;

  return (intersectionCount / unionCount) * 100;
}
