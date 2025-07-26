import { Router } from "express";
import { StudentAuthRoute } from "./student/auth.route";
import { StudentLearnRoutes } from "./student/learn.route";
import { authenticateStudent } from "middlewares/student.middleware";
import { StudentUserRoutes } from "./student/user.route";
import { AdminAuthRoutes } from "./admin/auth.route";


const router = Router();


//student
router.use("/student/auth", StudentAuthRoute);
router.use("/student/learn", StudentLearnRoutes);
router.use("/student/user", authenticateStudent, StudentUserRoutes);

//admin

router.use("/admin/auth", AdminAuthRoutes);

export { router as MainRoutes };