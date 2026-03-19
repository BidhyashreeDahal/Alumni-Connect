import { prisma } from "../db/prisma.js";

const EVENT_AUDIENCES = ["all", "student", "alumni"];

function canUserSeeEvent(eventAudience, userRole) {
  if (eventAudience === "all") return true;
  return eventAudience === userRole;
}

function sanitizeText(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function parseEventDate(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function serializeEvent(event, userRole, userId) {
  const currentUserRegistration = event.registrations.find((r) => r.userId === userId);
  const registeredCount = event.registrations.filter((r) => r.status === "registered").length;
  const waitlistedCount = event.registrations.filter((r) => r.status === "waitlisted").length;
  const cancelledCount = event.registrations.filter((r) => r.status === "cancelled").length;
  const isPast = new Date(event.eventDate).getTime() < Date.now();

  return {
    id: event.id,
    title: event.title,
    description: event.description,
    location: event.location,
    eventDate: event.eventDate,
    createdBy: event.createdBy,
    createdAt: event.createdAt,
    targetAudience: event.targetAudience,
    isPast,
    creator:
      userRole === "admin" || userRole === "faculty"
        ? {
            id: event.creator.id,
            email: event.creator.email,
            role: event.creator.role,
          }
        : undefined,
    stats: {
      registeredCount,
      waitlistedCount,
      cancelledCount,
      totalResponses: event.registrations.length,
    },
    registeredCount,
    waitlistedCount,
    currentUserRegistration: currentUserRegistration || null,
    registrations:
      userRole === "admin" || userRole === "faculty"
        ? event.registrations.map((registration) => ({
            id: registration.id,
            userId: registration.userId,
            status: registration.status,
            createdAt: registration.createdAt,
            updatedAt: registration.updatedAt,
            user: {
              email: registration.user.email,
              role: registration.user.role,
            },
          }))
        : undefined,
  };
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

    const sanitizedTitle = sanitizeText(title);
    const sanitizedDescription = sanitizeText(description);
    const sanitizedLocation = sanitizeText(location);
    const parsedEventDate = parseEventDate(eventDate);

    if (!sanitizedTitle || !parsedEventDate) {
      return res.status(400).json({
        message: "A valid title and event date are required",
      });
    }

    if (!EVENT_AUDIENCES.includes(targetAudience)) {
      return res.status(400).json({
        message: "Invalid target audience",
      });
    }

    const event = await prisma.event.create({
      data: {
        title: sanitizedTitle,
        description: sanitizedDescription,
        location: sanitizedLocation,
        eventDate: parsedEventDate,
        targetAudience,
        createdBy: req.user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        registrations: {
          include: {
            user: {
              select: {
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    return res.status(201).json({
      message: "Event created successfully",
      event: serializeEvent(event, req.user.role, req.user.id),
    });
  } catch (error) {
    req.log?.error({ err: error }, "Failed to create event");
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
    const search = sanitizeText(req.query.search);
    const timeframe = req.query.timeframe === "past" || req.query.timeframe === "upcoming"
      ? req.query.timeframe
      : "all";
    const audienceFilter =
      typeof req.query.audience === "string" && EVENT_AUDIENCES.includes(req.query.audience)
        ? req.query.audience
        : null;

    const andConditions = [];

    if (userRole === "student" || userRole === "alumni") {
      andConditions.push({
        OR: [{ targetAudience: "all" }, { targetAudience: userRole }],
      });
    }

    if (userRole === "admin" || userRole === "faculty") {
      if (audienceFilter) {
        andConditions.push({ targetAudience: audienceFilter });
      }
    }

    if (search) {
      andConditions.push({
        OR: [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    if (timeframe === "upcoming") {
      andConditions.push({ eventDate: { gte: new Date() } });
    } else if (timeframe === "past") {
      andConditions.push({ eventDate: { lt: new Date() } });
    }

    const where = andConditions.length > 0 ? { AND: andConditions } : {};

    const events = await prisma.event.findMany({
      where,
      orderBy: { eventDate: "asc" },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        registrations: {
          include: {
            user: {
              select: {
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    const formattedEvents = events.map((event) =>
      serializeEvent(event, userRole, userId)
    );

    return res.json({
      events: formattedEvents,
      meta: {
        total: formattedEvents.length,
        timeframe,
      },
    });
  } catch (error) {
    req.log?.error({ err: error }, "Failed to load events");
    return res.status(500).json({ message: "Failed to load events" });
  }
}

/**
 * Update event
 * Admin / Faculty only
 */
export async function updateEvent(req, res) {
  try {
    const eventId = req.params.id;
    const { title, description, location, eventDate, targetAudience = "all" } = req.body;

    const existing = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        registrations: {
          include: {
            user: {
              select: {
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!existing) {
      return res.status(404).json({ message: "Event not found" });
    }

    const sanitizedTitle = sanitizeText(title);
    const sanitizedDescription = sanitizeText(description);
    const sanitizedLocation = sanitizeText(location);
    const parsedEventDate = parseEventDate(eventDate);

    if (!sanitizedTitle || !parsedEventDate) {
      return res.status(400).json({
        message: "A valid title and event date are required",
      });
    }

    if (!EVENT_AUDIENCES.includes(targetAudience)) {
      return res.status(400).json({
        message: "Invalid target audience",
      });
    }

    const updated = await prisma.event.update({
      where: { id: eventId },
      data: {
        title: sanitizedTitle,
        description: sanitizedDescription,
        location: sanitizedLocation,
        eventDate: parsedEventDate,
        targetAudience,
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        registrations: {
          include: {
            user: {
              select: {
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    return res.json({
      message: "Event updated successfully",
      event: serializeEvent(updated, req.user.role, req.user.id),
    });
  } catch (error) {
    req.log?.error({ err: error }, "Failed to update event");
    return res.status(500).json({ message: "Failed to update event" });
  }
}

/**
 * Delete event
 * Admin / Faculty only
 */
export async function deleteEvent(req, res) {
  try {
    const eventId = req.params.id;

    const existing = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true },
    });

    if (!existing) {
      return res.status(404).json({ message: "Event not found" });
    }

    await prisma.event.delete({
      where: { id: eventId },
    });

    return res.json({ message: "Event deleted successfully" });
  } catch (error) {
    req.log?.error({ err: error }, "Failed to delete event");
    return res.status(500).json({ message: "Failed to delete event" });
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

    if (new Date(event.eventDate).getTime() < Date.now()) {
      return res.status(400).json({
        message: "Past events can no longer accept registrations",
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
    req.log?.error({ err: error }, "Failed to register for event");
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
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, eventDate: true },
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (new Date(event.eventDate).getTime() < Date.now()) {
      return res.status(400).json({
        message: "Past events can no longer be changed",
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

    if (!existing) {
      return res.status(404).json({ message: "Registration not found" });
    }

    if (existing.status === "cancelled") {
      return res.status(409).json({ message: "Registration is already cancelled" });
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
    req.log?.error({ err: error }, "Failed to cancel event registration");
    return res.status(500).json({ message: "Failed to cancel registration" });
  }
}