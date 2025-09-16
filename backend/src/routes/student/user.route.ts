import { 
    getCurrentStudent, 
    updateStudent, 
    uploadProfileImage,
    sendCurrentEmailVerification,
    verifyCurrentEmail,
    sendNewEmailVerification,
    verifyNewEmailAndUpdate,
    verifyCurrentPassword,
    changePasswordWithCurrent,
    sendForgotPasswordOTP,
    verifyForgotPasswordOTP,
    resetPasswordWithOTP,
    getNotificationPreferences,
    updateNotificationPreferences,
    deleteAccount
} from "controller/student/auth.controller";
import { Router } from "express";

const router = Router();

router.get("/me", getCurrentStudent);
router.put("/me", updateStudent);
router.post("/upload-profile-image", uploadProfileImage);

// Email change flow routes
router.post("/email-change/send-current-verification", sendCurrentEmailVerification);
router.post("/email-change/verify-current", verifyCurrentEmail);
router.post("/email-change/send-new-verification", sendNewEmailVerification);
router.post("/email-change/verify-and-update", verifyNewEmailAndUpdate);

// Password change flow routes
router.post("/password-change/verify-current", verifyCurrentPassword);
router.post("/password-change/change-with-current", changePasswordWithCurrent);
router.post("/password-change/send-forgot-otp", sendForgotPasswordOTP);
router.post("/password-change/verify-forgot-otp", verifyForgotPasswordOTP);
router.post("/password-change/reset-with-otp", resetPasswordWithOTP);

// Notification preferences routes
router.get("/notification-preferences", getNotificationPreferences);
router.put("/notification-preferences", updateNotificationPreferences);

// Account deletion route
router.delete("/delete-account", deleteAccount);

export {router as StudentUserRoutes};