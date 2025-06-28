import { Router } from "express";
import { StudentAuthRoute } from "./student/auth.route";


const router = Router();

router.use("/student/auth", StudentAuthRoute);

export { router as MainRoutes };