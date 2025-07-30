import { loginAdmin, signupAdmin } from "controller/admin/auth.controller";
import { Router } from "express";

const router = Router();

router.post("/login", loginAdmin);
router.post("/signup", signupAdmin);

export { router as AdminAuthRoutes }