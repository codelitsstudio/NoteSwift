import { Request, Response } from 'express';
import Batch from '../models/Batch.model';
import SubjectContent from '../models/SubjectContent.model';
import Teacher from '../models/Teacher.model';
import CourseEnrollment from '../models/CourseEnrollment';

const verifySubjectOwnership = async (teacherEmail: string, subjectContentId: string): Promise<boolean> => {
  const subjectContent = await SubjectContent.findById(subjectContentId);
  return subjectContent ? subjectContent.teacherEmail === teacherEmail : false;
};

// GET /api/teacher/batches - Get teacher's batches
export const getTeacherBatches = async (req: Request, res: Response) => {
  try {
    const { teacherEmail, subjectContentId, status } = req.query;

    if (!teacherEmail) {
      return res.status(400).json({ success: false, message: 'Teacher email required' });
    }

    const query: any = { teacherEmail, isActive: true };
    if (subjectContentId) query.subjectContentId = subjectContentId;
    if (status) query.status = status;

    const batches = await Batch.find(query).sort({ createdAt: -1 });

    const stats = {
      total: batches.length,
      active: batches.filter(b => b.status === 'active').length,
      totalStudents: batches.reduce((sum, b) => sum + b.totalStudents, 0),
      avgStudentsPerBatch: batches.length > 0 ? batches.reduce((sum, b) => sum + b.totalStudents, 0) / batches.length : 0
    };

    return res.status(200).json({ success: true, data: { batches, stats } });
  } catch (error: any) {
    console.error('Error fetching batches:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch batches', error: error.message });
  }
};

// POST /api/teacher/batches - Create batch
export const createBatch = async (req: Request, res: Response) => {
  try {
    const {
      name, code, description, subjectContentId, teacherEmail,
      schedule, maxStudents, isPublic, requireApproval, startDate, endDate
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

    // Check if code already exists
    const existingBatch = await Batch.findOne({ code: code.toUpperCase() });
    if (existingBatch) {
      return res.status(400).json({ success: false, message: 'Batch code already exists' });
    }

    const batch = new Batch({
      name,
      code: code.toUpperCase(),
      description,
      subjectContentId,
      courseId: subjectContent.courseId,
      courseName: subjectContent.courseName,
      subjectName: subjectContent.subjectName,
      teacherId: teacher._id,
      teacherName: teacher.fullName || `${teacher.firstName} ${teacher.lastName}`,
      teacherEmail: teacher.email,
      schedule: schedule || [],
      maxStudents,
      isPublic: isPublic || false,
      requireApproval: requireApproval !== false,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      students: [],
      status: 'active'
    });

    await batch.save();

    return res.status(201).json({ success: true, message: 'Batch created', data: batch });
  } catch (error: any) {
    console.error('Error creating batch:', error);
    return res.status(500).json({ success: false, message: 'Failed to create batch', error: error.message });
  }
};

// PATCH /api/teacher/batches/:id - Update batch
export const updateBatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { teacherEmail } = req.query;
    const updates = req.body;

    const batch = await Batch.findById(id);
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    if (batch.teacherEmail !== teacherEmail) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    Object.assign(batch, updates);
    await batch.save();

    return res.status(200).json({ success: true, message: 'Batch updated', data: batch });
  } catch (error: any) {
    console.error('Error updating batch:', error);
    return res.status(500).json({ success: false, message: 'Failed to update batch', error: error.message });
  }
};

// POST /api/teacher/batches/:id/students - Add students to batch
export const addStudentsToBatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { teacherEmail, studentIds } = req.body;

    const batch = await Batch.findById(id);
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    if (batch.teacherEmail !== teacherEmail) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Check max students limit
    if (batch.maxStudents && batch.totalStudents + studentIds.length > batch.maxStudents) {
      return res.status(400).json({ success: false, message: 'Batch capacity exceeded' });
    }

    // Verify students are enrolled in the course
    const enrollments = await CourseEnrollment.find({
      courseId: batch.courseId,
      studentId: { $in: studentIds },
      status: 'active'
    }).populate('studentId', 'firstName lastName email');

    if (enrollments.length !== studentIds.length) {
      return res.status(400).json({ success: false, message: 'Some students are not enrolled in the course' });
    }

    // Add students to batch
    enrollments.forEach((e: any) => {
      // Check if student already in batch
      const existing = batch.students.find(s => s.studentId.toString() === e.studentId._id.toString());
      if (!existing) {
        batch.students.push({
          studentId: e.studentId._id,
          studentName: `${e.studentId.firstName} ${e.studentId.lastName}`,
          studentEmail: e.studentId.email,
          enrolledAt: new Date(),
          status: 'active'
        } as any);
      }
    });

    await batch.save();

    return res.status(200).json({ success: true, message: 'Students added to batch', data: batch });
  } catch (error: any) {
    console.error('Error adding students:', error);
    return res.status(500).json({ success: false, message: 'Failed to add students', error: error.message });
  }
};

// DELETE /api/teacher/batches/:id/students/:studentId - Remove student from batch
export const removeStudentFromBatch = async (req: Request, res: Response) => {
  try {
    const { id, studentId } = req.params;
    const { teacherEmail } = req.query;

    const batch = await Batch.findById(id);
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    if (batch.teacherEmail !== teacherEmail) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const studentIndex = batch.students.findIndex(s => s.studentId.toString() === studentId);
    if (studentIndex === -1) {
      return res.status(404).json({ success: false, message: 'Student not in batch' });
    }

    batch.students[studentIndex].status = 'dropped' as any;
    await batch.save();

    return res.status(200).json({ success: true, message: 'Student removed from batch' });
  } catch (error: any) {
    console.error('Error removing student:', error);
    return res.status(500).json({ success: false, message: 'Failed to remove student', error: error.message });
  }
};

// DELETE /api/teacher/batches/:id - Delete batch
export const deleteBatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { teacherEmail } = req.query;

    const batch = await Batch.findById(id);
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    if (batch.teacherEmail !== teacherEmail) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    batch.isActive = false;
    batch.status = 'archived';
    await batch.save();

    return res.status(200).json({ success: true, message: 'Batch deleted' });
  } catch (error: any) {
    console.error('Error deleting batch:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete batch', error: error.message });
  }
};
