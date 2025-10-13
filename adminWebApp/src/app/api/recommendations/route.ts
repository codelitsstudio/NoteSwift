import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongoose';
import Course from '@/lib/models/Course';
import { analyzeCourseForRecommendations } from '@/ai/flows/course-recommendations';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { courseId, mode = 'auto', targetGrades, targetAudience, difficultyLevel, recommendedFor } = body;

    if (!courseId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Course ID is required'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Course not found'
      }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    let recommendationData;

    if (mode === 'auto') {
      // Use AI to analyze the course
      const analysisInput = {
        title: course.title,
        description: course.description,
        subjects: course.subjects?.map(s => ({
          name: s.name,
          description: s.description
        })),
        tags: course.tags,
        program: course.program || 'SEE'
      };

      const aiResult = await analyzeCourseForRecommendations(analysisInput);
      recommendationData = {
        ...aiResult,
        lastAnalyzed: new Date()
      };
    } else {
      // Manual mode - use provided data
      recommendationData = {
        targetGrades: targetGrades || [],
        targetAudience: targetAudience || '',
        difficultyLevel: difficultyLevel || 'Beginner',
        recommendedFor: recommendedFor || [],
        confidence: 1, // Manual entries have full confidence
        lastAnalyzed: new Date()
      };
    }

    // Update the course with recommendation data
    await Course.findByIdAndUpdate(courseId, {
      recommendationData
    });

    return new Response(JSON.stringify({
      success: true,
      result: {
        courseId,
        recommendationData,
        mode
      }
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (err: any) {
    console.error('Course recommendation analysis error:', err);
    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

// Get recommendation settings/stats
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const totalCourses = await Course.countDocuments();
    const analyzedCourses = await Course.countDocuments({
      'recommendationData.lastAnalyzed': { $exists: true }
    });

    // Get grade distribution from analyzed courses
    const gradeDistribution = await Course.aggregate([
      { $match: { 'recommendationData.lastAnalyzed': { $exists: true } } },
      { $unwind: '$recommendationData.targetGrades' },
      { $group: { _id: '$recommendationData.targetGrades', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const recentAnalyses = await Course.find({
      'recommendationData.lastAnalyzed': { $exists: true }
    })
    .select('title recommendationData.lastAnalyzed recommendationData.confidence')
    .sort({ 'recommendationData.lastAnalyzed': -1 })
    .limit(5);

    return new Response(JSON.stringify({
      success: true,
      result: {
        stats: {
          totalCourses,
          analyzedCourses,
          gradeDistribution: gradeDistribution.map(item => [item._id, item.count])
        },
        recentAnalyses
      }
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (err: any) {
    console.error('Recommendation stats error:', err);
    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}