import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import {
  createInvite,
  reissueInvite,
  listInviteStatuses
} from "../controllers/invites.controller.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  requireRole(["admin", "faculty"]),
  createInvite
);

router.post(
  "/reissue",
  requireAuth,
  requireRole(["admin", "faculty"]),
  reissueInvite
);

router.get(
  "/",
  requireAuth,
  requireRole(["admin", "faculty"]),
  listInviteStatuses
);

export default router;