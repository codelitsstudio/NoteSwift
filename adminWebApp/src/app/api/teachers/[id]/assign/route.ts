import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongoose';
import Teacher from '@/lib/models/Teacher';
import Course from '@/lib/models/Course';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { subject, courseIds } = await req.json();
    const resolvedParams = await params;

    // Find the teacher
    const teacher = await Teacher.findById(resolvedParams.id);
    if (!teacher) {
      return new Response(JSON.stringify({ success: false, message: 'Teacher not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    // Update subjects if provided
    if (subject) {
      teacher.subjects = [{ name: subject }];
    }

    // Update assigned courses if provided
    if (courseIds && Array.isArray(courseIds)) {
      const courses = await Course.find({ _id: { $in: courseIds } }).select('_id title').lean();
      teacher.assignedCourses = courses.map((course: any) => ({
        courseId: course._id.toString(),
        courseName: course.title,
        subject: subject || 'General', // Use the subject from request or default
        assignedAt: new Date(),
      }));
    }

    await teacher.save();

    return new Response(JSON.stringify({ success: true, message: 'Teacher assigned successfully' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error('teacher assign error:', err);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}