import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../services/audit.service';

/**
 * Middleware to automatically log audit actions
 * This can be used to wrap controllers that need audit logging
 */
export interface AuditConfig {
  action: string;
  entityType: string;
  getEntityId?: (req: Request) => string;
  getEntityName?: (req: Request, result?: any) => string;
  getDescription?: (req: Request, result?: any) => string;
}

/**
 * Creates an audit logging middleware
 */
export function auditLogger(config: AuditConfig) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store original json method
    const originalJson = res.json;
    
    // Override res.json to intercept successful responses
    res.json = function(body: any) {
      // Only log for successful responses (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Extract admin info
        const admin = res.locals.admin;
        
        if (admin && admin._id) {
          // Determine entity ID
          const entityId = config.getEntityId 
            ? config.getEntityId(req)
            : req.params.id || body.data?._id || body.data?.id || 'unknown';
          
          // Determine entity name
          const entityName = config.getEntityName
            ? config.getEntityName(req, body)
            : body.data?.name || body.data?.title || req.body?.name || req.body?.title || 'Unknown';
          
          // Determine description
          const description = config.getDescription
            ? config.getDescription(req, body)
            : `${config.action} ${config.entityType}: ${entityName}`;
          
          // Log the action (don't await to avoid blocking the response)
          AuditService.logAction({
            adminId: admin._id,
            action: config.action,
            description,
            entityId: entityId.toString(),
            entityType: config.entityType,
            req
          }).catch(error => {
            console.error('Failed to log audit action:', error);
          });
        }
      }
      
      // Call original json method
      return originalJson.call(this, body);
    };
    
    next();
  };
}

/**
 * Pre-configured audit middlewares for common actions
 */
export const auditMiddlewares = {
  // Course actions
  courseCreate: auditLogger({
    action: 'COURSE_CREATE',
    entityType: 'Course',
    getEntityId: (req, result) => result?.data?._id || 'unknown',
    getEntityName: (req, result) => result?.data?.name || req.body?.name || 'Unknown Course'
  }),
  
  courseUpdate: auditLogger({
    action: 'COURSE_UPDATE',
    entityType: 'Course',
    getEntityId: (req) => req.params.id,
    getEntityName: (req) => req.body?.name || 'Unknown Course'
  }),
  
  courseDelete: auditLogger({
    action: 'COURSE_DELETE',
    entityType: 'Course',
    getEntityId: (req) => req.params.id,
    getDescription: (req) => `Deleted course: ${req.params.id}`
  }),
  
  coursePublish: auditLogger({
    action: 'COURSE_PUBLISH',
    entityType: 'Course',
    getEntityId: (req) => req.params.id,
    getDescription: (req) => `Published course: ${req.params.id}`
  }),
  
  courseUnpublish: auditLogger({
    action: 'COURSE_UNPUBLISH',
    entityType: 'Course',
    getEntityId: (req) => req.params.id,
    getDescription: (req) => `Unpublished course: ${req.params.id}`
  }),
  
  // Subject actions
  subjectCreate: auditLogger({
    action: 'SUBJECT_CREATE',
    entityType: 'Subject',
    getEntityId: (req, result) => result?.data?._id || 'unknown',
    getEntityName: (req, result) => result?.data?.name || req.body?.name || 'Unknown Subject'
  }),
  
  subjectUpdate: auditLogger({
    action: 'SUBJECT_UPDATE',
    entityType: 'Subject',
    getEntityId: (req) => req.params.id,
    getEntityName: (req) => req.body?.name || 'Unknown Subject'
  }),
  
  subjectDelete: auditLogger({
    action: 'SUBJECT_DELETE',
    entityType: 'Subject',
    getEntityId: (req) => req.params.id,
    getDescription: (req) => `Deleted subject: ${req.params.id}`
  }),
  
  // Student actions
  studentCreate: auditLogger({
    action: 'STUDENT_CREATE',
    entityType: 'Student',
    getEntityId: (req, result) => result?.data?._id || 'unknown',
    getEntityName: (req, result) => result?.data?.name || req.body?.name || 'Unknown Student'
  }),
  
  studentUpdate: auditLogger({
    action: 'STUDENT_UPDATE',
    entityType: 'Student',
    getEntityId: (req) => req.params.id,
    getEntityName: (req) => req.body?.name || 'Unknown Student'
  }),
  
  studentDelete: auditLogger({
    action: 'STUDENT_DELETE',
    entityType: 'Student',
    getEntityId: (req) => req.params.id,
    getDescription: (req) => `Deleted student: ${req.params.id}`
  }),
  
  // Teacher actions
  teacherCreate: auditLogger({
    action: 'TEACHER_CREATE',
    entityType: 'Teacher',
    getEntityId: (req, result) => result?.data?._id || 'unknown',
    getEntityName: (req, result) => result?.data?.name || req.body?.name || 'Unknown Teacher'
  }),
  
  teacherUpdate: auditLogger({
    action: 'TEACHER_UPDATE',
    entityType: 'Teacher',
    getEntityId: (req) => req.params.id,
    getEntityName: (req) => req.body?.name || 'Unknown Teacher'
  }),
  
  teacherDelete: auditLogger({
    action: 'TEACHER_DELETE',
    entityType: 'Teacher',
    getEntityId: (req) => req.params.id,
    getDescription: (req) => `Deleted teacher: ${req.params.id}`
  }),
  
  teacherAssign: auditLogger({
    action: 'TEACHER_ASSIGN',
    entityType: 'Teacher',
    getEntityId: (req) => req.params.teacherId || req.body.teacherId,
    getDescription: (req) => `Assigned teacher ${req.params.teacherId || req.body.teacherId} to course ${req.params.courseId || req.body.courseId}`
  }),
  
  teacherRemove: auditLogger({
    action: 'TEACHER_REMOVE',
    entityType: 'Teacher',
    getEntityId: (req) => req.params.teacherId || req.body.teacherId,
    getDescription: (req) => `Removed teacher ${req.params.teacherId || req.body.teacherId} from course ${req.params.courseId || req.body.courseId}`
  })
};

/**
 * Helper function to create custom audit middleware
 */
export function createAuditMiddleware(config: AuditConfig) {
  return auditLogger(config);
}
