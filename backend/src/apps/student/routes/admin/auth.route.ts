import { loginAdmin } from "@student/controllers/controller/admin/auth.controller";
import { Router } from "express";

const router = Router();

router.post("/login", loginAdmin);

export { router as AdminAuthRoutes }