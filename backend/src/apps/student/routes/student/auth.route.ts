import { loginStudent, signUpStudent, sendEmailRegistrationOTP, verifyEmailRegistrationOTP, sendReportEmail, sendPasswordResetOTP, verifyPasswordResetOTP, resetPasswordWithResetOTP, resetDeviceFingerprint, logoutStudent, registerPushToken } from "@student/controllers/controller/student/auth.controller";
import { Router } from "express";

import { authenticateStudent } from '../../middlewares/student.middleware';

const router = Router();

router.post("/signup", signUpStudent);
router.post("/login", loginStudent);
router.post("/logout", authenticateStudent, logoutStudent);
// DEPRECATED: Phone-based OTP routes (now using email)
// router.post("/send-registration-otp", sendRegistrationOTP);
// router.post("/verify-registration-otp", verifyRegistrationOTP);
router.post("/send-email-registration-otp", sendEmailRegistrationOTP);
router.post("/verify-email-registration-otp", verifyEmailRegistrationOTP);
router.post("/send-report", sendReportEmail);

// Protected routes (require authentication)
router.post("/reset-device-binding", authenticateStudent, resetDeviceFingerprint);
router.post("/push-token", authenticateStudent, registerPushToken);

// Unauthenticated password reset routes
router.post("/password-reset/send-otp", sendPasswordResetOTP);
router.post("/password-reset/verify-otp", verifyPasswordResetOTP);
router.post("/password-reset/reset", resetPasswordWithResetOTP);

// Push token registration
router.post("/register-push-token", authenticateStudent, registerPushToken);

export { router as StudentAuthRoute }