import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { inviteMutationLimiter } from "../middleware/rateLimit.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createInvite,
  reissueInvite,
  listInviteStatuses
} from "../controllers/invites.controller.js";
import {
  createInviteBodySchema,
  listInviteStatusesQuerySchema
} from "../validators/invite.validators.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  requireRole(["admin", "faculty"]),
  inviteMutationLimiter,
  validate({ body: createInviteBodySchema }),
  createInvite
);

router.post(
  "/reissue",
  requireAuth,
  requireRole(["admin", "faculty"]),
  inviteMutationLimiter,
  validate({ body: createInviteBodySchema }),
  reissueInvite
);

router.get(
  "/",
  requireAuth,
  requireRole(["admin", "faculty"]),
  validate({ query: listInviteStatusesQuerySchema }),
  listInviteStatuses
);

export default router;