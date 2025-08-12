import { login, signupTeacher, logout, teacherDetails } from "controller/teacher/teacher.controller";
import { Router } from "express";
import { authenticatedTeacher } from "middlewares/teacher.middleware";

const router = Router();

router.route("/signup").post(signupTeacher);
router.route("/login").post(login);
router.route("/logout").get(authenticatedTeacher,logout);
router.route("/me").get(authenticatedTeacher, teacherDetails);



export default router;