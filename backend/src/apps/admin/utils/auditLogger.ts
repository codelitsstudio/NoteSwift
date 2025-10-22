import AuditLog from '../models/AuditLog';
import type { IAuditLog } from '../models/AuditLog';

interface CreateAuditLogOptions {
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
  };
}

/**
 * Helper function to create audit logs throughout the application
 * @param options - Audit log options
 * @returns Promise<IAuditLog | null>
 */
export const createAuditLog = async (options: CreateAuditLogOptions): Promise<IAuditLog | null> => {
  try {
    const {
      userId,
      userType,
      userName,
      userEmail,
      action,
      category,
      resourceType,
      resourceId,
      resourceName,
      details,
      status = 'success',
      metadata
    } = options;

    const auditLog = new AuditLog({
      userId,
      userType,
      userName,
      userEmail,
      action,
      category,
      resourceType,
      resourceId,
      resourceName,
      details,
      status,
      metadata
    });

    await auditLog.save();
    console.log(`[Audit Log Created] ${action} by ${userName} (${userType})`);
    return auditLog.toObject() as IAuditLog;
  } catch (error: any) {
    console.error('[Audit Log Error]', error.message);
    // Don't throw error - audit logging should not break the main flow
    return null;
  }
};

/**
 * Helper function to create audit log from Express request
 * @param req - Express Request object
 * @param options - Additional audit log options
 */
export const createAuditLogFromRequest = async (
  req: any,
  options: Omit<CreateAuditLogOptions, 'metadata'> & {
    metadata?: Omit<CreateAuditLogOptions['metadata'], 'ipAddress' | 'userAgent'>
  }
): Promise<IAuditLog | null> => {
  const ipAddress = (req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.ip) as string;
  const userAgent = req.headers['user-agent'] as string;

  return createAuditLog({
    ...options,
    metadata: {
      ...options.metadata,
      ipAddress,
      userAgent
    }
  });
};
