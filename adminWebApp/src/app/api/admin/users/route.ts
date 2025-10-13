import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Teacher, { ITeacher } from '@/lib/models/Teacher';
import Student, { IStudent } from '@/lib/models/Student';

// Response types for API
interface StudentResponse {
  _id: string;
  id: string;
  full_name: string;
  email: string;
  grade: number;
  address: {
    institution: string;
    district: string;
    province: string;
  };
  avatarEmoji: string;
  profileImage: string | null;
  enrolledCourses: string[];
  lastLogin: string;
  createdAt: string;
}

interface TeacherResponse {
  _id: string;
  id: string;
  full_name: string;
  email: string;
  role: string;
  subject?: string | null;
  profileImage?: string | null;
  status: string;
  lastLogin: string;
  createdAt: string;
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const url = new URL(req.url);
    const type = url.searchParams.get('type'); // 'students', 'teachers', or 'all'
    const grade = url.searchParams.get('grade');
    const sort = url.searchParams.get('sort'); // 'alphabetical', 'grade'
    const enrolledIn = url.searchParams.get('enrolledIn'); // course ID

    let students: StudentResponse[] = [];
    let teachers: TeacherResponse[] = [];

    // Import mongoose for direct database queries
    const mongoose = (await import('mongoose')).default;

    // Fetch students
    if (type === 'students' || type === 'all') {
      let studentQuery = Student.find({}).select('-password');

      // Apply filters
      if (grade && grade !== 'all') {
        studentQuery = studentQuery.where('grade').equals(parseInt(grade));
      }

      // Apply sorting
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

    // Fetch teachers from database
    if (type === 'teachers' || type === 'all') {
      try {
        await dbConnect();

        let teacherQuery = Teacher.find({}).select('-password');

        // Apply sorting
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
        // Fallback to empty array
        teachers = [];
      }
    }

    // Return appropriate data based on type
    if (type === 'students') {
      return Response.json({ students });
    } else if (type === 'teachers') {
      return Response.json({ teachers });
    } else {
      return Response.json({ students, teachers });
    }

  } catch (error) {
    console.error('Error in users API:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}