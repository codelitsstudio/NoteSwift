
import { Router } from "express";
import { StudentAuthRoute } from "./student/auth.route";
import { StudentLearnRoutes } from "./student/learn.route";
import { authenticateStudent } from "middlewares/student.middleware";
import { authenticateAdmin } from "middlewares/admin.middleware";
import { StudentUserRoutes } from "./student/user.route";
import { AdminAuthRoutes } from "./admin/auth.route";
// subject route
import SubjectRoute from "./admin/subject.route";

// announcement route
import AnnouncementRoutes from "./announcement/announcement.route";
// course
import CourseRoutes from "./courses/course.route";

const router = Router();


//student
router.use("/student/auth", StudentAuthRoute);
router.use("/student/learn", StudentLearnRoutes);
router.use("/student/user", authenticateStudent, StudentUserRoutes);

//admin

router.use("/admin/auth", AdminAuthRoutes);
router.use("/admin/subject", authenticateAdmin, SubjectRoute);
// announcement

router.use("/announcement", AnnouncementRoutes);

// course
router.use("/course", CourseRoutes);
export { router as MainRoutes };