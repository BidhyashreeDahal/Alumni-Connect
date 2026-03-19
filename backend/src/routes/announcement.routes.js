import { Router } from "express";
import {
    listAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
} from "../controllers/announcement.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
    announcementIdParamsSchema,
    createAnnouncementBodySchema,
    listAnnouncementsQuerySchema,
    updateAnnouncementBodySchema,
} from "../validators/announcement.validators.js";

const router = Router();

router.get("/", requireAuth, validate({ query: listAnnouncementsQuerySchema }), listAnnouncements);
router.post("/", requireAuth, requireRole(["admin", "faculty"]), validate({ body: createAnnouncementBodySchema }), createAnnouncement);
router.put("/:id", requireAuth, requireRole(["admin", "faculty"]), validate({ params: announcementIdParamsSchema, body: updateAnnouncementBodySchema }), updateAnnouncement);
router.delete("/:id", requireAuth, requireRole(["admin", "faculty"]), validate({ params: announcementIdParamsSchema }), deleteAnnouncement);

export default router;