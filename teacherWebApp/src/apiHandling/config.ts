// API Handler Configuration for Teacher Web App
// This structure mirrors the backend architecture for consistency

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
} as const;

export const ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/teacher/auth/login',
    REGISTER: '/teacher/auth/register',
    LOGOUT: '/teacher/auth/logout',
    REFRESH_TOKEN: '/teacher/auth/refresh',
    VERIFY_OTP: '/teacher/auth/verify-otp',
    RESEND_OTP: '/teacher/auth/resend-otp',
    FORGOT_PASSWORD: '/teacher/auth/forgot-password',
    RESET_PASSWORD: '/teacher/auth/reset-password',
  },
  
  // Teacher Profile
  TEACHER: {
    PROFILE: '/teacher/profile',
    UPDATE_PROFILE: '/teacher/profile/update',
    UPLOAD_AVATAR: '/teacher/profile/upload-avatar',
    CHANGE_PASSWORD: '/teacher/profile/change-password',
  },
  
  // Course Management
  COURSES: {
    LIST: '/teacher/courses',
    CREATE: '/teacher/courses/create',
    UPDATE: '/teacher/courses/update',
    DELETE: '/teacher/courses/delete',
    GET_BY_ID: '/teacher/courses',
    PUBLISH: '/teacher/courses/publish',
    UNPUBLISH: '/teacher/courses/unpublish',
  },
  
  // Content Management
  CONTENT: {
    LIST: '/teacher/content',
    CREATE: '/teacher/content/create',
    UPDATE: '/teacher/content/update',
    DELETE: '/teacher/content/delete',
    UPLOAD_FILE: '/teacher/content/upload',
  },
  
  // Student Management
  STUDENTS: {
    LIST: '/teacher/students',
    GET_BY_ID: '/teacher/students',
    ENROLLMENT_STATS: '/teacher/students/enrollment-stats',
    PROGRESS_TRACKING: '/teacher/students/progress',
  },
  
  // Assignments & Tests
  ASSIGNMENTS: {
    LIST: '/teacher/assignments',
    CREATE: '/teacher/assignments/create',
    UPDATE: '/teacher/assignments/update',
    DELETE: '/teacher/assignments/delete',
    SUBMISSIONS: '/teacher/assignments/submissions',
    GRADE: '/teacher/assignments/grade',
  },
  
  // Analytics & Reports
  ANALYTICS: {
    DASHBOARD: '/teacher/analytics/dashboard',
    COURSE_PERFORMANCE: '/teacher/analytics/course-performance',
    STUDENT_PROGRESS: '/teacher/analytics/student-progress',
    ENGAGEMENT_METRICS: '/teacher/analytics/engagement',
  },
  
  // Announcements
  ANNOUNCEMENTS: {
    LIST: '/teacher/announcements',
    CREATE: '/teacher/announcements/create',
    UPDATE: '/teacher/announcements/update',
    DELETE: '/teacher/announcements/delete',
  },
  
  // Live Classes
  LIVE_CLASSES: {
    LIST: '/teacher/live-classes',
    CREATE: '/teacher/live-classes/create',
    UPDATE: '/teacher/live-classes/update',
    DELETE: '/teacher/live-classes/delete',
    START_SESSION: '/teacher/live-classes/start',
    END_SESSION: '/teacher/live-classes/end',
  },
  
  // Shared endpoints (reuse from student/admin backend)
  SHARED: {
    UPLOAD_IMAGE: '/shared/upload/image',
    UPLOAD_FILE: '/shared/upload/file',
    GET_COURSES: '/shared/courses',
    GET_STUDENTS: '/shared/students',
  },
} as const;

export type ApiEndpoint = typeof ENDPOINTS[keyof typeof ENDPOINTS][keyof typeof ENDPOINTS[keyof typeof ENDPOINTS]];