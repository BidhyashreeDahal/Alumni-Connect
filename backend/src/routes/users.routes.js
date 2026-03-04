import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../db/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * POST /users
 * Admin-only: create admin, faculty, or student accounts.
 * Alumni accounts are created via invite/claim.
 */
router.post("/", requireAuth, requireRole(["admin"]), async (req, res) => {
  const { email, password, role, firstName, lastName, program, graduationYear } = req.body || {};

  if (!email || !password || !role) {
    return res.status(400).json({ message: "email, password, role are required" });
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  // Allowed roles
  const allowedRoles = ["admin", "faculty", "student"];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: "role must be admin, faculty, or student" });
  }

  if (String(password).length < 10) {
    return res.status(400).json({ message: "Password must be at least 10 characters" });
  }

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  if (existing) {
    return res.status(409).json({ message: "Email already exists" });
  }

  const passwordHash = await bcrypt.hash(String(password), 10);

  try {
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        role,
      },
      select: { id: true, email: true, role: true, createdAt: true },
    });

    // If the user is a student, create StudentProfile automatically
    if (role === "student") {
      await prisma.studentProfile.create({
        data: {
          userId: user.id,
          schoolEmail: normalizedEmail,
          firstName: firstName ? String(firstName).trim() : null,
          lastName: lastName ? String(lastName).trim() : null,
          program: program ? String(program).trim() : null,
          graduationYear: graduationYear ? Number(graduationYear) : null,
        },
      });
    }

    return res.status(201).json({
      message: "User created",
      user,
    });

  } catch (err) {
    return res.status(500).json({ message: "Failed to create user" });
  }
});

export default router;