import express from 'express';
import * as authController from '../controllers/authController';
import * as adminAuthController from '../controllers/adminAuthController';
import * as teacherController from '../controllers/teacherController';
import * as courseController from '../controllers/courseController';
import * as notificationController from '../controllers/notificationController';
import * as recommendationController from '../controllers/recommendationController';
import * as auditLogController from '../controllers/auditLogController';
import * as dashboardController from '../controllers/dashboardController';
import * as userController from '../controllers/userController';
import * as homepageController from '../controllers/homepageController';
import * as revenueController from '../controllers/revenueController';
import * as adminManagementController from '../controllers/adminManagementController';
import * as ordersPaymentsController from '../controllers/ordersPaymentsController';
import * as subjectContentController from '../controllers/subjectContentController';
import * as reportsController from '../controllers/reportsController';
import { verifyAdminAuth } from '../middlewares/adminAuth.middleware';

const router = express.Router();

// ==================== REGULAR ADMIN AUTH ROUTES ====================
router.post('/auth/login', authController.regularAdminLogin);
router.post('/auth/verify-otp', authController.regularAdminVerifyOtp);

// ==================== SESSION AUTH ROUTES ====================
router.post('/auth/complete-login', authController.completeLogin);
router.get('/auth/session', authController.getSession);
router.post('/auth/session/refresh', authController.refreshSession);
router.post('/auth/logout', authController.logout);

// ==================== ADMIN AUTH ROUTES (System Admin Login ONLY) ====================
router.post('/admin-auth/login', adminAuthController.login);
router.post('/admin-auth/verify-otp', adminAuthController.verifyOtp);
router.post('/admin-auth/verify-invitation', adminAuthController.verifyInvitation);
router.post('/admin-auth/complete-signup', adminAuthController.completeSignup);
router.get('/admin-auth/profile', verifyAdminAuth, adminAuthController.getProfile);

// ==================== TEACHER MANAGEMENT ROUTES ====================
router.get('/admin/teachers', verifyAdminAuth, teacherController.listTeachersDropdown);
router.get('/teachers', verifyAdminAuth, teacherController.listTeachers);
router.get('/teachers/:id', verifyAdminAuth, teacherController.getTeacher);
router.post('/teachers/:id/approve', verifyAdminAuth, teacherController.approveTeacher);
router.post('/teachers/:id/reject', verifyAdminAuth, teacherController.rejectTeacher);
router.post('/teachers/:id/ban', verifyAdminAuth, teacherController.banTeacher);
router.post('/teachers/:id/remove', verifyAdminAuth, teacherController.removeTeacher);
router.post('/teachers/:id/assign', verifyAdminAuth, teacherController.assignTeacher);
router.post('/teachers/:id/remove-assignment', verifyAdminAuth, teacherController.removeAssignment);

// ==================== COURSE MANAGEMENT ROUTES ====================
// Note: /admin/courses returns lightweight data for dropdowns
// /courses returns full course data for management
router.get('/admin/courses', verifyAdminAuth, courseController.listCoursesDropdown);
router.get('/courses', verifyAdminAuth, courseController.listCourses);
router.post('/courses', verifyAdminAuth, courseController.createCourse);
router.get('/courses/:id', verifyAdminAuth, courseController.getCourse);
router.put('/courses/:id', verifyAdminAuth, courseController.updateCourse);
router.delete('/courses/:id', verifyAdminAuth, courseController.deleteCourse);

// ==================== NOTIFICATION ROUTES ====================
router.get('/notifications', verifyAdminAuth, notificationController.listNotifications);
router.post('/notifications', verifyAdminAuth, notificationController.createNotification);
router.delete('/notifications/:id', verifyAdminAuth, notificationController.deleteNotification);
router.get('/notifications/active/homepage', notificationController.getActiveHomepageNotification);

// ==================== RECOMMENDATION ROUTES ====================
router.post('/recommendations', verifyAdminAuth, recommendationController.analyzeCourse);
router.get('/recommendations', verifyAdminAuth, recommendationController.getRecommendationStats);
router.get('/recommendations/course-changes', verifyAdminAuth, recommendationController.getCourseChanges);
router.put('/recommendations/analyze-all', verifyAdminAuth, recommendationController.analyzeAllCourses);

// ==================== AUDIT LOG ROUTES ====================
router.get('/audit-logs', verifyAdminAuth, auditLogController.getAuditLogs);
router.post('/audit-logs', verifyAdminAuth, auditLogController.createAuditLog);

// ==================== DASHBOARD ROUTES ====================
router.get('/dashboard', verifyAdminAuth, dashboardController.getDashboard);

// ==================== USER MANAGEMENT ROUTES ====================
router.get('/users', verifyAdminAuth, userController.getUsers);
router.get('/users/:id', verifyAdminAuth, userController.getUser);

// ==================== HOMEPAGE SETTINGS ROUTES ====================
router.get('/homepage-settings', verifyAdminAuth, homepageController.getHomepageSettings);
router.put('/homepage-settings', verifyAdminAuth, homepageController.updateHomepageSettings);

// ==================== REVENUE ROUTES ====================
router.get('/revenue/overview', verifyAdminAuth, revenueController.getRevenueOverview);

// ==================== ADMIN MANAGEMENT ROUTES ====================
router.get('/admins', verifyAdminAuth, adminManagementController.listAdmins);
router.post('/admins/invite', verifyAdminAuth, adminManagementController.inviteAdmin);
router.post('/admins/remove', verifyAdminAuth, adminManagementController.removeAdmin);
router.post('/admins/set-super-admin', verifyAdminAuth, adminManagementController.setSuperAdmin);
router.post('/admins/demote-super-admin', verifyAdminAuth, adminManagementController.demoteSuperAdmin);

// ==================== ORDERS & PAYMENTS ROUTES ====================
router.get('/orders-payments/transactions', verifyAdminAuth, ordersPaymentsController.listTransactions);
router.get('/orders-payments/transactions/:id', verifyAdminAuth, ordersPaymentsController.getTransaction);
router.get('/orders-payments/codes', verifyAdminAuth, ordersPaymentsController.listUnlockCodes);
router.get('/orders-payments/codes/:id', verifyAdminAuth, ordersPaymentsController.getUnlockCode);
router.post('/orders-payments/transaction', verifyAdminAuth, ordersPaymentsController.createTransaction);

// ==================== SUBJECT CONTENT ROUTES ====================
router.get('/subject-content', verifyAdminAuth, subjectContentController.getSubjectContent);
router.put('/subject-content/:id', verifyAdminAuth, subjectContentController.updateSubjectContent);

// ==================== REPORTS ROUTES ====================
router.get('/reports/overview', verifyAdminAuth, reportsController.getReportsOverview);

export default router;
