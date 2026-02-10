import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../db/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * POST /users
 * Admin-only: create faculty/admin accounts.
 * Alumni accounts are NOT created here (those come from invite/claim in Phase 6).
 */
router.post("/", requireAuth, requireRole(["admin"]), async (req, res) => {
  const { email, password, role } = req.body || {};

  if (!email || !password || !role) {
    return res.status(400).json({ message: "email, password, role are required" });
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  // Only allow staff roles here
  const allowedRoles = ["admin", "faculty"];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: "role must be admin or faculty" });
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

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      role, // admin or faculty
    },
    select: { id: true, email: true, role: true, createdAt: true },
  });

  return res.status(201).json({ message: "User created", user });
});

export default router;
