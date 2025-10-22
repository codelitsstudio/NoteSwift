import AuditLog, { IAuditLog } from '../models/AuditLog';

export interface AuditLogData {
  userId?: string;
  userType: 'admin' | 'teacher' | 'student' | 'system';
  userName: string;
  userEmail?: string;
  action: string;
  category: 'authentication' | 'user_management' | 'course_content' | 'enrollment' | 'payment' | 'communication' | 'system';
  resourceType?: string;
  resourceId?: string;
  resourceName?: string;
  details: string;
  status?: 'success' | 'failure' | 'warning';
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    deviceInfo?: string;
    location?: string;
    oldValue?: any;
    newValue?: any;
    additionalData?: Record<string, any>;
    [key: string]: any; // Allow additional properties
  };
}

class AuditLogger {
  private async saveLog(logData: AuditLogData): Promise<void> {
    try {
      const auditLog = new AuditLog({
        ...logData,
        status: logData.status || 'success',
        timestamp: new Date()
      });

      await auditLog.save();
    } catch (error) {
      console.error('Error saving audit log:', error);
      // Don't throw error to avoid breaking the main flow
    }
  }

  // Authentication & Access Logs
  async logLogin(userId: string, userType: 'admin' | 'teacher' | 'student', userName: string, userEmail: string, success: boolean, metadata?: any) {
    await this.saveLog({
      userId,
      userType,
      userName,
      userEmail,
      action: 'login',
      category: 'authentication',
      details: success ? `Successful login for ${userType} ${userName}` : `Failed login attempt for ${userType} ${userName}`,
      status: success ? 'success' : 'failure',
      metadata
    });
  }

  async logLogout(userId: string, userType: 'admin' | 'teacher' | 'student', userName: string, userEmail: string, metadata?: any) {
    await this.saveLog({
      userId,
      userType,
      userName,
      userEmail,
      action: 'logout',
      category: 'authentication',
      details: `${userType} ${userName} logged out`,
      metadata
    });
  }

  async logPasswordChange(userId: string, userType: 'admin' | 'teacher' | 'student', userName: string, userEmail: string, success: boolean, metadata?: any) {
    await this.saveLog({
      userId,
      userType,
      userName,
      userEmail,
      action: 'password_change',
      category: 'authentication',
      details: success ? `${userType} ${userName} changed password successfully` : `Failed password change attempt for ${userType} ${userName}`,
      status: success ? 'success' : 'failure',
      metadata
    });
  }

  // User Management Logs
  async logUserCreated(creatorId: string, creatorType: 'admin' | 'teacher' | 'system', creatorName: string, targetUserId: string, targetUserType: 'admin' | 'teacher' | 'student', targetUserName: string, targetUserEmail: string, creatorEmail?: string, metadata?: any) {
    await this.saveLog({
      userId: creatorId,
      userType: creatorType,
      userName: creatorName,
      userEmail: creatorEmail,
      action: 'user_created',
      category: 'user_management',
      resourceType: 'user',
      resourceId: targetUserId,
      resourceName: targetUserName,
      details: `${creatorType} ${creatorName} created ${targetUserType} account for ${targetUserName}`,
      metadata
    });
  }

  async logUserUpdated(updaterId: string, updaterType: 'admin' | 'teacher' | 'system', updaterName: string, targetUserId: string, targetUserType: 'admin' | 'teacher' | 'student', targetUserName: string, changes: any, updaterEmail?: string, metadata?: any) {
    await this.saveLog({
      userId: updaterId,
      userType: updaterType,
      userName: updaterName,
      userEmail: updaterEmail,
      action: 'user_updated',
      category: 'user_management',
      resourceType: 'user',
      resourceId: targetUserId,
      resourceName: targetUserName,
      details: `${updaterType} ${updaterName} updated ${targetUserType} ${targetUserName}`,
      metadata: {
        ...metadata,
        changes
      }
    });
  }

  async logUserDeleted(deleterId: string, deleterType: 'admin' | 'teacher' | 'system', deleterName: string, targetUserId: string, targetUserType: 'admin' | 'teacher' | 'student', targetUserName: string, deleterEmail?: string, metadata?: any) {
    await this.saveLog({
      userId: deleterId,
      userType: deleterType,
      userName: deleterName,
      userEmail: deleterEmail,
      action: 'user_deleted',
      category: 'user_management',
      resourceType: 'user',
      resourceId: targetUserId,
      resourceName: targetUserName,
      details: `${deleterType} ${deleterName} deleted ${targetUserType} account for ${targetUserName}`,
      metadata
    });
  }

  // Course Content Logs
  async logCourseCreated(creatorId: string, creatorType: 'admin' | 'teacher', creatorName: string, courseId: string, courseName: string, creatorEmail?: string, metadata?: any) {
    await this.saveLog({
      userId: creatorId,
      userType: creatorType,
      userName: creatorName,
      userEmail: creatorEmail,
      action: 'course_created',
      category: 'course_content',
      resourceType: 'course',
      resourceId: courseId,
      resourceName: courseName,
      details: `${creatorType} ${creatorName} created course "${courseName}"`,
      metadata
    });
  }

  async logCourseUpdated(updaterId: string, updaterType: 'admin' | 'teacher', updaterName: string, courseId: string, courseName: string, changes: any, updaterEmail?: string, metadata?: any) {
    await this.saveLog({
      userId: updaterId,
      userType: updaterType,
      userName: updaterName,
      userEmail: updaterEmail,
      action: 'course_updated',
      category: 'course_content',
      resourceType: 'course',
      resourceId: courseId,
      resourceName: courseName,
      details: `${updaterType} ${updaterName} updated course "${courseName}"`,
      metadata: {
        ...metadata,
        changes
      }
    });
  }

  async logCourseDeleted(deleterId: string, deleterType: 'admin' | 'teacher', deleterName: string, courseId: string, courseName: string, deleterEmail?: string, metadata?: any) {
    await this.saveLog({
      userId: deleterId,
      userType: deleterType,
      userName: deleterName,
      userEmail: deleterEmail,
      action: 'course_deleted',
      category: 'course_content',
      resourceType: 'course',
      resourceId: courseId,
      resourceName: courseName,
      details: `${deleterType} ${deleterName} deleted course "${courseName}"`,
      metadata
    });
  }

  // Enrollment Logs
  async logEnrollment(enrollerId: string, enrollerType: 'admin' | 'teacher' | 'student' | 'system', enrollerName: string, studentId: string, studentName: string, courseId: string, courseName: string, enrollerEmail?: string, metadata?: any) {
    await this.saveLog({
      userId: enrollerId,
      userType: enrollerType,
      userName: enrollerName,
      userEmail: enrollerEmail,
      action: 'enrollment_created',
      category: 'enrollment',
      resourceType: 'enrollment',
      resourceId: `${studentId}-${courseId}`,
      resourceName: `${studentName} -> ${courseName}`,
      details: `${enrollerType} ${enrollerName} enrolled ${studentName} in course "${courseName}"`,
      metadata
    });
  }

  async logUnenrollment(unenrollerId: string, unenrollerType: 'admin' | 'teacher' | 'student' | 'system', unenrollerName: string, studentId: string, studentName: string, courseId: string, courseName: string, unenrollerEmail?: string, metadata?: any) {
    await this.saveLog({
      userId: unenrollerId,
      userType: unenrollerType,
      userName: unenrollerName,
      userEmail: unenrollerEmail,
      action: 'enrollment_removed',
      category: 'enrollment',
      resourceType: 'enrollment',
      resourceId: `${studentId}-${courseId}`,
      resourceName: `${studentName} -> ${courseName}`,
      details: `${unenrollerType} ${unenrollerName} unenrolled ${studentName} from course "${courseName}"`,
      metadata
    });
  }

  // Payment Logs
  async logPayment(paymentId: string, userId: string, userType: 'admin' | 'student', userName: string, amount: number, currency: string, status: 'success' | 'failure' | 'pending', userEmail?: string, metadata?: any) {
    await this.saveLog({
      userId,
      userType,
      userName,
      userEmail,
      action: 'payment_processed',
      category: 'payment',
      resourceType: 'payment',
      resourceId: paymentId,
      resourceName: `Payment of ${amount} ${currency}`,
      details: `${userType} ${userName} payment ${status}: ${amount} ${currency}`,
      status: status === 'success' ? 'success' : status === 'failure' ? 'failure' : 'warning',
      metadata
    });
  }

  // Communication Logs
  async logMessage(senderId: string, senderType: 'admin' | 'teacher' | 'student', senderName: string, recipientId: string, recipientType: 'admin' | 'teacher' | 'student', recipientName: string, messageType: string, senderEmail?: string, metadata?: any) {
    await this.saveLog({
      userId: senderId,
      userType: senderType,
      userName: senderName,
      userEmail: senderEmail,
      action: 'message_sent',
      category: 'communication',
      resourceType: 'message',
      resourceId: recipientId,
      resourceName: recipientName,
      details: `${senderType} ${senderName} sent ${messageType} to ${recipientType} ${recipientName}`,
      metadata
    });
  }

  // System Logs
  async logSystemEvent(action: string, details: string, status?: 'success' | 'failure' | 'warning', metadata?: any) {
    await this.saveLog({
      userType: 'system',
      userName: 'System',
      action,
      category: 'system',
      details,
      status,
      metadata
    });
  }

  // Generic log method for custom events
  async log(logData: AuditLogData) {
    await this.saveLog(logData);
  }
}

export const auditLogger = new AuditLogger();
export default auditLogger;