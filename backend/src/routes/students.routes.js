import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  getMyStudentProfile,
  updateMyStudentProfile
} from "../controllers/student.controller.js";
import { updateStudentProfileBodySchema } from "../validators/student.validators.js";

const router = Router();

/**
 * GET /students/me
 */
router.get(
  "/me",
  requireAuth,
  requireRole(["student"]),
  getMyStudentProfile
);

/**
 * PATCH /students/me
 */
router.patch(
  "/me",
  requireAuth,
  requireRole(["student"]),
  validate({ body: updateStudentProfileBodySchema }),
  updateMyStudentProfile
);

/**
 * PUT /students/me
 * Kept for compatibility with existing frontend calls.
 */
router.put(
  "/me",
  requireAuth,
  requireRole(["student"]),
  validate({ body: updateStudentProfileBodySchema }),
  updateMyStudentProfile
);

export default router;