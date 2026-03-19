import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createMentorshipRequest,
  getMentorshipRequests,
  acceptMentorshipRequest,
  rejectMentorshipRequest,
  getMyMentorshipRequests,
  completeMentorship,
  cancelMentorship,
  getPopularMentors

} from "../controllers/mentorship.controller.js";
import {
  mentorshipIdParamsSchema,
  mentorshipPaginationQuerySchema,
  mentorshipRequestBodySchema
} from "../validators/mentorship.validators.js";

const router = Router();

/**
 * POST /mentorship/request
 * Student sends mentorship request to an alumni
 */
router.post(
  "/request",
  requireAuth,
  requireRole(["student"]),
  validate({ body: mentorshipRequestBodySchema }),
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
  validate({ query: mentorshipPaginationQuerySchema }),
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
  validate({ params: mentorshipIdParamsSchema }),
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
  validate({ params: mentorshipIdParamsSchema }),
  rejectMentorshipRequest
);

router.patch(
  "/:id/complete",
  requireAuth,
  requireRole(["student", "alumni"]),
  validate({ params: mentorshipIdParamsSchema }),
  completeMentorship
)

router.patch(
  "/:id/cancel",
  requireAuth,
  requireRole(["student"]),
  validate({ params: mentorshipIdParamsSchema }),
  cancelMentorship
)

/**
 * To see the mentorship requested for students
 */
router.get(
  "/my",
  requireAuth,
  requireRole(["student"]),
  validate({ query: mentorshipPaginationQuerySchema }),
  getMyMentorshipRequests
);

router.get(
  "/popular-mentors",
  requireAuth,
  requireRole(["student"]),
  getPopularMentors
);
export default router;
