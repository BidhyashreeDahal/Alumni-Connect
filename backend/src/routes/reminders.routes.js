import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { getMyReminders } from "../controllers/reminders.controller.js";

const router = Router();

router.get(
  "/me",
  requireAuth,
  requireRole(["admin", "faculty", "alumni", "student"]),
  getMyReminders
);

export default router;
