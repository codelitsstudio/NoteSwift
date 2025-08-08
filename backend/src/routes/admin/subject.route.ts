import { all, createSubject, deleteSubject, getById, updateSubject } from "controller/admin/subject.controller";
import { Router } from "express";


const router = Router();

router.route("/").post(createSubject);
router.route("/").get(all);
router.route("/:id").put(updateSubject);
router.route("/:id").get(getById); 
router.route("/").delete(deleteSubject);


export default router;