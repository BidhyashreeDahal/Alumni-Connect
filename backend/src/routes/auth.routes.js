import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../db/prisma.js";
import { hashToken } from "../utils/inviteToken.js";
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

// POST /auth/login
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

// GET /auth/me
router.get("/me", requireAuth, (req, res) => {
  return res.json({ id: req.user.id, email: req.user.email, role: req.user.role });
});

// POST /auth/logout
router.post("/logout", (req, res) => {
  clearAuthCookie(res);
  return res.json({ message: "Logged out" });
});



router.post("/claim", async (req, res) => {
  const { token, password } = req.body || {};

  if (!token || !password) {
    return res.status(400).json({ message: "token and password are required" });
  }

  if (String(password).length < 10) {
    return res.status(400).json({ message: "Password must be at least 10 characters" });
  }

  const tokenHash = hashToken(String(token));

  const invite = await prisma.inviteToken.findUnique({
    where: { tokenHash },
    include: { profile: true },
  });

  if (!invite) return res.status(400).json({ message: "Invalid token" });
  if (invite.usedAt) return res.status(400).json({ message: "Token already used" });
  if (invite.expiresAt < new Date()) return res.status(400).json({ message: "Token expired" });

  // If profile already has a linked user, block
  const existingUser = await prisma.user.findFirst({
    where: { alumniProfileId: invite.profileId },
    select: { id: true },
  });
  if (existingUser) return res.status(409).json({ message: "Profile already claimed" });

  // Choose login email priority: personalEmail first, else schoolEmail
  const email = (invite.profile.personalEmail || invite.profile.schoolEmail || "").toLowerCase();
  if (!email) return res.status(400).json({ message: "Profile has no email" });

  // Prevent duplicate User email
  const emailTaken = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (emailTaken) return res.status(409).json({ message: "An account with this email already exists" });

  const passwordHash = await bcrypt.hash(String(password), 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: "alumni",
      alumniProfileId: invite.profileId,
    },
    select: { id: true, email: true, role: true },
  });

  // Mark token used
  await prisma.inviteToken.update({
    where: { tokenHash },
    data: { usedAt: new Date() },
  });

  // Auto-login after claim
  const safeUser = { id: user.id, email: user.email, role: user.role };
  const jwtToken = jwt.sign(safeUser, process.env.JWT_SECRET, { expiresIn: "30m" });
  setAuthCookie(res, jwtToken);

  return res.status(201).json({ message: "Account created", user: safeUser });
});


export default router;
