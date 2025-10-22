import { getStudentLearnFeed } from "@student/controllers/controller/student/learn.controller";
import { redeemUnlockCode } from "@student/controllers/controller/ordersPaymentsController";
import { Router } from "express";
import { authenticateStudent } from "../../middlewares/student.middleware";

const router = Router();

router.get("/feed", getStudentLearnFeed);
router.post("/redeem-code", authenticateStudent, redeemUnlockCode);

export { router as StudentLearnRoutes }