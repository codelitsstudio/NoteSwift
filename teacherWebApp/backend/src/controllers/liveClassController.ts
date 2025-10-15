import { Request, Response } from 'express';
import LiveClass, { ILiveClassAttendee } from '../models/LiveClass.model';
import SubjectContent from '../models/SubjectContent.model';
import Teacher from '../models/Teacher.model';
import CourseEnrollment from '../models/CourseEnrollment';

const verifySubjectOwnership = async (teacherEmail: string, subjectContentId: string): Promise<boolean> => {
  const subjectContent = await SubjectContent.findById(subjectContentId);
  return subjectContent ? subjectContent.teacherEmail === teacherEmail : false;
};

// GET /api/teacher/live-classes - Get teacher's live classes
export const getTeacherLiveClasses = async (req: Request, res: Response) => {
  try {
    const { teacherEmail, subjectContentId, status, upcoming } = req.query;

    if (!teacherEmail) {
      return res.status(400).json({ success: false, message: 'Teacher email required' });
    }

    const query: any = { teacherEmail, isActive: true };
    if (subjectContentId) query.subjectContentId = subjectContentId;
    if (status) query.status = status;
    
    // Filter upcoming classes
    if (upcoming === 'true') {
      query.scheduledAt = { $gte: new Date() };
      query.status = { $in: ['scheduled', 'ongoing'] };
    }

    const liveClasses = await LiveClass.find(query).sort({ scheduledAt: -1 });

    const now = new Date();
    const stats = {
      total: liveClasses.length,
      upcoming: liveClasses.filter(lc => lc.scheduledAt > now && lc.status === 'scheduled').length,
      ongoing: liveClasses.filter(lc => lc.status === 'ongoing').length,
      completed: liveClasses.filter(lc => lc.status === 'completed').length,
      totalAttendance: liveClasses.filter(lc => lc.attendanceRate).reduce((sum, lc) => sum + (lc.attendanceRate || 0), 0) / liveClasses.filter(lc => lc.attendanceRate).length || 0
    };

    return res.status(200).json({ success: true, data: { liveClasses, stats } });
  } catch (error: any) {
    console.error('Error fetching live classes:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch live classes', error: error.message });
  }
};

// POST /api/teacher/live-classes - Schedule live class
export const scheduleLiveClass = async (req: Request, res: Response) => {
  try {
    const {
      title, description, topic, subjectContentId, teacherEmail,
      scheduledAt, duration, platform, meetingLink, meetingId, meetingPassword,
      moduleNumber, moduleName, agenda, targetAudience, batchIds, studentIds
    } = req.body;

    if (!await verifySubjectOwnership(teacherEmail, subjectContentId)) {
      return res.status(403).json({ success: false, message: 'Not authorized for this subject' });
    }

    const subjectContent = await SubjectContent.findById(subjectContentId);
    if (!subjectContent) {
      return res.status(404).json({ success: false, message: 'Subject content not found' });
    }

    const teacher = await Teacher.findOne({ email: teacherEmail });
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // Get enrolled students for registration
    let attendees: ILiveClassAttendee[] = [];
    if (targetAudience === 'all') {
      const enrollments = await CourseEnrollment.find({
        courseId: subjectContent.courseId,
        status: 'active'
      }).populate('studentId', 'firstName lastName email');
      
      attendees = enrollments.map((e: any) => ({
        studentId: e.studentId._id,
        studentName: `${e.studentId.firstName} ${e.studentId.lastName}`,
        studentEmail: e.studentId.email,
        status: 'registered'
      } as any));
    }

    const liveClass = new LiveClass({
      title, description, topic,
      subjectContentId,
      courseId: subjectContent.courseId,
      courseName: subjectContent.courseName,
      subjectName: subjectContent.subjectName,
      moduleNumber, moduleName,
      teacherId: teacher._id,
      teacherName: teacher.fullName || `${teacher.firstName} ${teacher.lastName}`,
      teacherEmail: teacher.email,
      scheduledAt: new Date(scheduledAt),
      duration,
      platform: platform || 'meet',
      meetingLink,
      meetingId,
      meetingPassword,
      agenda: agenda || [],
      targetAudience: targetAudience || 'all',
      batchIds, studentIds,
      attendees,
      status: 'scheduled'
    });

    await liveClass.save();

    // Update SubjectContent hasLiveClass flag
    if (moduleNumber) {
      const module = subjectContent.modules.find(m => m.moduleNumber === moduleNumber);
      if (module) {
        module.hasLiveClass = true;
        if (!module.liveClassSchedule) module.liveClassSchedule = [];
        module.liveClassSchedule.push({
          scheduledAt: new Date(scheduledAt),
          duration,
          meetingLink,
          status: 'scheduled'
        });
        await subjectContent.save();
      }
    }

    return res.status(201).json({ success: true, message: 'Live class scheduled', data: liveClass });
  } catch (error: any) {
    console.error('Error scheduling live class:', error);
    return res.status(500).json({ success: false, message: 'Failed to schedule live class', error: error.message });
  }
};

// PATCH /api/teacher/live-classes/:id - Update live class
export const updateLiveClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { teacherEmail } = req.query;
    const updates = req.body;

    const liveClass = await LiveClass.findById(id);
    if (!liveClass) {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }

    if (liveClass.teacherEmail !== teacherEmail) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Cannot edit ongoing or completed classes
    if (liveClass.status === 'ongoing' || liveClass.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Cannot edit ongoing or completed classes' });
    }

    Object.assign(liveClass, updates);
    await liveClass.save();

    return res.status(200).json({ success: true, message: 'Live class updated', data: liveClass });
  } catch (error: any) {
    console.error('Error updating live class:', error);
    return res.status(500).json({ success: false, message: 'Failed to update live class', error: error.message });
  }
};

// POST /api/teacher/live-classes/:id/start - Start live class
export const startLiveClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { teacherEmail } = req.body;

    const liveClass = await LiveClass.findById(id);
    if (!liveClass) {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }

    if (liveClass.teacherEmail !== teacherEmail) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    liveClass.status = 'ongoing';
    liveClass.startedAt = new Date();
    await liveClass.save();

    return res.status(200).json({ success: true, message: 'Live class started', data: liveClass });
  } catch (error: any) {
    console.error('Error starting live class:', error);
    return res.status(500).json({ success: false, message: 'Failed to start live class', error: error.message });
  }
};

// POST /api/teacher/live-classes/:id/end - End live class
export const endLiveClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { teacherEmail, recordingUrl, recordingDuration, recordingSize } = req.body;

    const liveClass = await LiveClass.findById(id);
    if (!liveClass) {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }

    if (liveClass.teacherEmail !== teacherEmail) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    liveClass.status = 'completed';
    liveClass.endedAt = new Date();
    
    if (liveClass.startedAt) {
      liveClass.actualDuration = Math.floor((liveClass.endedAt.getTime() - liveClass.startedAt.getTime()) / 60000);
    }
    
    if (recordingUrl) {
      liveClass.recordingUrl = recordingUrl;
      liveClass.recordingDuration = recordingDuration;
      liveClass.recordingSize = recordingSize;
    }
    
    await liveClass.save();

    return res.status(200).json({ success: true, message: 'Live class ended', data: liveClass });
  } catch (error: any) {
    console.error('Error ending live class:', error);
    return res.status(500).json({ success: false, message: 'Failed to end live class', error: error.message });
  }
};

// POST /api/teacher/live-classes/:id/attendance - Mark attendance
export const markAttendance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { teacherEmail, attendanceRecords } = req.body;

    const liveClass = await LiveClass.findById(id);
    if (!liveClass) {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }

    if (liveClass.teacherEmail !== teacherEmail) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Update attendance for each student
    attendanceRecords.forEach((record: { studentId: string; status: string; duration?: number }) => {
      const attendee = liveClass.attendees.find(a => a.studentId.toString() === record.studentId);
      if (attendee) {
        attendee.status = record.status as any;
        if (record.duration) attendee.duration = record.duration;
      }
    });

    await liveClass.save();

    return res.status(200).json({ success: true, message: 'Attendance marked', data: liveClass });
  } catch (error: any) {
    console.error('Error marking attendance:', error);
    return res.status(500).json({ success: false, message: 'Failed to mark attendance', error: error.message });
  }
};

// POST /api/teacher/live-classes/:id/cancel - Cancel live class
export const cancelLiveClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { teacherEmail, cancellationReason } = req.body;

    const liveClass = await LiveClass.findById(id);
    if (!liveClass) {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }

    if (liveClass.teacherEmail !== teacherEmail) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    liveClass.status = 'cancelled';
    liveClass.cancellationReason = cancellationReason;
    await liveClass.save();

    return res.status(200).json({ success: true, message: 'Live class cancelled', data: liveClass });
  } catch (error: any) {
    console.error('Error cancelling live class:', error);
    return res.status(500).json({ success: false, message: 'Failed to cancel live class', error: error.message });
  }
};

// DELETE /api/teacher/live-classes/:id - Delete live class
export const deleteLiveClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { teacherEmail } = req.query;

    const liveClass = await LiveClass.findById(id);
    if (!liveClass) {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }

    if (liveClass.teacherEmail !== teacherEmail) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    liveClass.isActive = false;
    await liveClass.save();

    return res.status(200).json({ success: true, message: 'Live class deleted' });
  } catch (error: any) {
    console.error('Error deleting live class:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete live class', error: error.message });
  }
};
