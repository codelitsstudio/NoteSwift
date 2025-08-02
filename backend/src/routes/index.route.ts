
import { Router } from "express";
import { StudentAuthRoute } from "./student/auth.route";
import { StudentLearnRoutes } from "./student/learn.route";
import { authenticateStudent } from "middlewares/student.middleware";
import { authenticateAdmin } from "middlewares/admin.middleware";
import { StudentUserRoutes } from "./student/user.route";
import { AdminAuthRoutes } from "./admin/auth.route";
// subject route
import SubjectRoute from "./admin/subject.route";
// course route
import CourseRoute from "./admin/course.route"

// announcement route
import AnnouncementRoutes from "./announcement/announcement.route";
// teacher Route
import TeacherRoutes from "./teacher/teacher.route";
// assignedcourse 

import AssigneCourseRoutes from "./admin/courseAssigned.route";

const router = Router();


//student
router.use("/student/auth", StudentAuthRoute);
router.use("/student/learn", StudentLearnRoutes);
router.use("/student/user", authenticateStudent, StudentUserRoutes);

//admin

router.use("/admin/auth", AdminAuthRoutes);
router.use("/admin/subject", authenticateAdmin, SubjectRoute);
router.use("/admin/course", authenticateAdmin, CourseRoute);
router.use("/admin/course", authenticateAdmin, AssigneCourseRoutes);
// announcement

router.use("/announcement", AnnouncementRoutes);

// teacher

router.use("/teacher", TeacherRoutes);


export { router as MainRoutes };