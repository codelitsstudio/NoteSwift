import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import AuditLog, { IAuditLog } from '@/lib/models/AuditLog';

// Response interface
interface AuditLogResponse {
  _id: string;
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
  status: 'success' | 'failure' | 'warning';
  timestamp: string;
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

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const category = url.searchParams.get('category');
    const action = url.searchParams.get('action');
    const userType = url.searchParams.get('userType');
    const userId = url.searchParams.get('userId');
    const resourceType = url.searchParams.get('resourceType');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const sortBy = url.searchParams.get('sortBy') || 'timestamp';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';

    // Build query
    const query: any = {};

    if (category) query.category = category;
    if (action) query.action = action;
    if (userType) query.userType = userType;
    if (userId) query.userId = userId;
    if (resourceType) query.resourceType = resourceType;
    if (status) query.status = status;

    // Exclude known mock data entries
    query.userName = { $nin: ['John Admin', 'Alice Student', 'Bob Teacher', 'Charlie Student', 'System'] };
    query.details = { $not: { $regex: /(Admin John Admin|Alice Student|Bob Teacher|Charlie Student)/ } };

    // Date range filter
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    // Search filter
    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
        { details: { $regex: search, $options: 'i' } },
        { resourceName: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(query)
    ]);

    // Transform logs for response
    const transformedLogs: AuditLogResponse[] = logs.map((log: any) => ({
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

    // Get statistics
    const statsQuery = { ...query };
    delete statsQuery.userName; // Remove the mock data filter for statistics to get accurate counts
    delete statsQuery.details;

    const stats = await AuditLog.aggregate([
      {
        $match: statsQuery
      },
      {
        $group: {
          _id: null,
          totalLogs: { $sum: 1 },
          successCount: {
            $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
          },
          failureCount: {
            $sum: { $cond: [{ $eq: ['$status', 'failure'] }, 1, 0] }
          },
          warningCount: {
            $sum: { $cond: [{ $eq: ['$status', 'warning'] }, 1, 0] }
          },
          categories: {
            $addToSet: '$category'
          },
          userTypes: {
            $addToSet: '$userType'
          }
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

    return NextResponse.json({
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
        statistics: {
          totalLogs: statistics.totalLogs,
          successCount: statistics.successCount,
          failureCount: statistics.failureCount,
          warningCount: statistics.warningCount,
          categories: statistics.categories,
          userTypes: statistics.userTypes
        }
      }
    });

  } catch (error: any) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}

// POST endpoint for creating audit log entries (internal use)
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
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
    } = body;

    // Validate required fields
    if (!userType || !userName || !action || !category || !details) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create audit log entry
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
      metadata: {
        ...metadata,
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        userAgent: req.headers.get('user-agent')
      }
    });

    await auditLog.save();

    return NextResponse.json({
      success: true,
      data: {
        _id: auditLog._id.toString(),
        message: 'Audit log created successfully'
      }
    });

  } catch (error: any) {
    console.error('Error creating audit log:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create audit log' },
      { status: 500 }
    );
  }
}