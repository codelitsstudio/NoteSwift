# Teacher Web App API Handlers

This directory contains all API handling logic for the Teacher Web App, designed to work seamlessly with the existing backend infrastructure.

## 🏗️ Architecture

The API handlers follow the same structure as the main backend to ensure consistency and easy integration:

```
apiHandling/
├── controllers/          # Request handlers (similar to backend controllers)
├── middlewares/         # Authentication, validation, etc.
├── services/           # Business logic services
├── utils/              # Utility functions and base classes
├── config.ts           # API configuration and endpoints
└── index.ts            # Main exports
```

## 🔧 Controllers

### Authentication (`auth.ts`)
- Teacher login/registration
- OTP verification
- Password reset
- Token management

### Profile (`profile.ts`)
- Get/update teacher profile
- Avatar upload
- Statistics
- Notification preferences

### Courses (`courses.ts`)
- Course CRUD operations
- Publishing/unpublishing
- Course analytics
- Student enrollment management

### Students (`students.ts`)
- Student management
- Progress tracking
- Messaging
- Bulk operations

### Content (`content.ts`)
- Content management (videos, documents, etc.)
- File uploads
- Content analytics
- Bulk operations

### Assignments (`assignments.ts`)
- Assignment/quiz creation
- Grading system
- Submission management
- Analytics

### Analytics (`analytics.ts`)
- Dashboard metrics
- Course performance
- Student progress
- Revenue analytics
- Custom reports

## 🛡️ Middleware

### Authentication (`auth.ts`)
- JWT token validation
- Teacher role verification
- Rate limiting
- CORS handling

## 🚀 Services

### TeacherService (`teacherService.ts`)
- Teacher-specific business logic
- Database operations
- Profile management

### NotificationService (`notificationService.ts`)
- Email notifications
- Push notifications
- SMS alerts
- In-app notifications

### FileUploadService (`fileUploadService.ts`)
- Cloud storage integration (Cloudinary)
- File validation
- Image/video processing
- Bulk uploads

## 📋 Usage

### 1. Import Controllers
```typescript
import { TeacherAuthController, CourseController } from '@/apiHandling';
```

### 2. Create API Routes
```typescript
// app/api/teacher/auth/login/route.ts
import { TeacherAuthController } from '@/apiHandling';

const authController = new TeacherAuthController();

export async function POST(req: NextRequest) {
  return authController.login(req);
}
```

### 3. Use Services
```typescript
import { NotificationService } from '@/apiHandling';

// Send enrollment notification
await NotificationService.sendEnrollmentNotification(
  teacherId,
  studentName,
  courseName
);
```

## 🔗 Integration with Backend

This API handling system is designed to:

1. **Reuse Models**: Use the same database models from the backend
2. **Share Services**: Leverage existing services (Cloudinary, email, etc.)
3. **Consistent APIs**: Match the backend's API response format
4. **Common Validation**: Use the same validation rules

## 🛠️ Implementation Steps

1. **Setup Database Connection**: Connect to the same MongoDB instance
2. **Import Backend Models**: Use Student, Course, Teacher models
3. **Configure Services**: Set up Cloudinary, email services
4. **Implement Authentication**: JWT validation with teacher roles
5. **Create API Routes**: Map controllers to Next.js API routes

## 📊 Features Covered

### Teacher Management
- ✅ Authentication & authorization
- ✅ Profile management
- ✅ Statistics & analytics

### Course Management
- ✅ CRUD operations
- ✅ Content management
- ✅ Publishing workflow

### Student Management
- ✅ Enrollment tracking
- ✅ Progress monitoring
- ✅ Communication tools

### Assessment Tools
- ✅ Assignment creation
- ✅ Grading system
- ✅ Analytics & reports

### Analytics & Reports
- ✅ Dashboard metrics
- ✅ Performance tracking
- ✅ Custom reports
- ✅ Revenue analytics

## 🔐 Security Features

- JWT-based authentication
- Rate limiting
- File upload validation
- Input sanitization
- CORS protection
- Role-based access control

## 📈 Scalability

- Modular architecture
- Service-based design
- Database optimization
- Caching strategies
- Background job processing

This structure ensures that the teacher web app can seamlessly integrate with the existing student mobile app and admin systems while maintaining consistency and code reusability.