import { loginStudent, signUpStudent } from "controller/student/auth.controller";
import { Router } from "express";

const router = Router();

router.post("/signup", signUpStudent);
router.post("/login", loginStudent);

export { router as StudentAuthRoute }