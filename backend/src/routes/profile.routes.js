import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { requireAuth , requireRole } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * POST /profiles
 * Faculty/Admin: create an AlumniProfile record (no login account created here).
 */
router.post("/", requireAuth, requireRole(["admin", "faculty"]), async (req, res) => {
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
  // Require at least one email so we can invite/claim later
  if (!schoolEmail && !personalEmail) {
    return res.status(400).json({ message: "Provide at least one of schoolEmail or personalEmail" });
  }
  // Normalize emails if present
  const normalizedSchool = schoolEmail ? String(schoolEmail).trim().toLowerCase() : null;
  const normalizedPersonal = personalEmail ? String(personalEmail).trim().toLowerCase() : null;

  // Basic Gradyear validation (not perfect, but just a sanity check)
  const gradYear =
    graduationYear === undefined || graduationYear === null
      ? null
      : Number.isInteger(graduationYear)
        ? graduationYear
        : parseInt(String(graduationYear), 10);

  if (gradYear !== null && (isNaN(gradYear) || gradYear < 1900 || gradYear > 2100)) {
    return res.status(400).json({ message: "graduationYear must be a valid year" });
  }

  // skills must be array of strings
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
  } catch (err) {
    // Handle unique constraint errors nicely
    return res.status(409).json({ message: "Email already exists on another profile" });
  }
});

/**
 * GET /profiles
 * Faculty/Admin: list profiles (simple first version).
 */
router.get("/", requireAuth, requireRole(["admin", "faculty"]), async (req, res) => {
  const profiles = await prisma.alumniProfile.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return res.json({ profiles });
});

/**
 * GET /profiles/:id
 * Faculty/Admin: view a profile.
 */
router.get("/:id", requireAuth, requireRole(["admin", "faculty"]), async (req, res) => {
  const { id } = req.params;

  const profile = await prisma.alumniProfile.findUnique({ where: { id } });
  if (!profile) return res.status(404).json({ message: "Profile not found" });

  return res.json({ profile });
});


// GET /profiles/me
// Alumni: fetch their own linked profile
router.get("/me", requireAuth, requireRole(["alumni"]), async (req, res) => {
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
});
// PATCH /profiles/me
// Alumni: update only their own profile (safe fields only)
router.patch("/me", requireAuth, requireRole(["alumni"]), async (req, res) => {
  const userId = req.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { alumniProfileId: true },
  });

  if (!user?.alumniProfileId) {
    return res.status(404).json({ message: "No profile linked to this account" });
  }

  // Allow-list fields alumni are allowed to change
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

  // Normalize email if included
  if (updates.personalEmail) updates.personalEmail = String(updates.personalEmail).trim().toLowerCase();

  // Normalize skills
  if (updates.skills) {
    if (!Array.isArray(updates.skills)) {
      return res.status(400).json({ message: "skills must be an array of strings" });
    }
    updates.skills = updates.skills.map((s) => String(s));
  }

  // Validate year if provided
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
  } catch (err) {
    return res.status(409).json({ message: "Update failed (possible duplicate email)" });
  }
});


export default router;