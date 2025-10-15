/**
 * API Configuration
 * Central place to manage API endpoints for different environments
 */

// Base API URL - Change this for production deployment
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// API Endpoints
export const API_ENDPOINTS = {
  // Base URL
  BASE: API_BASE_URL,
  
  // Teacher Auth
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/teacher/auth/login`,
    REGISTER: `${API_BASE_URL}/api/teacher/auth/register`,
    VERIFY_EMAIL: `${API_BASE_URL}/api/teacher/auth/verify-email`,
    RESEND_OTP: `${API_BASE_URL}/api/teacher/auth/resend-otp`,
    ONBOARDING: `${API_BASE_URL}/api/teacher/auth/onboarding`,
    PROFILE: `${API_BASE_URL}/api/teacher/auth/me`,
    UPDATE_PROFILE: `${API_BASE_URL}/api/teacher/auth/profile`,
  },
  
  // Teacher Resources
  TEACHER: `${API_BASE_URL}/api/teacher`,
  ANNOUNCEMENTS: `${API_BASE_URL}/api/teacher/announcements`,
  ASSIGNMENTS: `${API_BASE_URL}/api/teacher/assignments`,
  TESTS: `${API_BASE_URL}/api/teacher/tests`,
  QUESTIONS: `${API_BASE_URL}/api/teacher/questions`,
  LIVE_CLASSES: `${API_BASE_URL}/api/teacher/live-classes`,
  BATCHES: `${API_BASE_URL}/api/teacher/batches`,
  RESOURCES: `${API_BASE_URL}/api/teacher/resources`,
  COURSES: `${API_BASE_URL}/api/teacher/courses`,
  ANALYTICS: `${API_BASE_URL}/api/teacher/analytics`,
};

// For production, set environment variable:
// NEXT_PUBLIC_API_URL=https://noteswift-teacher-api.onrender.com
