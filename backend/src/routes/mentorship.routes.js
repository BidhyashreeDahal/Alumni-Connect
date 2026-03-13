import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import {
  createMentorshipRequest,
  getMentorshipRequests,
  acceptMentorshipRequest,
  rejectMentorshipRequest,
  getMyMentorshipRequests,
  completeMentorship,
  cancelMentorship

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

router.patch(
  "/:id/complete",
  requireAuth,
  requireRole(["student", "alumni"]),
  completeMentorship
)

router.patch(
  "/:id/cancel",
  requireAuth,
  requireRole(["student"]),
  cancelMentorship
)

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
