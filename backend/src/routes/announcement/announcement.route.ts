import { Router } from "express";
import { deleteAnnouncement, getAnnouncement, postAnnouncement, updateAnnouncement } from "controller/announsement/announsement.controller";

const router = Router();

router.route("/postAnnouncement").post(postAnnouncement);
router.route("/updateAnnouncement/:id").patch(updateAnnouncement)
router.route("/deleteAnnouncement").get(deleteAnnouncement);
router.route("/getAllAnnouncement").get(getAnnouncement);


export default router;