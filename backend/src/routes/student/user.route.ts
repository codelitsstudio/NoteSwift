import { getCurrentStudent } from "controller/student/auth.controller";
import { Router } from "express";

const router = Router();


router.get("/me", getCurrentStudent);

export {router as StudentUserRoutes};