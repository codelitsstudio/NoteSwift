import { Router } from "express";
import { StudentAuthRoute } from "./student/auth.route";
import { StudentLearnRoutes } from "./student/learn.route";


const router = Router();

router.use("/student/auth", StudentAuthRoute);
router.use("/student/learn", StudentLearnRoutes);
export { router as MainRoutes };