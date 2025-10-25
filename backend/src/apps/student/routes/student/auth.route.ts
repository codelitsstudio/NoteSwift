import { loginStudent, signUpStudent, sendEmailRegistrationOTP, verifyEmailRegistrationOTP, sendReportEmail, sendPasswordResetOTP, verifyPasswordResetOTP, resetPasswordWithResetOTP } from "@student/controllers/controller/student/auth.controller";
import { Router } from "express";

const router = Router();

router.post("/signup", signUpStudent);
router.post("/login", loginStudent);
// DEPRECATED: Phone-based OTP routes (now using email)
// router.post("/send-registration-otp", sendRegistrationOTP);
// router.post("/verify-registration-otp", verifyRegistrationOTP);
router.post("/send-email-registration-otp", sendEmailRegistrationOTP);
router.post("/verify-email-registration-otp", verifyEmailRegistrationOTP);
router.post("/send-report", sendReportEmail);

// Unauthenticated password reset routes
router.post("/password-reset/send-otp", sendPasswordResetOTP);
router.post("/password-reset/verify-otp", verifyPasswordResetOTP);
router.post("/password-reset/reset", resetPasswordWithResetOTP);

export { router as StudentAuthRoute }