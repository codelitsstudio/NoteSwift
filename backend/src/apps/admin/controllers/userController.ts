import { Request, Response, NextFunction } from 'express';
import connectDB from '@core/lib/mongoose';
import Teacher from '../models/Teacher';
import Student from '../models/Student';

/**
 * GET /api/admin/users
 * Get users (students and/or teachers) with filtering
 */
export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await connectDB();

    const { type, grade, sort, enrolledIn } = req.query;

    let students: any[] = [];
    let teachers: any[] = [];

    // Fetch students
    if (type === 'students' || type === 'all') {
      let studentQuery = Student.find({}).select('-password');

      // Filters
      if (grade && grade !== 'all') {
        studentQuery = studentQuery.where('grade').equals(parseInt(grade as string));
      }

      // Sorting
      if (sort === 'alphabetical') {
        studentQuery = studentQuery.sort({ full_name: 1 });
      } else if (sort === 'grade') {
        studentQuery = studentQuery.sort({ grade: -1 });
      } else {
        studentQuery = studentQuery.sort({ lastLogin: -1 });
      }

      const studentDocs = await studentQuery.exec();

      students = studentDocs.map((doc: any) => ({
        _id: doc._id.toString(),
        id: doc._id.toString(),
        full_name: doc.full_name,
        email: doc.email,
        grade: doc.grade,
        address: doc.address,
        avatarEmoji: doc.avatarEmoji || '👤',
        profileImage: doc.profileImage || null,
        enrolledCourses: doc.enrolledCourses || [],
        lastLogin: doc.lastLogin?.toISOString() || new Date().toISOString(),
        createdAt: doc.createdAt?.toISOString() || new Date().toISOString()
      }));
    }

    // Fetch teachers
    if (type === 'teachers' || type === 'all') {
      try {
        let teacherQuery = Teacher.find({}).select('-password');

        // Sorting
        if (sort === 'alphabetical') {
          teacherQuery = teacherQuery.sort({ fullName: 1, firstName: 1, lastName: 1 });
        } else {
          teacherQuery = teacherQuery.sort({ updatedAt: -1 });
        }

        const teacherDocs = await teacherQuery.exec();

        teachers = teacherDocs.map((doc: any) => ({
          _id: doc._id.toString(),
          id: doc._id.toString(),
          full_name: doc.fullName || `${doc.firstName || ''} ${doc.lastName || ''}`.trim(),
          email: doc.email,
          role: 'Teacher',
          subject: doc.subjects && doc.subjects.length > 0
            ? doc.subjects.length === 1
              ? doc.subjects[0].name
              : `${doc.subjects[0].name} +${doc.subjects.length - 1}`
            : null,
          profileImage: doc.verificationDocuments?.profile?.[0]?.url || null,
          status: doc.status || 'active',
          lastLogin: doc.updatedAt?.toISOString() || new Date().toISOString(),
          createdAt: doc.createdAt?.toISOString() || new Date().toISOString()
        }));
      } catch (error) {
        console.error('Error fetching teachers:', error);
        teachers = [];
      }
    }

    // Return data based on type
    if (type === 'students') {
      res.json({ students });
      return;
    } else if (type === 'teachers') {
      res.json({ teachers });
      return;
    } else {
      res.json({ students, teachers });
      return;
    }
  } catch (error) {
    console.error('Error in users API:', error);
    res.status(500).json({ error: 'Internal server error' });
      return;
  }
};

/**
 * GET /api/admin/users/:id
 * Get single user details
 */
export const getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await connectDB();
    const { id } = req.params;

    // Try finding as student first
    const student = await Student.findById(id).select('-password').lean();
    if (student) {
      res.json({ success: true, data: { user: student, type: 'student' } });
      return;
    }

    // Try as teacher
    const teacher = await Teacher.findById(id).select('-password').lean();
    if (teacher) {
      res.json({ success: true, data: { user: teacher, type: 'teacher' } });
      return;
    }

    res.status(404).json({ success: false, error: 'User not found' });
      return;
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
      return;
  }
};
