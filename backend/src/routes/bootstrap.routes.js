import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../db/prisma.js";

const router = Router();

// POST /auth/bootstrap-admin
// One-time: only allowed if no admin exists yet
router.post("/bootstrap-admin", async (req, res) => {
  const { email, password, secret } = req.body || {};

  if (!email || !password || !secret) {
    return res.status(400).json({ message: "email, password, secret are required" });
  }

  if (!process.env.BOOTSTRAP_SECRET) {
    return res.status(500).json({ message: "BOOTSTRAP_SECRET not set on server" });
  }

  if (secret !== process.env.BOOTSTRAP_SECRET) {
    return res.status(403).json({ message: "Invalid bootstrap secret" });
  }

  // Block if any admin already exists
  const adminExists = await prisma.user.findFirst({
    where: { role: "admin" },
    select: { id: true },
  });

  if (adminExists) {
    return res.status(409).json({ message: "Admin already bootstrapped" });
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail }, select: { id: true } });
  if (existing) return res.status(409).json({ message: "Email already exists" });

  if (String(password).length < 10) {
    return res.status(400).json({ message: "Password must be at least 10 characters" });
  }

  const passwordHash = await bcrypt.hash(String(password), 10);

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      role: "admin",
    },
    select: { id: true, email: true, role: true },
  });

  return res.status(201).json({ message: "Admin created", user });
});

export default router;
