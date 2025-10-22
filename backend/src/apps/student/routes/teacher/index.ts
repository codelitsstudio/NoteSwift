import { Router } from "express";
import { authenticateTeacher } from "../../middlewares/teacher.middleware";
import courseRoutes from "./course.route";
import liveClassRoutes from "./live-class.route";
import analyticsRoutes from "./analytics.route";
import studentRoutes from "./student.route";
import batchRoutes from "./batch.route";
import announcementsRoutes from "./announcements.route";
import assignmentsRoutes from "./assignments.route";
import testsRoutes from "./tests.route";
import questionsRoutes from "./questions.route";
import resourcesRoutes from "./resources.route";
import { TeacherAuthRoutes } from "./auth.route";

const router = Router();

// Teacher auth routes (no authentication required for login/register)
router.use("/auth", TeacherAuthRoutes);

// Apply teacher authentication to all other teacher routes
router.use(authenticateTeacher);

// Mount sub-routes
router.use("/courses", courseRoutes);
router.use("/live-classes", liveClassRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/students", studentRoutes);
router.use("/batches", batchRoutes);
router.use("/announcements", announcementsRoutes);
router.use("/assignments", assignmentsRoutes);
router.use("/tests", testsRoutes);
router.use("/questions", questionsRoutes);
router.use("/resources", resourcesRoutes);

export { router as teacherRoutes };