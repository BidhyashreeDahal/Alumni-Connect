import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createNote,
  getNotesByProfile,
  updateNote,
  deleteNote,
} from "../controllers/notes.controller.js";
import {
  createNoteBodySchema,
  listNotesQuerySchema,
  noteIdParamsSchema,
  noteProfileParamsSchema,
  updateNoteBodySchema
} from "../validators/note.validators.js";

const router = Router();

/**
 * POST /notes
 * Faculty/Admin create a private note for an alumni profile
 */
router.post(
  "/",
  requireAuth,
  requireRole(["admin", "faculty"]),
  validate({ body: createNoteBodySchema }),
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
  validate({ params: noteProfileParamsSchema, query: listNotesQuerySchema }),
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
  validate({ params: noteIdParamsSchema }),
  deleteNote
);

router.patch(
  "/:id",
  requireAuth,
  requireRole(["admin", "faculty"]),
  validate({ params: noteIdParamsSchema, body: updateNoteBodySchema }),
  updateNote
);

export default router;
