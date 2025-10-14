import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Course from '@/lib/models/Course';
import { verifyAdmin } from '@/lib/auth/admin-auth';

// GET /api/admin/courses - Get all courses for dropdown (optimized)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Verify admin authentication
    const authResult = await verifyAdmin(req);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only fetch essential fields and limit results for performance
    const courses = await Course.find({}, '_id title type')
      .sort({ title: 1 })
      .limit(1000); // Reasonable limit for dropdown

    return NextResponse.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch courses'
    }, { status: 500 });
  }
}