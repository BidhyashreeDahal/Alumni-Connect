import { prisma } from "../db/prisma.js";

function canUserSeeEvent(eventAudience, userRole) {
  if (eventAudience === "all") return true;
  return eventAudience === userRole;
}

/**
 * Create event
 * Admin / Faculty only
 */
export async function createEvent(req, res) {
  try {
    const {
      title,
      description,
      location,
      eventDate,
      targetAudience = "all",
    } = req.body;

    if (!title || !eventDate) {
      return res.status(400).json({
        message: "title and eventDate are required",
      });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description: description || null,
        location: location || null,
        eventDate: new Date(eventDate),
        targetAudience,
        createdBy: req.user.id,
      },
    });

    return res.status(201).json({ event });
  } catch (error) {
    console.error("createEvent error:", error);
    return res.status(500).json({ message: "Failed to create event" });
  }
}

/**
 * List events
 * All authenticated users
 * Students/Alumni only see events for their audience
 */
export async function listEvents(req, res) {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;

    let where = {};

    if (userRole === "student" || userRole === "alumni") {
      where = {
        OR: [{ targetAudience: "all" }, { targetAudience: userRole }],
      };
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { eventDate: "asc" },
      include: {
        registrations: {
          select: {
            id: true,
            userId: true,
            status: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    const formattedEvents = events.map((event) => {
      const currentUserRegistration = event.registrations.find(
          (r) => r.userId === userId
      );

      const registeredCount = event.registrations.filter(
          (r) => r.status === "registered"
      ).length;

      const waitlistedCount = event.registrations.filter(
          (r) => r.status === "waitlisted"
      ).length;

      return {
        id: event.id,
        title: event.title,
        description: event.description,
        location: event.location,
        eventDate: event.eventDate,
        createdBy: event.createdBy,
        createdAt: event.createdAt,
        targetAudience: event.targetAudience,
        registeredCount,
        waitlistedCount,
        currentUserRegistration: currentUserRegistration || null,
        registrations:
            userRole === "admin" || userRole === "faculty"
                ? event.registrations
                : undefined,
      };
    });

    return res.json({ events: formattedEvents });
  } catch (error) {
    console.error("listEvents error:", error);
    return res.status(500).json({ message: "Failed to load events" });
  }
}

/**
 * Register for event
 * Student / Alumni only
 */
export async function registerForEvent(req, res) {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        registrations: {
          select: {
            id: true,
            userId: true,
            status: true,
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (!canUserSeeEvent(event.targetAudience, userRole)) {
      return res.status(403).json({
        message: "You are not allowed to register for this event",
      });
    }

    const existing = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (existing) {
      if (existing.status === "cancelled") {
        const updatedRegistration = await prisma.eventRegistration.update({
          where: {
            eventId_userId: {
              eventId,
              userId,
            },
          },
          data: {
            status: "registered",
          },
        });

        return res.status(200).json({
          message: "Registration updated to registered",
          registration: updatedRegistration,
        });
      }

      return res.status(409).json({
        message: "Already registered for this event",
        registration: existing,
      });
    }

    const registration = await prisma.eventRegistration.create({
      data: {
        eventId,
        userId,
        status: "registered",
      },
    });

    return res.status(201).json({
      message: "Registered successfully",
      registration,
    });
  } catch (error) {
    console.error("registerForEvent error:", error);
    return res.status(500).json({ message: "Failed to register for event" });
  }
}

/**
 * Cancel registration
 * Student / Alumni only
 */
export async function cancelEventRegistration(req, res) {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    const existing = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (!existing) {
      return res.status(404).json({ message: "Registration not found" });
    }

    const registration = await prisma.eventRegistration.update({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
      data: {
        status: "cancelled",
      },
    });

    return res.json({
      message: "Registration cancelled",
      registration,
    });
  } catch (error) {
    console.error("cancelEventRegistration error:", error);
    return res.status(500).json({ message: "Failed to cancel registration" });
  }
}