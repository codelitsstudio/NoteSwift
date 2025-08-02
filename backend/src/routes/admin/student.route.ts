import { getAllStudnet, getStudentsById } from "controller/admin/student.controller";
import { Router } from "express";

const router = Router();

router.route("/all").get(getAllStudnet);
router.route("/:id").get(getStudentsById);


export default router;