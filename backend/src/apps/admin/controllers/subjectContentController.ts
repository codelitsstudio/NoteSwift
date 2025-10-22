import { Request, Response, NextFunction } from 'express';
import connectDB from '@core/lib/mongoose';
import SubjectContent from '../models/SubjectContent';
import Course from '../models/Course';

/**
 * GET /api/admin/subject-content?courseId=id&subjectName=name
 * Get subject content for admin editing
 */
export const getSubjectContent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await connectDB();
    const { courseId, subjectName } = req.query;

    if (!courseId || !subjectName) {
      res.status(400).json({
        success: false,
        message: 'courseId and subjectName are required'
      });
    }

    const subjectContent = await SubjectContent.findOne({
      courseId: courseId,
      subjectName: subjectName as string
    });

    if (!subjectContent) {
      res.status(404).json({
        success: false,
        message: 'Subject content not found'
      });
    }

    res.json({
      success: true,
      result: { subjectContent }
    });
  } catch (err: any) {
    console.error('get subject content error:', err);
    res.status(500).json({ success: false, error: err.message });
      return;
  }
};

/**
 * PUT /api/admin/subject-content/:id
 * Update subject content
 */
export const updateSubjectContent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await connectDB();
    const { id } = req.params;
    const { modules, description } = req.body;

    const subjectContent = await SubjectContent.findByIdAndUpdate(
      id,
      {
        modules: modules,
        description: description,
        lastUpdated: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!subjectContent) {
      res.status(404).json({
        success: false,
        message: 'Subject content not found'
      });
    }

    res.json({
      success: true,
      result: { subjectContent }
    });
  } catch (err: any) {
    console.error('update subject content error:', err);
    res.status(500).json({ success: false, error: err.message });
      return;
  }
};