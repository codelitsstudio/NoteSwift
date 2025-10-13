import { Router } from "express";
import adminRoutes from "../adminRoutes";
import { AdminAuthRoutes } from "./auth.route";

const router = Router();

// Mount admin authentication routes
router.use("/auth", AdminAuthRoutes);

// Mount general admin routes
router.use("/", adminRoutes);

export { router as AdminRoutes };