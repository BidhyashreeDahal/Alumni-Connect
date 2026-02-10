import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../db/prisma.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

function setAuthCookie(res, token) {
  const cookieName = process.env.COOKIE_NAME || "ac_auth";
  res.cookie(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 30, // 30 minutes
  });
}

function clearAuthCookie(res) {
  const cookieName = process.env.COOKIE_NAME || "ac_auth";
  res.clearCookie(cookieName);
}

// 1) Alumni registration only
router.post("/register", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

  const normalizedEmail = String(email).trim().toLowerCase();

  // Basic password rule 
  if (String(password).length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters" });
  }

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) return res.status(409).json({ message: "Email already exists" });

  const passwordHash = await bcrypt.hash(String(password), 10);

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      role: "alumni", // IMPORTANT: users cannot choose admin/faculty
    },
    select: { id: true, email: true, role: true },
  });

  // Optional: auto-login after register
  const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "30m" });
  setAuthCookie(res, token);

  return res.status(201).json({ message: "Registered", user });
});

// 2) Login (all roles)
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

  const normalizedEmail = String(email).trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, email: true, role: true, passwordHash: true },
  });

  if (!user) return res.status(401).json({ message: "Invalid email or password" });

  const ok = await bcrypt.compare(String(password), user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid email or password" });

  const safeUser = { id: user.id, email: user.email, role: user.role };
  const token = jwt.sign(safeUser, process.env.JWT_SECRET, { expiresIn: "30m" });

  setAuthCookie(res, token);
  return res.json({ message: "Logged in", user: safeUser });
});

// 3) Who am I?
router.get("/me", requireAuth, async (req, res) => {
  return res.json({ id: req.user.id, email: req.user.email, role: req.user.role });
});

// 4) Logout
router.post("/logout", (req, res) => {
  clearAuthCookie(res);
  return res.json({ message: "Logged out" });
});

export default router;
