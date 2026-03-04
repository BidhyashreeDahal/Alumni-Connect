import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { listAlumni } from "../controllers/directory.controller.js";

const router = Router();

/**
 * GET /directory/alumni
 * List alumni for students to browse mentors
 */
router.get("/alumni", requireAuth, listAlumni);

export default router;
