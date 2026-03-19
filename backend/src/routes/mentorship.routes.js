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
  getPopularMentors,
  scheduleMentorship,
  confirmMentorship,
  submitMentorshipFeedback,
  getMentorshipMessages,
  sendMentorshipMessage,
  proposeMentorshipSlots,
  selectMentorshipSlot
} from "../controllers/mentorship.controller.js";
import {
  mentorshipIdParamsSchema,
  mentorshipPaginationQuerySchema,
  mentorshipRequestBodySchema,
  scheduleMentorshipBodySchema,
  mentorshipFeedbackBodySchema,
  mentorshipMessageBodySchema,
  mentorshipSlotProposalBodySchema,
  mentorshipSlotSelectionParamsSchema
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


router.patch(
  "/:id/schedule",
  requireAuth,
  requireRole(["alumni"]),
  validate({ params: mentorshipIdParamsSchema, body: scheduleMentorshipBodySchema }),
  scheduleMentorship
);

router.patch(
  "/:id/confirm",
  requireAuth,
  requireRole(["student"]),
  validate({ params: mentorshipIdParamsSchema }),
  confirmMentorship
);

router.post(
  "/:id/feedback",
  requireAuth,
  requireRole(["student", "alumni"]),
  validate({ params: mentorshipIdParamsSchema, body: mentorshipFeedbackBodySchema }),
  submitMentorshipFeedback
);

router.get(
  "/:id/messages",
  requireAuth,
  requireRole(["student", "alumni"]),
  validate({ params: mentorshipIdParamsSchema }),
  getMentorshipMessages
);

router.post(
  "/:id/messages",
  requireAuth,
  requireRole(["student", "alumni"]),
  validate({ params: mentorshipIdParamsSchema, body: mentorshipMessageBodySchema }),
  sendMentorshipMessage
);

router.post(
  "/:id/slot-proposals",
  requireAuth,
  requireRole(["student", "alumni"]),
  validate({ params: mentorshipIdParamsSchema, body: mentorshipSlotProposalBodySchema }),
  proposeMentorshipSlots
);

router.patch(
  "/:id/slots/:slotId/select",
  requireAuth,
  requireRole(["student", "alumni"]),
  validate({ params: mentorshipSlotSelectionParamsSchema }),
  selectMentorshipSlot
);

export default router;
