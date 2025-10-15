import { Request, Response } from 'express';
import connectDB from '../lib/mongoose';
import AuditLog from '../models/AuditLog';

/**
 * GET /api/admin/audit-logs
 * Get audit logs with filtering, pagination, and statistics
 */
export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    await connectDB();

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const { category, action, userType, userId, resourceType, status, search, startDate, endDate, sortBy = 'timestamp', sortOrder = 'desc' } = req.query;

    // Build query
    const query: any = {};

    if (category) query.category = category;
    if (action) query.action = action;
    if (userType) query.userType = userType;
    if (userId) query.userId = userId;
    if (resourceType) query.resourceType = resourceType;
    if (status) query.status = status;

    // Date range
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate as string);
      if (endDate) query.timestamp.$lte = new Date(endDate as string);
    }

    // Search
    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
        { details: { $regex: search, $options: 'i' } },
        { resourceName: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Sort
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const [logs, total] = await Promise.all([
      AuditLog.find(query).sort(sort).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(query)
    ]);

    // Transform logs
    const transformedLogs = logs.map((log: any) => ({
      _id: log._id.toString(),
      userId: log.userId,
      userType: log.userType,
      userName: log.userName,
      userEmail: log.userEmail,
      action: log.action,
      category: log.category,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      resourceName: log.resourceName,
      details: log.details,
      status: log.status,
      timestamp: log.timestamp.toISOString(),
      metadata: log.metadata
    }));

    // Statistics
    const statsQuery = { ...query };
    delete statsQuery.userName;
    delete statsQuery.details;

    const stats = await AuditLog.aggregate([
      { $match: statsQuery },
      {
        $group: {
          _id: null,
          totalLogs: { $sum: 1 },
          successCount: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] } },
          failureCount: { $sum: { $cond: [{ $eq: ['$status', 'failure'] }, 1, 0] } },
          warningCount: { $sum: { $cond: [{ $eq: ['$status', 'warning'] }, 1, 0] } },
          categories: { $addToSet: '$category' },
          userTypes: { $addToSet: '$userType' }
        }
      }
    ]);

    const statistics = stats[0] || {
      totalLogs: 0,
      successCount: 0,
      failureCount: 0,
      warningCount: 0,
      categories: [],
      userTypes: []
    };

    res.json({
      success: true,
      data: {
        logs: transformedLogs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        },
        statistics
      }
    });
  } catch (error: any) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch audit logs' });
  }
};

/**
 * POST /api/admin/audit-logs
 * Create audit log entry
 */
export const createAuditLog = async (req: Request, res: Response) => {
  try {
    await connectDB();

    const {
      userId, userType, userName, userEmail, action, category,
      resourceType, resourceId, resourceName, details, status = 'success', metadata
    } = req.body;

    if (!userType || !userName || !action || !category || !details) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const auditLog = new AuditLog({
      userId, userType, userName, userEmail, action, category,
      resourceType, resourceId, resourceName, details, status,
      metadata: {
        ...metadata,
        ipAddress: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.ip,
        userAgent: req.headers['user-agent']
      }
    });

    await auditLog.save();

    res.json({
      success: true,
      data: {
        _id: auditLog._id.toString(),
        message: 'Audit log created successfully'
      }
    });
  } catch (error: any) {
    console.error('Error creating audit log:', error);
    res.status(500).json({ success: false, error: 'Failed to create audit log' });
  }
};
