import { Request, Response } from 'express';
import connectDB from '../lib/mongoose';
import Course from '../models/Course';
import { analyzeCourseForRecommendations } from '../ai/flows/course-recommendations';

/**
 * POST /api/admin/recommendations
 * Analyze a course for recommendations
 */
export const analyzeCourse = async (req: Request, res: Response) => {
  try {
    await connectDB();
    const { courseId, mode = 'auto', targetGrades, targetAudience, difficultyLevel, recommendedFor } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        error: 'Course ID is required'
      });
    }

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
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

    res.json({
      success: true,
      result: {
        courseId,
        recommendationData,
        mode
      }
    });

  } catch (err: any) {
    console.error('Course recommendation analysis error:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

/**
 * GET /api/admin/recommendations
 * Get recommendation statistics
 */
export const getRecommendationStats = async (req: Request, res: Response) => {
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

    res.json({
      success: true,
      result: {
        stats: {
          totalCourses,
          analyzedCourses,
          gradeDistribution: gradeDistribution.map(item => [item._id, item.count])
        },
        recentAnalyses
      }
    });

  } catch (err: any) {
    console.error('Recommendation stats error:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

/**
 * GET /api/admin/recommendations/course-changes
 * Get courses that have been modified or need re-analysis
 */
export const getCourseChanges = async (req: Request, res: Response) => {
  const since = req.query.since as string;

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

    res.json({
      success: true,
      data: {
        changedCourses: allChangedCourses,
        hasChanges: allChangedCourses.length > 0,
        totalChanged: allChangedCourses.length
      }
    });

  } catch (err: any) {
    console.error('Course changes check error:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

/**
 * PUT /api/admin/recommendations/analyze-all
 * Analyze all courses for recommendations
 */
export const analyzeAllCourses = async (req: Request, res: Response) => {
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
          return { 
            courseId: course._id, 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          };
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

    res.json({
      success: true,
      message: `Analyzed ${successCount} out of ${courses.length} courses`,
      data: {
        totalCourses: courses.length,
        analyzedCourses: successCount,
        results
      }
    });

  } catch (err: any) {
    console.error('Batch analysis error:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};
