import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Teacher from '@/lib/models/Teacher';
import Student from '@/lib/models/Student';
import Course from '@/lib/models/Course';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const userId = params.id;
    const url = new URL(req.url);
    const userType = url.searchParams.get('type'); // 'student' or 'teacher'

    // Import mongoose for direct database queries
    const mongoose = (await import('mongoose')).default;

    if (userType === 'student') {
      try {
        await dbConnect();

        const studentDoc = await Student.findById(userId).select('-password').lean();

        if (studentDoc) {
          const userDetails = {
            _id: studentDoc._id.toString(),
            id: studentDoc._id.toString(),
            full_name: studentDoc.full_name,
            email: studentDoc.email,
            grade: studentDoc.grade,
            address: studentDoc.address,
            profileImage: studentDoc.profileImage || null,
            type: 'student',
            enrolledCourses: (studentDoc.enrolledCourses || []).map(courseId => ({
              id: courseId,
              name: `Course ${courseId}`, // Placeholder - would need course lookup
              progress: Math.floor(Math.random() * 100) // Placeholder - would need progress lookup
            })),
            courseProgress: (studentDoc.enrolledCourses || []).map(courseId => ({
              courseId,
              courseName: `Course ${courseId}`,
              progress: Math.floor(Math.random() * 100),
              lastAccessed: new Date().toISOString()
            })),
            lastLogin: studentDoc.lastLogin?.toISOString() || new Date().toISOString(),
            createdAt: studentDoc.createdAt?.toISOString() || new Date().toISOString()
          };

          return Response.json(userDetails);
        }
      } catch (error) {
        console.error('Error fetching student details:', error);
      }
    }

    if (userType === 'teacher') {
      try {
        await dbConnect();

        const teacherDoc = await Teacher.findById(userId).select('-password').lean();

        if (teacherDoc) {
          const teacherCourses = await Course.find({
            offeredBy: (teacherDoc as any).fullName || `${(teacherDoc as any).firstName || ''} ${(teacherDoc as any).lastName || ''}`.trim()
          }).select('title enrolledCount status createdAt').lean();

          const userDetails = {
            _id: teacherDoc._id.toString(),
            id: teacherDoc._id.toString(),
            // Basic info
            email: teacherDoc.email,
            firstName: (teacherDoc as any).firstName,
            lastName: (teacherDoc as any).lastName,
            fullName: (teacherDoc as any).fullName || `${(teacherDoc as any).firstName || ''} ${(teacherDoc as any).lastName || ''}`.trim(),
            phoneNumber: (teacherDoc as any).phoneNumber,
            dateOfBirth: (teacherDoc as any).dateOfBirth,
            gender: (teacherDoc as any).gender,
            // Address
            address: (teacherDoc as any).address,
            // Institution
            institution: (teacherDoc as any).institution,
            // Professional info
            subjects: (teacherDoc as any).subjects,
            qualifications: (teacherDoc as any).qualifications,
            experience: (teacherDoc as any).experience,
            bio: (teacherDoc as any).bio,
            // Documents
            verificationDocuments: (teacherDoc as any).verificationDocuments,
            // Status
            agreementAccepted: (teacherDoc as any).agreementAccepted,
            onboardingComplete: (teacherDoc as any).onboardingComplete,
            onboardingStep: (teacherDoc as any).onboardingStep,
            status: (teacherDoc as any).status,
            approvalStatus: (teacherDoc as any).approvalStatus,
            approvedAt: (teacherDoc as any).approvedAt,
            rejectedAt: (teacherDoc as any).rejectedAt,
            // Timestamps
            createdAt: (teacherDoc as any).createdAt?.toISOString(),
            updatedAt: (teacherDoc as any).updatedAt?.toISOString(),
            // Additional fields for UI compatibility
            type: 'teacher',
            role: 'Teacher',
            subject: (teacherDoc as any).subjects?.[0]?.name || null,
            courses: teacherCourses.map(course => ({
              id: course._id.toString(),
              name: course.title,
              students: course.enrolledCount || 0,
              status: course.status,
              createdAt: course.createdAt?.toISOString()
            })),
            lastLogin: (teacherDoc as any).updatedAt?.toISOString() || new Date().toISOString()
          };

          return Response.json(userDetails);
        }
      } catch (error) {
        console.error('Error fetching teacher details:', error);
      }
    }

    return Response.json(
      { error: 'User not found' },
      { status: 404 }
    );

  } catch (error) {
    console.error('Error in user details API:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}