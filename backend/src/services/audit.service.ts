import { Request } from 'express';
import { AuditLog, IAuditLog } from '../models/admins/AuditLogs';
import mongoose from 'mongoose';

export interface LogAuditParams {
  adminId: string | mongoose.Types.ObjectId;
  action: string;
  description: string;
  entityId: string;
  entityType: string;
  req: Request;
}

export class AuditService {
  /**
   * Create an audit log entry
   */
  static async logAction(params: LogAuditParams): Promise<IAuditLog | null> {
    try {
      const { adminId, action, description, entityId, entityType, req } = params;
      
      // Extract IP address (handle various proxy scenarios)
      const ipAddress = this.getClientIP(req);
      
      // Extract user agent
      const userAgent = req.get('User-Agent') || 'Unknown';
      
      const auditLog = new AuditLog({
        adminId: new mongoose.Types.ObjectId(adminId),
        action,
        description,
        entityId,
        entityType,
        ipAddress,
        userAgent
      });
      
      await auditLog.save();
      return auditLog;
    } catch (error) {
      console.error('Failed to create audit log:', error);
      return null;
    }
  }
  
  /**
   * Log course-related actions
   */
  static async logCourseAction(
    adminId: string | mongoose.Types.ObjectId,
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'PUBLISH' | 'UNPUBLISH',
    courseId: string,
    courseName: string,
    req: Request
  ): Promise<void> {
    const actionDescriptions = {
      CREATE: `Created course: ${courseName}`,
      UPDATE: `Updated course: ${courseName}`,
      DELETE: `Deleted course: ${courseName}`,
      PUBLISH: `Published course: ${courseName}`,
      UNPUBLISH: `Unpublished course: ${courseName}`
    };
    
    await this.logAction({
      adminId,
      action: `COURSE_${action}`,
      description: actionDescriptions[action],
      entityId: courseId,
      entityType: 'Course',
      req
    });
  }
  
  /**
   * Log subject-related actions
   */
  static async logSubjectAction(
    adminId: string | mongoose.Types.ObjectId,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    subjectId: string,
    subjectName: string,
    req: Request
  ): Promise<void> {
    const actionDescriptions = {
      CREATE: `Created subject: ${subjectName}`,
      UPDATE: `Updated subject: ${subjectName}`,
      DELETE: `Deleted subject: ${subjectName}`
    };
    
    await this.logAction({
      adminId,
      action: `SUBJECT_${action}`,
      description: actionDescriptions[action],
      entityId: subjectId,
      entityType: 'Subject',
      req
    });
  }
  
  /**
   * Log teacher-related actions
   */
  static async logTeacherAction(
    adminId: string | mongoose.Types.ObjectId,
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ASSIGN' | 'REMOVE',
    teacherId: string,
    teacherName: string,
    req: Request,
    courseId?: string
  ): Promise<void> {
    let description: string;
    
    switch (action) {
      case 'CREATE':
        description = `Created teacher: ${teacherName}`;
        break;
      case 'UPDATE':
        description = `Updated teacher: ${teacherName}`;
        break;
      case 'DELETE':
        description = `Deleted teacher: ${teacherName}`;
        break;
      case 'ASSIGN':
        description = `Assigned teacher ${teacherName} to course ${courseId}`;
        break;
      case 'REMOVE':
        description = `Removed teacher ${teacherName} from course ${courseId}`;
        break;
      default:
        description = `${action} teacher: ${teacherName}`;
    }
    
    await this.logAction({
      adminId,
      action: `TEACHER_${action}`,
      description,
      entityId: teacherId,
      entityType: 'Teacher',
      req
    });
  }
  
  /**
   * Log student management actions
   */
  static async logStudentAction(
    adminId: string | mongoose.Types.ObjectId,
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'SUSPEND' | 'ACTIVATE' | 'ENROLL' | 'UNENROLL',
    studentId: string,
    studentName: string,
    req: Request,
    additionalInfo?: string
  ): Promise<void> {
    const actionDescriptions = {
      CREATE: `Created student: ${studentName}`,
      UPDATE: `Updated student: ${studentName}`,
      DELETE: `Deleted student: ${studentName}`,
      SUSPEND: `Suspended student: ${studentName}`,
      ACTIVATE: `Activated student: ${studentName}`,
      ENROLL: `Enrolled student: ${studentName}`,
      UNENROLL: `Unenrolled student: ${studentName}`
    };
    
    const description = additionalInfo 
      ? `${actionDescriptions[action]} - ${additionalInfo}`
      : actionDescriptions[action];
    
    await this.logAction({
      adminId,
      action: `STUDENT_${action}`,
      description,
      entityId: studentId,
      entityType: 'Student',
      req
    });
  }
  
  /**
   * Get audit logs with pagination and filtering
   */
  static async getAuditLogs(options: {
    page?: number;
    limit?: number;
    adminId?: string;
    action?: string;
    entityType?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    logs: IAuditLog[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const {
      page = 1,
      limit = 20,
      adminId,
      action,
      entityType,
      startDate,
      endDate
    } = options;
    
    // Build filter query
    const filter: any = {};
    
    if (adminId) {
      filter.adminId = new mongoose.Types.ObjectId(adminId);
    }
    
    if (action) {
      filter.action = new RegExp(action, 'i');
    }
    
    if (entityType) {
      filter.entityType = entityType;
    }
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = startDate;
      if (endDate) filter.createdAt.$lte = endDate;
    }
    
    const total = await AuditLog.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    
    const logs = await AuditLog.find(filter)
      .populate('adminId', 'name email') // Assuming Admin model has name and email fields
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    return {
      logs: logs as IAuditLog[],
      total,
      totalPages,
      currentPage: page
    };
  }
  
  /**
   * Get audit logs for a specific entity
   */
  static async getEntityAuditLogs(
    entityId: string,
    entityType: string,
    page = 1,
    limit = 10
  ): Promise<{
    logs: IAuditLog[];
    total: number;
  }> {
    const filter = { entityId, entityType };
    
    const total = await AuditLog.countDocuments(filter);
    const skip = (page - 1) * limit;
    
    const logs = await AuditLog.find(filter)
      .populate('adminId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    return {
      logs: logs as IAuditLog[],
      total
    };
  }
  
  /**
   * Extract client IP address from request
   */
  private static getClientIP(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'] as string;
    const realIP = req.headers['x-real-ip'] as string;
    const clientIP = req.headers['x-client-ip'] as string;
    
    if (forwarded) {
      // X-Forwarded-For can contain multiple IPs, take the first one
      return forwarded.split(',')[0].trim();
    }
    
    return realIP || clientIP || req.connection.remoteAddress || req.socket.remoteAddress || 'Unknown';
  }
  
  /**
   * Clean up old audit logs (for maintenance)
   */
  static async cleanupOldLogs(daysToKeep = 365): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const result = await AuditLog.deleteMany({
      createdAt: { $lt: cutoffDate }
    });
    
    return result.deletedCount || 0;
  }
}
