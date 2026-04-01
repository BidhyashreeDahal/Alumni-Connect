import { prisma } from "../db/prisma.js";
import {
  isAdminOrFaculty,
  sanitizeAlumniProfile
} from "../policies/access.policy.js";
import { recordAuditLog } from "../services/auditLog.service.js";
import { findPotentialUnclaimedAlumniDuplicate } from "../services/profileDuplicate.service.js";

function hasMentorshipContact(profile) {
  return Boolean(
    profile?.personalEmail ||
      profile?.schoolEmail ||
      profile?.linkedinUrl ||
      profile?.meetingLink
  );
}

function isPreferredChannelConfigured(profile, preferredChannel) {
  if (!preferredChannel) return true;
  if (preferredChannel === "email") {
    return Boolean(profile?.personalEmail || profile?.schoolEmail);
  }
  if (preferredChannel === "linkedin") {
    return Boolean(profile?.linkedinUrl);
  }
  if (preferredChannel === "calendly") {
    return Boolean(profile?.meetingLink);
  }
  return false;
}

function isValidDeleteConfirmation({ confirmText, profile }) {
  const normalized = String(confirmText || "").trim().toLowerCase();
  if (!normalized) return false;

  if (normalized === "delete") return true;

  const emails = [profile?.schoolEmail, profile?.personalEmail]
    .filter(Boolean)
    .map((email) => String(email).trim().toLowerCase());

  return emails.includes(normalized);
}

/**
 * Create an AlumniProfile record
 * Faculty/Admin only
 */
export async function createProfile(req, res) {
  const {
    schoolEmail,
    personalEmail,
    firstName,
    lastName,
    program,
    graduationYear,
    jobTitle,
    company,
    skills,
    linkedinUrl,
    meetingLink

   
  } = req.body || {};

  const normalizedSchool = schoolEmail
    ? String(schoolEmail).trim().toLowerCase()
    : null;

  const normalizedPersonal = personalEmail
    ? String(personalEmail).trim().toLowerCase()
    : null;

  const gradYear =
    graduationYear === undefined || graduationYear === null
      ? null
      : parseInt(String(graduationYear), 10);

  if (gradYear !== null && (isNaN(gradYear) || gradYear < 1900 || gradYear > 2100)) {
    return res.status(400).json({ message: "graduationYear must be a valid year" });
  }

  const skillsArray = Array.isArray(skills) ? skills.map((s) => String(s)) : [];

  const duplicate = await findPotentialUnclaimedAlumniDuplicate({
    firstName,
    lastName,
    graduationYear: gradYear,
    program
  });

  if (duplicate) {
    return res.status(409).json({
      message: "Possible duplicate alumni profile found. Review existing record before creating a new one.",
      details: {
        duplicateProfileId: duplicate.id
      }
    });
  }

  try {
    const profile = await prisma.alumniProfile.create({
      data: {
        schoolEmail: normalizedSchool,
        personalEmail: normalizedPersonal,
        firstName: firstName ? String(firstName).trim() : null,
        lastName: lastName ? String(lastName).trim() : null,
        program: program ? String(program).trim() : null,
        graduationYear: gradYear,
        jobTitle: jobTitle ? String(jobTitle).trim() : null,
        company: company ? String(company).trim() : null,
        skills: skillsArray,
        linkedinUrl: linkedinUrl ? String(linkedinUrl).trim() : null,
        meetingLink: meetingLink ? String(meetingLink).trim() : null
      },
    });

    await recordAuditLog(req, {
      action: "alumni_profile_created",
      entityType: "alumni_profile",
      entityId: profile.id,
      summary: "Created alumni profile",
      metadata: {
        schoolEmail: profile.schoolEmail,
        personalEmail: profile.personalEmail,
        firstName: profile.firstName,
        lastName: profile.lastName,
        program: profile.program,
        graduationYear: profile.graduationYear
      }
    });

    return res.status(201).json({ message: "Profile created", profile });
  } catch {
    return res.status(409).json({ message: "Email already exists on another profile" });
  }
}

/**
 * PATCH /alumni/:id/email
 * Admin/Faculty can update contact emails only for unclaimed alumni profiles
 */
export async function updateUnclaimedAlumniEmails(req, res) {
  const { id } = req.params;
  const { schoolEmail, personalEmail } = req.body || {};

  const updates = {};

  if (schoolEmail !== undefined) {
    updates.schoolEmail = schoolEmail
      ? String(schoolEmail).trim().toLowerCase()
      : null;
  }

  if (personalEmail !== undefined) {
    updates.personalEmail = personalEmail
      ? String(personalEmail).trim().toLowerCase()
      : null;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      message: "At least one of schoolEmail or personalEmail must be provided"
    });
  }

  const profile = await prisma.alumniProfile.findUnique({
    where: { id },
    select: { id: true, userId: true, schoolEmail: true, personalEmail: true }
  });

  if (!profile) {
    return res.status(404).json({ message: "Profile not found" });
  }

  if (profile.userId) {
    return res.status(409).json({
      message: "Claimed alumni profiles cannot be updated from this endpoint"
    });
  }

  try {
    const updated = await prisma.alumniProfile.update({
      where: { id },
      data: updates
    });

    await recordAuditLog(req, {
      action: "alumni_unclaimed_email_updated",
      entityType: "alumni_profile",
      entityId: updated.id,
      summary: "Updated contact emails for unclaimed alumni profile",
      metadata: {
        before: {
          schoolEmail: profile.schoolEmail,
          personalEmail: profile.personalEmail
        },
        after: {
          schoolEmail: updated.schoolEmail,
          personalEmail: updated.personalEmail
        }
      }
    });

    return res.json({
      message: "Alumni contact emails updated",
      profile: sanitizeAlumniProfile(updated, req.user)
    });
  } catch (error) {
    const isUniqueViolation = error?.code === "P2002";
    return res.status(isUniqueViolation ? 409 : 500).json({
      message: isUniqueViolation
        ? "Email already exists on another profile"
        : "Failed to update alumni contact emails"
    });
  }
}

/**
 * DELETE /alumni/:id/permanent-delete
 * Admin-only permanent delete for unclaimed alumni profiles
 */
export async function permanentlyDeleteUnclaimedAlumniProfile(req, res) {
  const { id } = req.params;
  const { reason, confirmText } = req.body || {};

  const profile = await prisma.alumniProfile.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      schoolEmail: true,
      personalEmail: true,
      firstName: true,
      lastName: true,
      graduationYear: true
    }
  });

  if (!profile) {
    return res.status(404).json({ message: "Profile not found" });
  }

  if (profile.userId && profile.userId === req.user.id) {
    return res.status(400).json({ message: "You cannot permanently delete your own account profile" });
  }

  if (profile.userId) {
    return res.status(409).json({
      message: "Claimed profiles cannot be permanently deleted from this endpoint"
    });
  }

  if (!isValidDeleteConfirmation({ confirmText, profile })) {
    return res.status(400).json({
      message: "Confirmation failed. Type DELETE or the profile email to confirm permanent deletion."
    });
  }

  await prisma.$transaction(async (tx) => {
    await tx.inviteToken.deleteMany({
      where: { profileId: id, profileType: "alumni" }
    });

    await tx.privateNote.deleteMany({
      where: { profileId: id, profileType: "alumni" }
    });

    await tx.mentorshipRequest.deleteMany({
      where: { alumniId: id }
    });

    await tx.alumniProfile.delete({
      where: { id }
    });
  });

  await recordAuditLog(req, {
    action: "alumni_unclaimed_profile_permanently_deleted",
    entityType: "alumni_profile",
    entityId: id,
    summary: "Permanently deleted unclaimed alumni profile",
    metadata: {
      reason: String(reason).trim(),
      profile: {
        schoolEmail: profile.schoolEmail,
        personalEmail: profile.personalEmail,
        firstName: profile.firstName,
        lastName: profile.lastName,
        graduationYear: profile.graduationYear
      }
    }
  });

  return res.json({
    message: "Unclaimed alumni profile permanently deleted"
  });
}

/**
 * List alumni profiles with filtering
 */
export async function listProfiles(req, res) {
  const { program, year, skill, search, page = 1, pageSize = 20 } = req.query;
  const take = Math.min(Math.max(Number(pageSize) || 20, 1), 100);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const profiles = await prisma.alumniProfile.findMany({
    where: {
      isArchived: false,
      program: program || undefined,
      graduationYear: year ? Number(year) : undefined,
      skills: skill ? { has: skill } : undefined,
      OR: search
        ? [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { company: { contains: search, mode: "insensitive" } },
            { jobTitle: { contains: search, mode: "insensitive" } },
          ]
        : undefined,
    },
    include: { user: { select: { email: true } } },
    orderBy: [{ updatedAt: "desc" }, { lastName: "asc" }, { firstName: "asc" }],
    skip,
    take
  });

  return res.json({
    profiles: profiles.map((profile) => sanitizeAlumniProfile(profile, req.user)),
    meta: { page: Number(page), pageSize: take }
  });
}

/**
 * Get current user's alumni profile
 */
export async function getMyProfile(req, res) {
  const userId = req.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { alumniProfile: true },
  });

  if (!user || !user.alumniProfile) {
    return res
      .status(404)
      .json({ message: "No alumni profile linked to this account" });
  }

  if (user.alumniProfile.isArchived) {
    return res.status(403).json({ message: "Profile is archived" });
  }

  return res.json({ profile: sanitizeAlumniProfile(user.alumniProfile, req.user) });
}

/**
 * Update current user's alumni profile
 */
export async function updateMyProfile(req, res) {
  const userId = req.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { alumniProfile: true },
  });

  if (!user || !user.alumniProfile) {
    return res.status(404).json({ message: "No profile linked to this account" });
  }

  if (user.alumniProfile.isArchived) {
    return res.status(403).json({ message: "Profile is archived" });
  }

  const allowed = [
    "personalEmail",
    "jobTitle",
    "company",
    "skills",
    "firstName",
    "lastName",
    "linkedinUrl",
    "meetingLink",
    "openToMentorship",
    "yearsOfExperience",
    "preferredMentorshipChannel"
    
  ];

  const updates = {};

  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) {
      updates[key] = req.body[key];
    }
  }

  if (updates.personalEmail) {
    updates.personalEmail = String(updates.personalEmail)
      .trim()
      .toLowerCase();
  }

  if (updates.linkedinUrl !== undefined) {
    updates.linkedinUrl = updates.linkedinUrl
      ? String(updates.linkedinUrl).trim()
      : null;
  }

  if (updates.meetingLink !== undefined) {
    updates.meetingLink = updates.meetingLink
      ? String(updates.meetingLink).trim()
      : null;
  }

  if (updates.skills) {
    if (!Array.isArray(updates.skills)) {
      return res.status(400).json({ message: "skills must be an array" });
    }
    updates.skills = updates.skills.map((s) => String(s));
  }

  if (Object.prototype.hasOwnProperty.call(req.body, "graduationYear")) {
    return res.status(400).json({
      message: "graduationYear cannot be changed from alumni self-edit"
    });
  }

  if (updates.openToMentorship !== undefined && typeof updates.openToMentorship !== "boolean") {
    return res.status(400).json({ message: "openToMentorship must be boolean" });
  }

  if (updates.yearsOfExperience !== undefined) {
    if (updates.yearsOfExperience === "" || updates.yearsOfExperience === null) {
      updates.yearsOfExperience = null;
    } else {
      const years = parseInt(String(updates.yearsOfExperience), 10);
      if (isNaN(years) || years < 0 || years > 80) {
        return res.status(400).json({ message: "yearsOfExperience must be between 0 and 80" });
      }
      updates.yearsOfExperience = years;
    }
  }

  if (updates.preferredMentorshipChannel === "") {
    updates.preferredMentorshipChannel = null;
  }

  const resultingProfile = {
    ...user.alumniProfile,
    ...updates
  };

  if (resultingProfile.openToMentorship === true && !hasMentorshipContact(resultingProfile)) {
    return res.status(400).json({
      message: "Add at least one contact method (email, LinkedIn, or Calendly/meeting link) before enabling mentorship."
    });
  }

  if (
    resultingProfile.openToMentorship === true &&
    !isPreferredChannelConfigured(resultingProfile, resultingProfile.preferredMentorshipChannel)
  ) {
    return res.status(400).json({
      message: "Preferred mentorship channel must match a configured contact method."
    });
  }

  try {
    const profile = await prisma.alumniProfile.update({
      where: { id: user.alumniProfile.id },
      data: updates,
    });

    await recordAuditLog(req, {
      action: "alumni_profile_updated",
      entityType: "alumni_profile",
      entityId: profile.id,
      summary: "Updated alumni profile",
      metadata: {
        updatedFields: Object.keys(updates)
      }
    });

    return res.json({ message: "Profile updated", profile });
  } catch {
    return res.status(409).json({ message: "Update failed" });
  }
}

/**
 * Get specific alumni profile
 */
export async function getProfileById(req, res) {
  const { id } = req.params;

  const profile = await prisma.alumniProfile.findUnique({
    where: { id },
    include: { user: { select: { email: true } } }
  });

  if (!profile || (profile.isArchived && !isAdminOrFaculty(req.user.role))) {
    return res.status(404).json({ message: "Profile not found" });
  }

  return res.json({ profile: sanitizeAlumniProfile(profile, req.user) });
}