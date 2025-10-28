import { Router } from "express";
import { StudentAuthRoute } from "./student/auth.route";
import { StudentLearnRoutes } from "./student/learn.route";
import { authenticateStudent } from "../middlewares/student.middleware";
import { StudentUserRoutes } from "./student/user.route";
import testsRoutes from "./student/tests.route";
import { AdminAuthRoutes } from "./admin/auth.route";
import { AdminRoutes } from "./admin/index";
import { teacherRoutes } from "./teacher/index";
import courseRoutes from "./courseRoutes";
import notificationRoutes from "./notificationRoutes";
import { AIRoutes } from "./student/ai.route";
import questionsRoutes from "./student/questions.route";
import downloadsRoutes from "./downloads";
import mongoose from "mongoose";
import * as appUpdateController from "../../admin/controllers/appUpdateController";

const router = Router();

//student
// console.log('🔧 Registering student routes...');

// Test endpoint for connectivity
router.get("/ping", (req, res) => {
    // console.log('🏓 PING endpoint hit from:', req.ip);
    res.json({ message: "Backend is reachable!", timestamp: new Date().toISOString() });
});

// console.log('🔧 Ping route registered at /ping');

router.use("/student/auth", StudentAuthRoute);
router.use("/student/learn", StudentLearnRoutes);
router.use("/student/user", authenticateStudent, StudentUserRoutes);
router.use("/student/tests", authenticateStudent, testsRoutes);
router.use("/questions", questionsRoutes);
router.use("/ai", AIRoutes);

// Course routes
router.use("/courses", courseRoutes);

// Notification routes
router.use("/notifications", notificationRoutes);

// Downloads routes
router.use("/downloads", downloadsRoutes);

// App Update status (public route for mobile app)
router.get("/app-update/status", appUpdateController.getAppUpdateStatus);

//admin
router.use("/admin", AdminRoutes);

//teacher
router.use("/teacher", teacherRoutes);

export { router as MainRoutes };