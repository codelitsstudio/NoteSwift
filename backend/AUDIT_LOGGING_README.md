# Audit Logging System

This document describes the comprehensive audit logging system implemented for the NoteSwift backend application.

## Overview

The audit logging system automatically tracks all key administrative actions performed in the system, including:
- Course management (create, update, delete, publish, unpublish)
- Subject management (create, update, delete)
- Teacher management (create, update, delete, assign, remove)
- Student management (create, update, delete, suspend, activate, enroll, unenroll)

## Components

### 1. Mongoose Model (`src/models/admins/auditLogs.ts`)

The audit log model stores the following information:
- `adminId`: Reference to the admin who performed the action
- `action`: The type of action performed (e.g., COURSE_CREATE, STUDENT_DELETE)
- `description`: Human-readable description of the action
- `entityId`: ID of the entity that was affected
- `entityType`: Type of entity (Course, Subject, Teacher, Student)
- `ipAddress`: IP address from where the action was performed
- `userAgent`: User agent string from the request
- `timestamps`: Automatic createdAt and updatedAt fields

### 2. Audit Service (`src/services/audit.service.ts`)

The AuditService provides methods for:
- **Logging actions**: `logAction()` - Generic method to log any action
- **Specialized logging methods**:
  - `logCourseAction()` - For course-related actions
  - `logSubjectAction()` - For subject-related actions
  - `logTeacherAction()` - For teacher-related actions
  - `logStudentAction()` - For student management actions
- **Retrieving audit logs**:
  - `getAuditLogs()` - Get logs with pagination and filtering
  - `getEntityAuditLogs()` - Get logs for a specific entity
- **Maintenance**: `cleanupOldLogs()` - Remove old audit logs

### 3. Controller (`src/controller/admin/auditLog.controller.ts`)

Provides HTTP endpoints for:
- `GET /admin/logs` - Get all audit logs with filtering
- `GET /admin/logs/entity/:entityType/:entityId` - Get logs for specific entity
- `GET /admin/logs/stats` - Get audit log statistics
- `DELETE /admin/logs/cleanup` - Clean up old audit logs

### 4. Routes (`src/routes/admin/logs.routes.ts`)

Defines the routing for audit log endpoints, all protected by admin authentication.

### 5. Middleware (`src/middlewares/audit.middleware.ts`)

Provides automatic audit logging through middleware that can be applied to routes.

## Usage Examples

### Manual Logging

```typescript
import { AuditService } from 'services/audit.service';

// Log a course creation
await AuditService.logCourseAction(
  adminId,
  'CREATE',
  course._id.toString(),
  course.name,
  req
);

// Log a generic action
await AuditService.logAction({
  adminId,
  action: 'CUSTOM_ACTION',
  description: 'Custom action performed',
  entityId: 'entity-id',
  entityType: 'CustomEntity',
  req
});
```

### Using Middleware (Alternative Approach)

```typescript
import { auditMiddlewares } from 'middlewares/audit.middleware';

// Apply to specific routes
router.route("/").post(auditMiddlewares.courseCreate, createCourse);
router.route("/:id").patch(auditMiddlewares.courseUpdate, updateCourse);
router.route("/:id").delete(auditMiddlewares.courseDelete, deleteCourse);
```

### Retrieving Audit Logs

```typescript
// Get audit logs with filtering
const result = await AuditService.getAuditLogs({
  page: 1,
  limit: 20,
  adminId: 'admin-id',
  action: 'COURSE',
  entityType: 'Course',
  startDate: new Date('2023-01-01'),
  endDate: new Date('2023-12-31')
});

// Get logs for a specific entity
const entityLogs = await AuditService.getEntityAuditLogs(
  'course-id',
  'Course',
  1,
  10
);
```

## API Endpoints

### Get Audit Logs
```
GET /admin/logs?page=1&limit=20&adminId=xxx&action=COURSE&entityType=Course&startDate=2023-01-01&endDate=2023-12-31
```

### Get Entity Audit Logs
```
GET /admin/logs/entity/Course/60f1b2b3c4d5e6f7g8h9i0j1?page=1&limit=10
```

### Get Audit Statistics
```
GET /admin/logs/stats
```

### Clean Up Old Logs
```
DELETE /admin/logs/cleanup
Body: { "daysToKeep": 365 }
```

## Security Features

1. **IP Address Tracking**: Automatically captures the real client IP address, handling various proxy scenarios
2. **User Agent Logging**: Records the user agent string for browser/client identification
3. **Admin Authentication**: All audit endpoints require admin authentication
4. **Sensitive Data Protection**: The system avoids logging sensitive data like passwords
5. **Immutable Records**: Audit logs are designed to be immutable once created

## Integration with Existing Controllers

The system has been integrated into the course controller as an example. For each key action:

1. **Create Course**: Logs after successful course creation
2. **Update Course**: Logs after successful course update
3. **Delete Course**: Logs before course deletion
4. **Publish Course**: Logs after successful publish action
5. **Unpublish Course**: Logs after successful unpublish action

## Data Privacy

The audit system ensures:
- No sensitive user data (passwords, tokens) is logged
- Only essential information for audit purposes is stored
- IP addresses and user agents are stored for security analysis
- Descriptions are human-readable but don't expose sensitive details

## Performance Considerations

1. **Non-blocking**: Audit logging is performed asynchronously to avoid blocking API responses
2. **Error Handling**: Failed audit logs don't affect the main application flow
3. **Cleanup**: Built-in cleanup functionality to manage log storage
4. **Indexing**: The model supports efficient querying through proper indexing

## Maintenance

### Cleanup Old Logs
```typescript
// Clean up logs older than 365 days
const deletedCount = await AuditService.cleanupOldLogs(365);
```

### Monitoring
Regular monitoring of audit logs helps with:
- Security analysis
- Compliance reporting
- Performance optimization
- User behavior analysis

## Future Enhancements

Potential improvements could include:
1. Real-time audit log streaming
2. Advanced analytics and reporting
3. Alert system for suspicious activities
4. Integration with external SIEM systems
5. Automated compliance reporting

## Compliance

This audit system helps meet various compliance requirements:
- **GDPR**: Provides audit trail for data processing activities
- **SOX**: Maintains records of financial data changes
- **HIPAA**: Tracks access to sensitive information (if applicable)
- **ISO 27001**: Supports information security management

## Getting Started

1. The audit system is automatically active once the files are in place
2. Routes are registered in the main route index
3. Database indexes should be created for optimal performance
4. Regular cleanup should be scheduled based on compliance requirements

The system provides comprehensive audit capabilities while maintaining high performance and security standards.
