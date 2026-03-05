import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { createInvite } from "../controllers/invites.controller.js";

const router = Router();

/**
 * POST /invites
 * Faculty/Admin generate invite for Student or Alumni profile
 *
 * body:
 * {
 *   profileId: "...",
 *   type: "alumni" | "student"
 * }
 */
router.post(
  "/invites",
  requireAuth,
  requireRole(["admin", "faculty"]),
  createInvite
);

export default router;
