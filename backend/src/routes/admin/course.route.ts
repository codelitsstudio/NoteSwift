import { createCourse, createManyCourses, deleteCourse, getAllCourses, getCourseById, publishCourse, unPublishCourse, updateCourse } from "controller/admin/course.controller";
import { Router } from "express";
const router = Router();

router.route("/").post(createCourse);
router.route("/many").post(createManyCourses);
router.route("/:id").patch(updateCourse);
router.route("/:id").delete(deleteCourse);
router.route("/").get(getAllCourses);
router.route("/:id").get(getCourseById)
router.route("/:id/publish").patch(publishCourse);
router.route("/:id/unpublish").patch(unPublishCourse);


export default router;