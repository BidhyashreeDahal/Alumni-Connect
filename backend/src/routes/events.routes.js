import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import {
  createEvent,
  listEvents,
  registerForEvent,
  cancelEventRegistration,
} from "../controllers/events.controller.js";

const router = Router();

router.post(
    "/",
    requireAuth,
    requireRole(["admin", "faculty"]),
    createEvent
);

router.get("/", requireAuth, listEvents);

router.post(
    "/:id/register",
    requireAuth,
    requireRole(["student", "alumni"]),
    registerForEvent
);

router.patch(
    "/:id/register/cancel",
    requireAuth,
    requireRole(["student", "alumni"]),
    cancelEventRegistration
);

export default router;