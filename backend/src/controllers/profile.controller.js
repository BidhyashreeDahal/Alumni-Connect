import { prisma } from "../db/prisma.js";

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
  } = req.body || {};

  if (!schoolEmail && !personalEmail) {
    return res.status(400).json({ message: "Provide at least one of schoolEmail or personalEmail" });
  }

  const normalizedSchool = schoolEmail ? String(schoolEmail).trim().toLowerCase() : null;
  const normalizedPersonal = personalEmail ? String(personalEmail).trim().toLowerCase() : null;

  const gradYear =
    graduationYear === undefined || graduationYear === null
      ? null
      : Number.isInteger(graduationYear)
      ? graduationYear
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
      },
    });

    return res.status(201).json({ message: "Profile created", profile });
  } catch {
    return res.status(409).json({ message: "Email already exists on another profile" });
  }
}

/**
 * List alumni profiles with filtering
 * Admin/Faculty/Student
 */
export async function listProfiles(req, res) {
  const { program, year, skill, search } = req.query;

  const profiles = await prisma.alumniProfile.findMany({
    where: {
      program: program || undefined,
      graduationYear: year ? Number(year) : undefined,
      skills: skill ? { has: skill } : undefined,
      OR: search
        ? [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { company: { contains: search, mode: "insensitive" } },
            { jobTitle: { contains: search, mode: "insensitive" } }
          ]
        : undefined,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return res.json({ profiles });
}

/**
 * Get current user's profile
 * Alumni only
 */
export async function getMyProfile(req, res) {
  const userId = req.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { alumniProfileId: true },
  });

  if (!user?.alumniProfileId) {
    return res.status(404).json({ message: "No profile linked to this account" });
  }

  const profile = await prisma.alumniProfile.findUnique({
    where: { id: user.alumniProfileId },
  });

  if (!profile) return res.status(404).json({ message: "Profile not found" });

  return res.json({ profile });
}

/**
 * Update current user's profile
 * Alumni only
 */
export async function updateMyProfile(req, res) {
  const userId = req.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { alumniProfileId: true },
  });

  if (!user?.alumniProfileId) {
    return res.status(404).json({ message: "No profile linked to this account" });
  }

  const allowed = [
    "personalEmail",
    "jobTitle",
    "company",
    "skills",
    "program",
    "graduationYear",
    "firstName",
    "lastName",
  ];

  const updates = {};
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) {
      updates[key] = req.body[key];
    }
  }

  if (updates.personalEmail)
    updates.personalEmail = String(updates.personalEmail).trim().toLowerCase();

  if (updates.skills) {
    if (!Array.isArray(updates.skills)) {
      return res.status(400).json({ message: "skills must be an array of strings" });
    }
    updates.skills = updates.skills.map((s) => String(s));
  }

  if (updates.graduationYear !== undefined && updates.graduationYear !== null) {
    const y = Number.isInteger(updates.graduationYear)
      ? updates.graduationYear
      : parseInt(String(updates.graduationYear), 10);

    if (isNaN(y) || y < 1900 || y > 2100) {
      return res.status(400).json({ message: "graduationYear must be a valid year" });
    }

    updates.graduationYear = y;
  }

  try {
    const profile = await prisma.alumniProfile.update({
      where: { id: user.alumniProfileId },
      data: updates,
    });

    return res.json({ message: "Profile updated", profile });
  } catch {
    return res.status(409).json({ message: "Update failed (possible duplicate email)" });
  }
}

/**
 * Get a specific profile by ID
 * Admin/Faculty/Student
 */
export async function getProfileById(req, res) {
  const { id } = req.params;

  const profile = await prisma.alumniProfile.findUnique({ where: { id } });

  if (!profile) return res.status(404).json({ message: "Profile not found" });

  return res.json({ profile });
}
