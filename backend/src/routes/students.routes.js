import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import {
  getMyStudentProfile,
  updateMyStudentProfile
} from "../controllers/student.controller.js";

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
  updateMyStudentProfile
);

export default router;