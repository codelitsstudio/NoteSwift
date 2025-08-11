import JsonResponse from "lib/Response";
import { Controller } from "types/controller";
import { AuditService } from "services/audit.service";
import { Admin } from "models/admins/Admin.model";

/**
 * Get audit logs with pagination and filtering
 */
export const getAuditLogs: Controller = async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const admin = res.locals.admin;

    if (!admin || !admin._id) {
      return jsonResponse.notAuthorized("Unauthorized access.");
    }

    const eAdmin = await Admin.findById({ _id: admin._id });

    if (!eAdmin) {
      return jsonResponse.notAuthorized("Unauthorized access.");
    }

    // Extract query parameters
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 20));
    const adminId = req.query.adminId as string;
    const action = req.query.action as string;
    const entityType = req.query.entityType as string;
    
    // Date filtering
    let startDate: Date | undefined;
    let endDate: Date | undefined;
    
    if (req.query.startDate) {
      startDate = new Date(req.query.startDate as string);
      if (isNaN(startDate.getTime())) {
        return jsonResponse.clientError("Invalid start date format.");
      }
    }
    
    if (req.query.endDate) {
      endDate = new Date(req.query.endDate as string);
      if (isNaN(endDate.getTime())) {
        return jsonResponse.clientError("Invalid end date format.");
      }
    }

    const result = await AuditService.getAuditLogs({
      page,
      limit,
      adminId,
      action,
      entityType,
      startDate,
      endDate
    });

    return jsonResponse.success(
      {
        logs: result.logs,
        pagination: {
          total: result.total,
          totalPages: result.totalPages,
          currentPage: result.currentPage,
          limit
        }
      },
      "Audit logs retrieved successfully."
    );
  } catch (error) {
    console.error("Error retrieving audit logs:", error);
    return jsonResponse.serverError();
  }
};

/**
 * Get audit logs for a specific entity
 */
export const getEntityAuditLogs: Controller = async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const admin = res.locals.admin;

    if (!admin || !admin._id) {
      return jsonResponse.notAuthorized("Unauthorized access.");
    }

    const eAdmin = await Admin.findById({ _id: admin._id });

    if (!eAdmin) {
      return jsonResponse.notAuthorized("Unauthorized access.");
    }

    const { entityId, entityType } = req.params;

    if (!entityId || !entityType) {
      return jsonResponse.clientError("Entity ID and type are required.");
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit as string) || 10));

    const result = await AuditService.getEntityAuditLogs(
      entityId,
      entityType,
      page,
      limit
    );

    return jsonResponse.success(
      {
        logs: result.logs,
        total: result.total,
        pagination: {
          currentPage: page,
          limit,
          totalPages: Math.ceil(result.total / limit)
        }
      },
      `Audit logs for ${entityType} retrieved successfully.`
    );
  } catch (error) {
    console.error("Error retrieving entity audit logs:", error);
    return jsonResponse.serverError();
  }
};

/**
 * Get audit log statistics/summary
 */
export const getAuditLogStats: Controller = async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const admin = res.locals.admin;

    if (!admin || !admin._id) {
      return jsonResponse.notAuthorized("Unauthorized access.");
    }

    const eAdmin = await Admin.findById({ _id: admin._id });

    if (!eAdmin) {
      return jsonResponse.notAuthorized("Unauthorized access.");
    }

    // Get statistics for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const stats = await AuditService.getAuditLogs({
      startDate: thirtyDaysAgo,
      limit: 1000 // Get enough data for stats
    });

    // Aggregate stats
    const actionCounts: { [key: string]: number } = {};
    const entityTypeCounts: { [key: string]: number } = {};
    const adminCounts: { [key: string]: number } = {};

    stats.logs.forEach(log => {
      // Count by action
      const actionType = log.action.split('_')[0]; // Get base action (COURSE, SUBJECT, etc.)
      actionCounts[actionType] = (actionCounts[actionType] || 0) + 1;

      // Count by entity type
      entityTypeCounts[log.entityType] = (entityTypeCounts[log.entityType] || 0) + 1;

      // Count by admin (if populated)
      if (log.adminId && typeof log.adminId === 'object' && 'name' in log.adminId) {
        const adminName = (log.adminId as any).name;
        adminCounts[adminName] = (adminCounts[adminName] || 0) + 1;
      }
    });

    return jsonResponse.success(
      {
        totalLogs: stats.total,
        period: "Last 30 days",
        actionBreakdown: actionCounts,
        entityTypeBreakdown: entityTypeCounts,
        adminBreakdown: adminCounts
      },
      "Audit log statistics retrieved successfully."
    );
  } catch (error) {
    console.error("Error retrieving audit log stats:", error);
    return jsonResponse.serverError();
  }
};

/**
 * Clean up old audit logs (admin maintenance function)
 */
export const cleanupOldLogs: Controller = async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const admin = res.locals.admin;

    if (!admin || !admin._id) {
      return jsonResponse.notAuthorized("Unauthorized access.");
    }

    const eAdmin = await Admin.findById({ _id: admin._id });

    if (!eAdmin) {
      return jsonResponse.notAuthorized("Unauthorized access.");
    }

    // Only allow super admins to cleanup logs (you might want to add a role check here)
    // if (eAdmin.role !== 'super_admin') {
    //   return jsonResponse.forbidden("Only super administrators can perform this action.");
    // }

    const daysToKeep = parseInt(req.body.daysToKeep as string) || 365;

    if (daysToKeep < 30) {
      return jsonResponse.clientError("Cannot delete logs newer than 30 days.");
    }

    const deletedCount = await AuditService.cleanupOldLogs(daysToKeep);

    // Log the cleanup action
    await AuditService.logAction({
      adminId: admin._id,
      action: 'SYSTEM_CLEANUP',
      description: `Cleaned up ${deletedCount} audit logs older than ${daysToKeep} days`,
      entityId: 'system',
      entityType: 'System',
      req
    });

    return jsonResponse.success(
      { deletedCount, daysToKeep },
      `Successfully cleaned up ${deletedCount} old audit logs.`
    );
  } catch (error) {
    console.error("Error cleaning up audit logs:", error);
    return jsonResponse.serverError();
  }
};
