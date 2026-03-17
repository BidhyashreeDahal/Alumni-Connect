import { prisma } from "../db/prisma.js";

const PROFILE_VISIBILITY_VALUES = ["public", "students_only", "hidden"];

function isBoolean(value) {
  return typeof value === "boolean";
}

function ensureSettingsModelReady(res) {
  if (!prisma.userSettings) {
    res.status(503).json({
      message:
        "Settings model is not available yet. Apply Prisma schema changes, run migration, and regenerate Prisma client."
    });
    return false;
  }
  return true;
}

/**
 * GET /settings/me
 * Returns persisted settings if they exist, otherwise role-safe defaults.
 */
export async function getMySettings(req, res) {
  if (!ensureSettingsModelReady(res)) return;

  const defaults = {
    profileVisibility: "students_only",
    emailMentorship: true,
    emailEvents: true,
    emailAnnouncements: true
  };

  const settings = await prisma.userSettings.findUnique({
    where: { userId: req.user.id },
    select: {
      profileVisibility: true,
      emailMentorship: true,
      emailEvents: true,
      emailAnnouncements: true,
      updatedAt: true
    }
  });

  return res.json({
    settings: {
      ...defaults,
      ...(settings || {})
    }
  });
}

/**
 * PATCH /settings/me
 * Updates the authenticated user's preferences.
 */
export async function updateMySettings(req, res) {
  if (!ensureSettingsModelReady(res)) return;

  const payload = req.body || {};
  const updates = {};

  if (payload.profileVisibility !== undefined) {
    if (!PROFILE_VISIBILITY_VALUES.includes(payload.profileVisibility)) {
      return res.status(400).json({
        message: "profileVisibility must be one of: public, students_only, hidden"
      });
    }
    updates.profileVisibility = payload.profileVisibility;
  }

  if (payload.emailMentorship !== undefined) {
    if (!isBoolean(payload.emailMentorship)) {
      return res.status(400).json({ message: "emailMentorship must be boolean" });
    }
    updates.emailMentorship = payload.emailMentorship;
  }

  if (payload.emailEvents !== undefined) {
    if (!isBoolean(payload.emailEvents)) {
      return res.status(400).json({ message: "emailEvents must be boolean" });
    }
    updates.emailEvents = payload.emailEvents;
  }

  if (payload.emailAnnouncements !== undefined) {
    if (!isBoolean(payload.emailAnnouncements)) {
      return res.status(400).json({ message: "emailAnnouncements must be boolean" });
    }
    updates.emailAnnouncements = payload.emailAnnouncements;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      message:
        "No valid settings fields were provided. Allowed fields: profileVisibility, emailMentorship, emailEvents, emailAnnouncements"
    });
  }

  const settings = await prisma.userSettings.upsert({
    where: { userId: req.user.id },
    create: {
      userId: req.user.id,
      ...updates
    },
    update: updates,
    select: {
      profileVisibility: true,
      emailMentorship: true,
      emailEvents: true,
      emailAnnouncements: true,
      updatedAt: true
    }
  });

  return res.json({
    message: "Settings updated",
    settings
  });
}
