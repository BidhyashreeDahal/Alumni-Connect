import { prisma } from "../db/prisma.js";

/**
 * Create a new event
 * Faculty/Admin only
 */
export async function createEvent(req, res) {
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

/**
 * List all events
 * All authenticated users
 */
export async function listEvents(req, res) {
  const events = await prisma.event.findMany({
    orderBy: { eventDate: "asc" }
  });

  res.json({ events });
}

/**
 * Register for an event
 * Students or Alumni
 */
export async function registerForEvent(req, res) {
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
