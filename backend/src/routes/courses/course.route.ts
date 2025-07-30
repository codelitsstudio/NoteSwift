import { createCourse, createManyCourses, deleteCourse, getAllCourses, updateCourse } from "controller/course/course.controller";
import { Router } from "express";
const router = Router();

router.route("/createCourse").post(createCourse);
router.route("/createManyRoute").post(createManyCourses);
router.route("/updateCourse").patch(updateCourse);
router.route("/deleteCourse").delete(deleteCourse);
router.route("/getAllCourses").get(getAllCourses);


export default router;