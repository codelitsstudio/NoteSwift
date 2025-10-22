import { Request, Response, NextFunction } from 'express';
import connectDB from '@core/lib/mongoose';
import Course from '../models/Course';
import { createAuditLogFromRequest } from '../utils/auditLogger';

/**
 * GET /api/admin/admin/courses
 * List courses for dropdown (lightweight)
 */
export const listCoursesDropdown = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await connectDB();
    // Only fetch essential fields for dropdown
    const courses = await Course.find({}, '_id title type')
      .sort({ title: 1 })
      .limit(1000)
      .lean();
    res.json({ success: true, data: courses });
  } catch (err: any) {
    console.error('courses dropdown fetch error:', err);
    res.status(500).json({ success: false, error: err.message });
      return;
  }
};

/**
 * GET /api/admin/courses
 * List all courses (full data)
 */
export const listCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await connectDB();
    const courses = await Course.find({}).select('-__v').lean();
    res.json({ success: true, result: { courses } });
  } catch (err: any) {
    console.error('courses fetch error:', err);
    res.status(500).json({ success: false, error: err.message });
      return;
  }
};

/**
 * POST /api/admin/courses
 * Create a new course
 */
export const createCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await connectDB();
    const body = req.body;

    // Validate required fields
    if (!body.type || !['free', 'pro', 'featured'].includes(body.type)) {
      res.status(400).json({ 
        success: false, 
        error: 'Valid course type (free, pro, or featured) is required.' 
      });
    }

    if (!body.program || !['SEE', '+2', 'Bachelor', 'CTEVT'].includes(body.program)) {
      res.status(400).json({ 
        success: false, 
        error: 'Valid program (SEE, +2, Bachelor, or CTEVT) is required.' 
      });
    }

    // Set isFeatured based on type (all featured courses should be pro)
    body.isFeatured = body.type === 'featured';
    if (body.isFeatured) {
      body.type = 'pro';
    }

    // Ensure subjects is present and valid
    if (!Array.isArray(body.subjects) || body.subjects.length === 0 || !body.subjects[0].name) {
      res.status(400).json({ 
        success: false, 
        error: 'At least one subject with a name is required.' 
      });
    }

    // Set price based on type
    if (body.type === 'free') {
      body.price = 0;
    } else if (!body.price && body.type === 'pro') {
      body.price = 1000; // Default pro course price
    }

    const course = new Course(body);
    await course.save();

    // Create audit log
    const admin = (req as any).admin;
    await createAuditLogFromRequest(req, {
      userId: admin?._id,
      userType: 'admin',
      userName: admin?.name || 'Admin',
      userEmail: admin?.email,
      action: 'course_created',
      category: 'course_content',
      resourceType: 'course',
      resourceId: (course._id as any).toString(),
      resourceName: course.title,
      details: `Admin created new course "${course.title}" (${course.type}, ${course.program})`,
      status: 'success'
    });

    res.status(201).json({ success: true, result: { course } });
      return;
  } catch (err: any) {
    console.error('course create error:', err);
    res.status(500).json({ success: false, error: err.message });
      return;
  }
};

/**
 * GET /api/admin/courses/:id
 * Get single course details
 */
export const getCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await connectDB();
    const course = await Course.findById(req.params.id).select('-__v').lean();

    if (!course) {
      res.status(404).json({ success: false, error: 'Course not found' });
      return;
    }

    res.json({ success: true, result: { course } });
  } catch (err: any) {
    console.error('course fetch error:', err);
    res.status(500).json({ success: false, error: err.message });
      return;
  }
};

/**
 * PUT /api/admin/courses/:id
 * Update a course
 */
export const updateCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await connectDB();
    const body = req.body;

    // Set isFeatured based on type
    if (body.type === 'featured') {
      body.isFeatured = true;
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!course) {
      res.status(404).json({ success: false, error: 'Course not found' });
      return;
    }

    // Create audit log
    const admin = (req as any).admin;
    await createAuditLogFromRequest(req, {
      userId: admin?._id,
      userType: 'admin',
      userName: admin?.name || 'Admin',
      userEmail: admin?.email,
      action: 'course_updated',
      category: 'course_content',
      resourceType: 'course',
      resourceId: req.params.id,
      resourceName: course.title,
      details: `Admin updated course "${course.title}"`,
      status: 'success'
    });

    res.json({ success: true, result: { course } });
  } catch (err: any) {
    console.error('course update error:', err);
    res.status(500).json({ success: false, error: err.message });
      return;
  }
};

/**
 * DELETE /api/admin/courses/:id
 * Delete a course
 */
export const deleteCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await connectDB();
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      res.status(404).json({ success: false, error: 'Course not found' });
      return;
    }

    // Create audit log
    const admin = (req as any).admin;
    await createAuditLogFromRequest(req, {
      userId: admin?._id,
      userType: 'admin',
      userName: admin?.name || 'Admin',
      userEmail: admin?.email,
      action: 'course_deleted',
      category: 'course_content',
      resourceType: 'course',
      resourceId: req.params.id,
      resourceName: (course as any).title,
      details: `Admin deleted course "${(course as any).title}"`,
      status: 'warning'
    });

    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (err: any) {
    console.error('course delete error:', err);
    res.status(500).json({ success: false, error: err.message });
      return;
  }
};
