import { getStudentLearnFeed } from "controller/student/learn.controller";
import { Router } from "express";

const router = Router();

router.get("/feed", getStudentLearnFeed);

export { router as StudentLearnRoutes }