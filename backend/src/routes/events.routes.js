import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import {
  createEvent,
  listEvents,
  registerForEvent,
} from "../controllers/events.controller.js";

const router = Router();

/**
 * POST /events
 * Create Event
 * Faculty and Admin only
 */
router.post(
  "/",
  requireAuth,
  requireRole(["admin", "faculty"]),
  createEvent
);

/**
 * GET /events
 * List all events
 * All authenticated users
 */
router.get("/", requireAuth, listEvents);

/**
 * POST /events/:id/register
 * Register for event
 * Students or Alumni
 */
router.post(
  "/:id/register",
  requireAuth,
  requireRole(["student", "alumni"]),
  registerForEvent
);

export default router;
