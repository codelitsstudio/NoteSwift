// Main API Handler Export
// This file exports all controllers and utilities for easy import

// Controllers
export { TeacherAuthController } from './controllers/auth';
export { TeacherProfileController } from './controllers/profile';
export { CourseController } from './controllers/courses';
export { StudentController } from './controllers/students';
export { ContentController } from './controllers/content';
export { AssignmentController } from './controllers/assignments';
export { AnalyticsController } from './controllers/analytics';

// Utilities
export { BaseApiHandler } from './utils/baseHandler';
export type { ApiResponse, ApiHandler } from './utils/baseHandler';

// Middleware
export { authenticateTeacher, corsMiddleware, rateLimit } from './middlewares/auth';

// Configuration
export { API_CONFIG, ENDPOINTS } from './config';
export type { ApiEndpoint } from './config';

// Services - Export interfaces for now, implementations will be added
export interface ITeacherService {
  findByEmail(email: string): Promise<any>;
  createTeacher(data: any): Promise<any>;
  updateTeacher(id: string, data: any): Promise<any>;
}

export interface INotificationService {
  sendEmail(to: string, subject: string, content: string): Promise<any>;
  sendVerificationCode(email: string, code: string): Promise<any>;
}

export interface IFileUploadService {
  uploadFile(file: File, options?: any): Promise<any>;
}