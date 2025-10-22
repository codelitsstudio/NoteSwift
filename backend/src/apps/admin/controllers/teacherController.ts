import { Request, Response, NextFunction } from 'express';
import connectDB from '@core/lib/mongoose';
import Teacher from '../models/Teacher';
import Course from '../models/Course';
import SubjectContent from '../models/SubjectContent';
import { Resend } from 'resend';
import { createAuditLogFromRequest } from '../utils/auditLogger';

// Lazy initialize Resend to ensure env vars are loaded
const getResend = () => new Resend(process.env.RESEND_API_KEY);

/**
 * GET /api/admin/admin/teachers
 * List teachers for dropdown (placeholder - returns empty list)
 */
export const listTeachersDropdown = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await connectDB();
    // Placeholder: return empty list
    const teachers: any[] = [];
    res.json({ success: true, data: { teachers } });
  } catch (err: any) {
    console.error('Admin teachers dropdown GET error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
      return;
  }
};

/**
 * GET /api/admin/teachers
 * List teachers with filtering by status
 */
export const listTeachers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await connectDB();
    const status = req.query.status || 'pending_approval';

    let query: any = {};
    if (status === 'pending_approval') {
      // Check both fields for pending status, exclude removed
      query = { 
        $and: [
          {
            $or: [
              { approvalStatus: { $exists: false } },
              { registrationStatus: 'pending' }
            ]
          },
          { approvalStatus: { $ne: 'removed' } }
        ]
      };
    } else if (status === 'approved') {
      // Check both fields for approved status, exclude removed
      query = { 
        $and: [
          {
            $or: [
              { approvalStatus: 'approved' },
              { registrationStatus: 'approved' }
            ]
          },
          { approvalStatus: { $ne: 'removed' } }
        ]
      };
    } else if (status === 'rejected') {
      // Check both fields for rejected status, exclude removed
      query = { 
        $and: [
          {
            $or: [
              { approvalStatus: 'rejected' },
              { registrationStatus: 'rejected' }
            ]
          },
          { approvalStatus: { $ne: 'removed' } }
        ]
      };
    } else if (status === 'removed') {
      query = { approvalStatus: 'removed' };
    } else if (status === 'banned') {
      query = { approvalStatus: 'banned' };
    } else {
      // When no status is provided or status is not recognized, return all non-removed teachers
      query = { approvalStatus: { $ne: 'removed' } };
    }

    const teachers = await Teacher.find(query)
      .select('-password -loginAttempts -lockUntil -emailVerificationCode -emailVerificationExpiry')
      .limit(200)
      .lean();

    res.json({ success: true, data: { teachers } });
  } catch (err: any) {
    console.error('admin list teachers error:', err);
    res.status(500).json({ success: false, error: err.message });
      return;
  }
};

/**
 * GET /api/admin/teachers/:id
 * Get single teacher details
 */
export const getTeacher = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await connectDB();
    const teacher = await Teacher.findById(req.params.id)
      .select('-password -loginAttempts -lockUntil -emailVerificationCode -emailVerificationExpiry')
      .lean();
    
    if (!teacher) {
      res.status(404).json({ success: false, message: 'Teacher not found' });
      return;
    }
    
    res.json({ success: true, data: { teacher } });
  } catch (err: any) {
    console.error('admin get teacher error:', err);
    res.status(500).json({ success: false, error: err.message });
      return;
  }
};

/**
 * POST /api/admin/teachers/:id/approve
 * Approve a teacher
 */
export const approveTeacher = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await connectDB();
    const teacher = await Teacher.findById(req.params.id);
    
    if (!teacher) {
      res.status(404).json({ success: false, message: 'Teacher not found' });
      return;
    }

    // Set both fields for compatibility
    teacher.approvalStatus = 'approved';
    (teacher as any).registrationStatus = 'approved';
    teacher.status = 'active';
    await teacher.save();

    // Create audit log
    const admin = (req as any).admin;
    await createAuditLogFromRequest(req, {
      userId: admin?._id,
      userType: 'admin',
      userName: admin?.name || 'Admin',
      userEmail: admin?.email,
      action: 'teacher_approved',
      category: 'user_management',
      resourceType: 'teacher',
      resourceId: (teacher._id as any).toString(),
      resourceName: `${teacher.firstName} ${teacher.lastName}`,
      details: `Admin approved teacher "${teacher.firstName} ${teacher.lastName}" (${teacher.email})`,
      status: 'success'
    });

    // Send email
    try {
      const resend = getResend();
      await resend.emails.send({
        from: 'NoteSwift <noteswift@codelitsstudio.com>',
        to: [teacher.email],
        subject: 'Your account approved',
        html: `<p>Hi ${teacher.firstName || ''}, your account has been approved.</p>`
      });
    } catch (e) {
      console.error('email send error', e);
    }

    res.json({ 
      success: true, 
      data: { id: teacher._id, approvalStatus: teacher.approvalStatus } 
    });
  } catch (err: any) {
    console.error('approve error', err);
    res.status(500).json({ success: false, error: err.message });
      return;
  }
};

/**
 * POST /api/admin/teachers/:id/reject
 * Reject a teacher application
 */
export const rejectTeacher = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await connectDB();
    const { reason } = req.body;
    const teacher = await Teacher.findById(req.params.id);
    
    if (!teacher) {
      res.status(404).json({ success: false, message: 'Teacher not found' });
      return;
    }

    // Set both fields for compatibility
    teacher.approvalStatus = 'rejected';
    (teacher as any).registrationStatus = 'rejected';
    teacher.status = 'inactive';
    (teacher as any).rejectionReason = reason || 'Not specified';
    await teacher.save();

    // Create audit log
    const admin = (req as any).admin;
    await createAuditLogFromRequest(req, {
      userId: admin?._id,
      userType: 'admin',
      userName: admin?.name || 'Admin',
      userEmail: admin?.email,
      action: 'teacher_rejected',
      category: 'user_management',
      resourceType: 'teacher',
      resourceId: (teacher._id as any).toString(),
      resourceName: `${teacher.firstName} ${teacher.lastName}`,
      details: `Admin rejected teacher "${teacher.firstName} ${teacher.lastName}" (${teacher.email}). Reason: ${reason || 'Not specified'}`,
      status: 'success',
      metadata: {
        additionalData: { rejectionReason: reason || 'Not specified' }
      }
    });

    // Send email
    try {
      const resend = getResend();
      await resend.emails.send({
        from: 'NoteSwift <noteswift@codelitsstudio.com>',
        to: [teacher.email],
        subject: 'Your account application result',
        html: `<p>Hi ${teacher.firstName || ''}, your application was not approved. Reason: ${reason || 'Not specified'}</p>`
      });
    } catch (e) {
      console.error('email send error', e);
    }

    res.json({ 
      success: true, 
      data: { id: teacher._id, approvalStatus: teacher.approvalStatus } 
    });
  } catch (err: any) {
    console.error('reject error', err);
    res.status(500).json({ success: false, error: err.message });
      return;
  }
};

/**
 * POST /api/admin/teachers/:id/ban
 * Ban a teacher
 */
export const banTeacher = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await connectDB();
    const { reason } = req.body;
    const teacher = await Teacher.findById(req.params.id);
    
    if (!teacher) {
      res.status(404).json({ success: false, message: 'Teacher not found' });
      return;
    }

    teacher.approvalStatus = 'banned';
    teacher.status = 'banned';
    (teacher as any).banReason = reason || 'Violation of terms';
    await teacher.save();

    // Create audit log
    const admin = (req as any).admin;
    await createAuditLogFromRequest(req, {
      userId: admin?._id,
      userType: 'admin',
      userName: admin?.name || 'Admin',
      userEmail: admin?.email,
      action: 'teacher_banned',
      category: 'user_management',
      resourceType: 'teacher',
      resourceId: (teacher._id as any).toString(),
      resourceName: `${teacher.firstName} ${teacher.lastName}`,
      details: `Admin banned teacher "${teacher.firstName} ${teacher.lastName}" (${teacher.email}). Reason: ${reason || 'Violation of terms'}`,
      status: 'warning',
      metadata: {
        additionalData: { banReason: reason || 'Violation of terms' }
      }
    });

    // Send email
    try {
      const resend = getResend();
      await resend.emails.send({
        from: 'NoteSwift <noteswift@codelitsstudio.com>',
        to: [teacher.email],
        subject: 'Account Banned',
        html: `<p>Hi ${teacher.firstName || ''}, your account has been banned from NoteSwift. Reason: ${reason || 'Violation of terms'}</p>`
      });
    } catch (e) {
      console.error('email send error', e);
    }

    res.json({ 
      success: true, 
      data: { id: teacher._id, approvalStatus: teacher.approvalStatus } 
    });
  } catch (err: any) {
    console.error('ban error', err);
    res.status(500).json({ success: false, error: err.message });
      return;
  }
};

/**
 * POST /api/admin/teachers/:id/remove
 * Remove a teacher - Permanent deactivation with notification
 */
export const removeTeacher = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await connectDB();
    const { reason } = req.body;
    
    if (!reason || !reason.trim()) {
      res.status(400).json({ success: false, message: 'Reason for removal is required' });
      return;
    }

    const teacher = await Teacher.findById(req.params.id);
    
    if (!teacher) {
      res.status(404).json({ success: false, message: 'Teacher not found' });
      return;
    }

    teacher.approvalStatus = 'removed';
    teacher.status = 'inactive';
    (teacher as any).removalReason = reason.trim();
    (teacher as any).removedAt = new Date();
    await teacher.save();

    // Create audit log
    const admin = (req as any).admin;
    await createAuditLogFromRequest(req, {
      userId: admin?._id,
      userType: 'admin',
      userName: admin?.name || 'Admin',
      userEmail: admin?.email,
      action: 'teacher_removed',
      category: 'user_management',
      resourceType: 'teacher',
      resourceId: (teacher._id as any).toString(),
      resourceName: `${teacher.firstName} ${teacher.lastName}`,
      details: `Admin permanently removed teacher "${teacher.firstName} ${teacher.lastName}" (${teacher.email}). Reason: ${reason.trim()}`,
      status: 'warning',
      metadata: {
        additionalData: {
          teacherEmail: teacher.email,
          removalReason: reason.trim()
        }
      }
    });

    // Send professional email notification
    try {
      const resend = getResend();
      await resend.emails.send({
        from: 'NoteSwift <noteswift@codelitsstudio.com>',
        to: [teacher.email],
        subject: 'Account Removed - NoteSwift',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Account Removal Notice</h2>
            <p>Dear ${teacher.firstName} ${teacher.lastName},</p>
            <p>Your teacher account on NoteSwift has been permanently removed.</p>
            
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
              <strong>Reason for Removal:</strong>
              <p style="margin: 10px 0 0 0;">${reason.trim()}</p>
            </div>
            
            <p>As a result of this action:</p>
            <ul>
              <li>You no longer have access to the teacher dashboard</li>
              <li>Your courses and materials are no longer accessible</li>
              <li>Students will be notified of any course changes</li>
            </ul>
            
            <p>If you believe this is a mistake or have any questions, please contact our support team.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
              <p>Date: ${new Date().toLocaleString()}</p>
              <p>This is an automated notification from NoteSwift.</p>
            </div>
          </div>
        `,
      });
      console.log(`Removal notification email sent to ${teacher.email}`);
    } catch (e) {
      console.error('Failed to send removal notification email:', e);
      // Continue even if email fails
    }

    res.json({ 
      success: true,
      message: 'Teacher removed successfully and notified via email',
      data: { id: teacher._id, approvalStatus: teacher.approvalStatus } 
    });
  } catch (err: any) {
    console.error('remove error', err);
    res.status(500).json({ success: false, error: err.message });
      return;
  }
};

/**
 * POST /api/admin/teachers/:id/assign
 * Assign teacher to a course subject
 */
export const assignTeacher = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await connectDB();
    const { courseId, subjectName } = req.body;

    if (!courseId || !subjectName) {
      res.status(400).json({ 
        success: false, 
        message: 'courseId and subjectName are required' 
      });
    }

    // Find the teacher
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      res.status(404).json({ success: false, message: 'Teacher not found' });
      return;
    }

    // Find the course and verify subject exists
    const course = await Course.findById(courseId).lean();
    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }

    // Verify subject exists in course
    const subjectExists = course.subjects?.some((s: any) => s.name === subjectName);
    if (!subjectExists) {
      res.status(400).json({ 
        success: false, 
        message: `Subject "${subjectName}" not found in course` 
      });
    }

    // Get the subject details
    const subjectData = course.subjects?.find((s: any) => s.name === subjectName);

    // Check if teacher is already assigned to this subject
    const existingAssignment = teacher.assignedCourses?.find(
      (ac: any) => ac.courseId === courseId && ac.subject === subjectName
    );

    if (!existingAssignment) {
      // Add assignment to teacher
      if (!teacher.assignedCourses) {
        teacher.assignedCourses = [];
      }
      teacher.assignedCourses.push({
        courseId: courseId,
        courseName: course.title,
        subject: subjectName,
        assignedAt: new Date(),
      });

      // Update teacher subjects list
      const subjectInList = teacher.subjects?.find((s: any) => s.name === subjectName);
      if (!subjectInList) {
        if (!teacher.subjects) {
          teacher.subjects = [];
        }
        teacher.subjects.push({ name: subjectName });
      }

      await teacher.save();
    }

    // Create or update SubjectContent
    let subjectContent = await SubjectContent.findOne({
      courseId: courseId,
      subjectName: subjectName
    });

    if (!subjectContent) {
      // Initialize modules from course subject modules with full details
      const modules = subjectData?.modules?.map((module: any, index: number) => ({
        moduleNumber: index + 1,
        moduleName: module.name || `Module ${index + 1}`,
        hasVideo: module.hasVideo || false,
        videoUrl: module.videoUrl,
        videoTitle: module.videoTitle || module.name,
        videoDuration: module.videoDuration,
        videoUploadedAt: module.videoUploadedAt,
        
        hasNotes: module.hasNotes || false,
        notesUrl: module.notesUrl,
        notesTitle: module.notesTitle || module.name,
        notesUploadedAt: module.notesUploadedAt,
        
        hasLiveClass: module.hasLiveClass || false,
        liveClassSchedule: module.liveClassSchedule || [],
        
        hasTest: module.hasTest || false,
        testIds: module.testIds || [],
        
        hasQuestions: module.hasQuestions || false,
        questionIds: module.questionIds || [],
        
        order: module.order || index + 1,
        isActive: module.isActive !== false
      })) || [];

      subjectContent = new SubjectContent({
        courseId: courseId,
        courseName: course.title,
        subjectName: subjectName,
        teacherId: teacher._id,
        teacherName: `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim(),
        teacherEmail: teacher.email,
        modules: modules,
        description: subjectData?.description || '',
        isActive: true
      });

      await subjectContent.save();
    } else {
      // Update teacher info if changed
      subjectContent.teacherId = teacher._id as any;
      subjectContent.teacherName = `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim();
      subjectContent.teacherEmail = teacher.email;
      await subjectContent.save();
    }

    res.json({ 
      success: true, 
      message: 'Teacher assigned to subject successfully',
      data: {
        courseId,
        courseName: course.title,
        subjectName,
        teacherName: `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim()
      }
    });
  } catch (err: any) {
    console.error('teacher assign error:', err);
    res.status(500).json({ success: false, error: err.message });
      return;
  }
};

/**
 * POST /api/admin/teachers/:id/remove-assignment
 * Remove teacher assignment from a course subject
 */
export const removeAssignment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await connectDB();
    const { courseId, subject } = req.body;

    if (!courseId || !subject) {
      res.status(400).json({ 
        success: false, 
        message: 'courseId and subject are required' 
      });
    }

    // Find the teacher
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      res.status(404).json({ success: false, message: 'Teacher not found' });
      return;
    }

    // Find the assignment and remove it
    if (!teacher.assignedCourses) {
      res.status(400).json({ 
        success: false, 
        message: 'Teacher has no assignments' 
      });
      return;
    }

    const assignmentIndex = teacher.assignedCourses.findIndex(
      (ac: any) => ac.courseId === courseId && ac.subject === subject
    );

    if (assignmentIndex === -1) {
      res.status(404).json({ 
        success: false, 
        message: 'Assignment not found' 
      });
      return;
    }

    // Remove the assignment
    teacher.assignedCourses.splice(assignmentIndex, 1);
    await teacher.save();

    // Update SubjectContent to remove teacher assignment
    const subjectContent = await SubjectContent.findOne({
      courseId: courseId,
      subjectName: subject
    });

    if (subjectContent && subjectContent.teacherId?.toString() === (teacher._id as any).toString()) {
      // Clear teacher info from subject content using $unset
      await SubjectContent.updateOne(
        { _id: subjectContent._id },
        { $unset: { teacherId: 1, teacherName: 1, teacherEmail: 1 } }
      );
    }

    res.json({ 
      success: true, 
      message: 'Assignment removed successfully',
      data: {
        courseId,
        subject,
        teacherName: `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim()
      }
    });
  } catch (err: any) {
    console.error('teacher remove assignment error:', err);
    res.status(500).json({ success: false, error: err.message });
      return;
  }
};
