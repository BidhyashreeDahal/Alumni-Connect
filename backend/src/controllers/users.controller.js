import bcrypt from "bcryptjs";
import { prisma } from "../db/prisma.js";

/**
 * Create a new user (admin, faculty, or student)
 * Admin-only endpoint
 */
export async function createUser(req, res) {
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
        isActive: true,
      },
      select: { id: true, email: true, role: true, createdAt: true },
    });

    // If the user is a student, create StudentProfile automatically
    if (role === "student") {
      await prisma.studentProfile.create({
        data: {
          userId: user.id,
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

  }
  catch (err) {
  console.error(err);
  return res.status(500).json({ message: err.message });
}
}

export async function listUsers(req, res) {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: { createdAt: "desc" }
  });

  return res.json({ users });
}

export async function updateUserByAdmin(req, res) {
  const { id } = req.params;
  const { role, isActive } = req.body || {};

  const updates = {};
  if (role !== undefined) {
    const allowedRoles = ["admin", "faculty", "alumni", "student"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "role must be one of admin, faculty, alumni, student"
      });
    }
    updates.role = role;
  }

  if (isActive !== undefined) {
    if (typeof isActive !== "boolean") {
      return res.status(400).json({ message: "isActive must be boolean" });
    }
    updates.isActive = isActive;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: "No valid updates provided" });
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: updates,
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true
      }
    });

    return res.json({
      message: "User updated",
      user
    });
  } catch {
    return res.status(404).json({ message: "User not found" });
  }
}
