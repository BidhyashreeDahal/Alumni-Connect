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

    return res.status(201).json({ message: "Profile created", profile });
  } catch {
    return res.status(409).json({ message: "Email already exists on another profile" });
  }
}

/**
 * List alumni profiles with filtering
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
            { jobTitle: { contains: search, mode: "insensitive" } },
          ]
        : undefined,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return res.json({ profiles });
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

  return res.json({ profile: user.alumniProfile });
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

  const allowed = [
    "personalEmail",
    "jobTitle",
    "company",
    "skills",
    "program",
    "graduationYear",
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
  });

  if (!profile) {
    return res.status(404).json({ message: "Profile not found" });
  }

  return res.json({ profile });
}