import { Request, Response } from 'express';
import Announcement from '../models/Announcement.model';
import SubjectContent from '../models/SubjectContent.model';
import Teacher from '../models/Teacher.model';
import CourseEnrollment from '../models/CourseEnrollment';

// Middleware to verify teacher owns the subject
export const verifySubjectOwnership = async (
  teacherEmail: string,
  subjectContentId: string
): Promise<boolean> => {
  const subjectContent = await SubjectContent.findById(subjectContentId);
  if (!subjectContent) return false;
  return subjectContent.teacherEmail === teacherEmail;
};

// GET /api/teacher/announcements - Get all announcements for teacher's subjects
export const getTeacherAnnouncements = async (req: Request, res: Response) => {
  try {
    const teacherEmail = req.query.teacherEmail as string;
    
    if (!teacherEmail) {
      return res.status(400).json({ 
        success: false, 
        message: 'Teacher email is required' 
      });
    }

    const announcements = await Announcement.find({
      teacherEmail,
      isActive: true
    }).sort({ createdAt: -1 });

    // Calculate stats
    const stats = {
      total: announcements.length,
      sent: announcements.filter(a => a.status === 'sent').length,
      scheduled: announcements.filter(a => a.status === 'scheduled').length,
      draft: announcements.filter(a => a.status === 'draft').length,
      totalRecipients: announcements.reduce((sum, a) => sum + a.totalRecipients, 0),
      totalReads: announcements.reduce((sum, a) => sum + a.readCount, 0)
    };

    return res.status(200).json({
      success: true,
      data: {
        announcements,
        stats
      }
    });
  } catch (error: any) {
    console.error('Error fetching teacher announcements:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch announcements',
      error: error.message
    });
  }
};

// POST /api/teacher/announcements - Create new announcement
export const createAnnouncement = async (req: Request, res: Response) => {
  try {
    const {
      title,
      message,
      priority,
      subjectContentId,
      teacherEmail,
      targetAudience,
      batchIds,
      studentIds,
      scheduledFor,
      attachments
    } = req.body;

    // Verify teacher owns this subject
    const isOwner = await verifySubjectOwnership(teacherEmail, subjectContentId);
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to create announcements for this subject'
      });
    }

    // Get subject content details
    const subjectContent = await SubjectContent.findById(subjectContentId);
    if (!subjectContent) {
      return res.status(404).json({
        success: false,
        message: 'Subject content not found'
      });
    }

    // Get teacher details
    const teacher = await Teacher.findOne({ email: teacherEmail });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Calculate recipients
    let totalRecipients = 0;
    if (targetAudience === 'all') {
      const enrollments = await CourseEnrollment.find({
        courseId: subjectContent.courseId,
        status: 'active'
      });
      totalRecipients = enrollments.length;
    } else if (targetAudience === 'batch' && batchIds) {
      // Would need to query Batch model - for now estimate
      totalRecipients = batchIds.length * 20; // Rough estimate
    } else if (targetAudience === 'specific' && studentIds) {
      totalRecipients = studentIds.length;
    }

    const announcement = new Announcement({
      title,
      message,
      priority: priority || 'medium',
      subjectContentId,
      courseId: subjectContent.courseId,
      courseName: subjectContent.courseName,
      subjectName: subjectContent.subjectName,
      teacherId: teacher._id,
      teacherName: teacher.fullName || `${teacher.firstName} ${teacher.lastName}`,
      teacherEmail: teacher.email,
      targetAudience: targetAudience || 'all',
      batchIds,
      studentIds,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      status: scheduledFor ? 'scheduled' : 'draft',
      totalRecipients,
      attachments
    });

    await announcement.save();

    return res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: announcement
    });
  } catch (error: any) {
    console.error('Error creating announcement:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create announcement',
      error: error.message
    });
  }
};

// PATCH /api/teacher/announcements/:id - Update announcement
export const updateAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { teacherEmail } = req.query;
    const updates = req.body;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Verify ownership
    if (announcement.teacherEmail !== teacherEmail) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this announcement'
      });
    }

    // Cannot edit sent announcements
    if (announcement.status === 'sent') {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit announcements that have been sent'
      });
    }

    Object.assign(announcement, updates);
    await announcement.save();

    return res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      data: announcement
    });
  } catch (error: any) {
    console.error('Error updating announcement:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update announcement',
      error: error.message
    });
  }
};

// POST /api/teacher/announcements/:id/send - Send announcement immediately
export const sendAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { teacherEmail } = req.body;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Verify ownership
    if (announcement.teacherEmail !== teacherEmail) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to send this announcement'
      });
    }

    announcement.status = 'sent';
    announcement.sentAt = new Date();
    await announcement.save();

    // TODO: Implement actual notification sending (push notifications, emails, etc.)

    return res.status(200).json({
      success: true,
      message: 'Announcement sent successfully',
      data: announcement
    });
  } catch (error: any) {
    console.error('Error sending announcement:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send announcement',
      error: error.message
    });
  }
};

// DELETE /api/teacher/announcements/:id - Delete announcement
export const deleteAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { teacherEmail } = req.query;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Verify ownership
    if (announcement.teacherEmail !== teacherEmail) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this announcement'
      });
    }

    announcement.isActive = false;
    await announcement.save();

    return res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting announcement:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete announcement',
      error: error.message
    });
  }
};
