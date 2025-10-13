import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongoose';
import Course from '@/lib/models/Course';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const since = url.searchParams.get('since');

  try {
    await connectDB();

    let query: any = {};

    if (since) {
      // Check for courses updated since the given timestamp
      query.updatedAt = { $gt: new Date(since) };
    }

    // Get courses that have been modified or are new (no recommendation data)
    const modifiedCourses = await Course.find({
      ...query,
      $or: [
        { recommendationData: { $exists: false } },
        { updatedAt: { $gt: new Date(since || '2020-01-01') } }
      ]
    }).select('_id title status program updatedAt');

    // Also check for courses that exist but don't have recommendation data
    const unanalyzedCourses = await Course.find({
      recommendationData: { $exists: false }
    }).select('_id title status program updatedAt');

    const allChangedCourses = [...modifiedCourses, ...unanalyzedCourses.filter(course =>
      !modifiedCourses.some(modified => modified._id.toString() === course._id.toString())
    )];

    return new Response(JSON.stringify({
      success: true,
      data: {
        changedCourses: allChangedCourses,
        hasChanges: allChangedCourses.length > 0,
        totalChanged: allChangedCourses.length
      }
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (err: any) {
    console.error('Course changes check error:', err);
    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}