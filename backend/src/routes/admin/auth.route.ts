import { loginAdmin, signupAdmin } from "controller/admin/auth.controller";
import { Router } from "express";
import { authenticateAdmin } from "middlewares/admin.middleware";
import { Admin } from "models/admins/Admin.model";

const router = Router();

router.post("/login", loginAdmin);
router.post("/signup", signupAdmin);

export { router as AdminAuthRoutes }