import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

/*
Create Event
Faculty and Admin only
*/
router.post(
  "/",
  requireAuth,
  requireRole(["admin", "faculty"]),
  async (req, res) => {
    const { title, description, location, eventDate } = req.body;

    if (!title || !eventDate) {
      return res.status(400).json({ message: "title and eventDate required" });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        location,
        eventDate: new Date(eventDate),
        createdBy: req.user.id
      }
    });

    res.status(201).json({ event });
  }
);

/*
List all events
All authenticated users
*/
router.get("/", requireAuth, async (req, res) => {
  const events = await prisma.event.findMany({
    orderBy: { eventDate: "asc" }
  });

  res.json({ events });
});

/*
Register for event
Students or Alumni
*/
router.post(
  "/:id/register",
  requireAuth,
  requireRole(["student", "alumni"]),
  async (req, res) => {
    const eventId = req.params.id;

    try {
      const registration = await prisma.eventRegistration.create({
        data: {
          eventId,
          userId: req.user.id
        }
      });

      res.status(201).json({
        message: "Registered successfully",
        registration
      });
    } catch (err) {
      res.status(409).json({
        message: "Already registered for this event"
      });
    }
  }
);

export default router;