import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { createInvite } from "../controllers/invites.controller.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  requireRole(["admin", "faculty"]),
  createInvite
);

export default router;