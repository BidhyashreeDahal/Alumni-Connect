import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import {
  createNote,
  getNotesByProfile,
  deleteNote,
} from "../controllers/notes.controller.js";

const router = Router();

/**
 * POST /notes
 * Faculty/Admin create a private note for an alumni profile
 */
router.post(
  "/",
  requireAuth,
  requireRole(["admin", "faculty"]),
  createNote
);

/**
 * GET /notes/profile/:id
 * Faculty/Admin view notes for a profile
 * Only shows notes created by the logged-in faculty
 */
router.get(
  "/profile/:id",
  requireAuth,
  requireRole(["admin", "faculty"]),
  getNotesByProfile
);

/**
 * DELETE /notes/:id
 * Faculty/Admin delete their own note
 */
router.delete(
  "/:id",
  requireAuth,
  requireRole(["admin", "faculty"]),
  deleteNote
);

export default router;
