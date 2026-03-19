import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createEvent,
  listEvents,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelEventRegistration,
} from "../controllers/events.controller.js";
import {
  createEventBodySchema,
  eventIdParamsSchema,
  listEventsQuerySchema,
  updateEventBodySchema
} from "../validators/event.validators.js";

const router = Router();

router.post(
    "/",
    requireAuth,
    requireRole(["admin", "faculty"]),
    validate({ body: createEventBodySchema }),
    createEvent
);

router.get("/", requireAuth, validate({ query: listEventsQuerySchema }), listEvents);

router.patch(
    "/:id",
    requireAuth,
    requireRole(["admin", "faculty"]),
    validate({ params: eventIdParamsSchema, body: updateEventBodySchema }),
    updateEvent
);

router.delete(
    "/:id",
    requireAuth,
    requireRole(["admin", "faculty"]),
    validate({ params: eventIdParamsSchema }),
    deleteEvent
);

router.post(
    "/:id/register",
    requireAuth,
    requireRole(["student", "alumni"]),
    validate({ params: eventIdParamsSchema }),
    registerForEvent
);

router.patch(
    "/:id/register/cancel",
    requireAuth,
    requireRole(["student", "alumni"]),
    validate({ params: eventIdParamsSchema }),
    cancelEventRegistration
);

export default router;