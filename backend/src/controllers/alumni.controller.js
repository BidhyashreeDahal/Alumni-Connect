import { prisma } from "../db/prisma.js";
import {
  isAdminOrFaculty,
  sanitizeAlumniProfile
} from "../policies/access.policy.js";
import { recordAuditLog } from "../services/auditLog.service.js";

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

  if (!schoolEmail && !personalEmail) {
    return res
      .status(400)
      .json({ message: "Provide at least one of schoolEmail or personalEmail" });
  }

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
    "meetingLink"
    
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

  if (updates.skills) {
    if (!Array.isArray(updates.skills)) {
      return res.status(400).json({ message: "skills must be an array" });
    }
    updates.skills = updates.skills.map((s) => String(s));
  }

  if (updates.graduationYear !== undefined && updates.graduationYear !== null) {
    const y = parseInt(String(updates.graduationYear), 10);

    if (isNaN(y) || y < 1900 || y > 2100) {
      return res.status(400).json({ message: "graduationYear must be valid" });
    }

    updates.graduationYear = y;
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