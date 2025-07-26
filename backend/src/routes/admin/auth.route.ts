import { loginAdmin } from "controller/admin/auth.controller";
import { Router } from "express";

const router = Router();

router.post("/login", loginAdmin);

export { router as AdminAuthRoutes }