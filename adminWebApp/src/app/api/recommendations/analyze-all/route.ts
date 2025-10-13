import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongoose';
import Course from '@/lib/models/Course';
import { analyzeCourseForRecommendations } from '@/ai/flows/course-recommendations';

export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const courses = await Course.find({});

    // Analyze courses in batches to avoid overwhelming the system
    const batchSize = 5;
    const results = [];

    for (let i = 0; i < courses.length; i += batchSize) {
      const batch = courses.slice(i, i + batchSize);
      const batchPromises = batch.map(async (course) => {
        try {
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
          const recommendationData = {
            ...aiResult,
            lastAnalyzed: new Date()
          };

          await Course.findByIdAndUpdate(course._id, {
            recommendationData
          });

          return { courseId: course._id, success: true };
        } catch (error) {
          console.error(`Error analyzing course ${course._id}:`, error);
          return { courseId: course._id, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Small delay between batches
      if (i + batchSize < courses.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    const successCount = results.filter(r => r.success).length;

    return new Response(JSON.stringify({
      success: true,
      message: `Analyzed ${successCount} out of ${courses.length} courses`,
      data: {
        totalCourses: courses.length,
        analyzedCourses: successCount,
        results
      }
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (err: any) {
    console.error('Batch analysis error:', err);
    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}