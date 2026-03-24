import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createStudentProfile,
  getMyStudentProfile,
  updateMyStudentProfile
} from "../controllers/student.controller.js";
import { createStudentProfileBodySchema, updateStudentProfileBodySchema } from "../validators/student.validators.js";

const router = Router();

/**
 * POST /students
 * Admin/Faculty create student profile (profile record only)
 */
router.post(
  "/",
  requireAuth,
  requireRole(["admin", "faculty"]),
  validate({ body: createStudentProfileBodySchema }),
  createStudentProfile
);

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