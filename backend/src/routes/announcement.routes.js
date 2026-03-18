import { Router } from "express";
import {
    listAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
} from "../controllers/announcement.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", requireAuth, listAnnouncements);
router.post("/", requireAuth, createAnnouncement);
router.put("/:id", requireAuth, updateAnnouncement);
router.delete("/:id", requireAuth, deleteAnnouncement);

export default router;