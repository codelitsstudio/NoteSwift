import { assignCourse, deleteAssignCourse } from "controller/admin/assignedCourse.controller";
import { Router } from "express";

const router = Router();

router.route("/assign").post(assignCourse);
router.route("/remove/:id").delete(deleteAssignCourse);

export default router;