import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import {
  createMentorshipRequest,
  getMentorshipRequests,
  acceptMentorshipRequest,
  rejectMentorshipRequest,
    getMyMentorshipRequests
} from "../controllers/mentorship.controller.js";

const router = Router();

/**
 * POST /mentorship/request
 * Student sends mentorship request to an alumni
 */
router.post(
  "/request",
  requireAuth,
  requireRole(["student"]),
  createMentorshipRequest
);

/**
 * GET /mentorship/requests
 * Alumni views incoming mentorship requests
 */
router.get(
  "/requests",
  requireAuth,
  requireRole(["alumni"]),
  getMentorshipRequests
);

/**
 * PATCH /mentorship/:id/accept
 * Alumni accepts mentorship request
 */
router.patch(
  "/:id/accept",
  requireAuth,
  requireRole(["alumni"]),
  acceptMentorshipRequest
);

/**
 * PATCH /mentorship/:id/reject
 * Alumni rejects mentorship request
 */

router.patch(
  "/:id/reject",
  requireAuth,
  requireRole(["alumni"]),
  rejectMentorshipRequest
);

/**
 * To see the mentorship requested for students
 */
router.get(
  "/my",
  requireAuth,
  requireRole(["student"]),
  getMyMentorshipRequests
);
export default router;
