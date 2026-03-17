import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../db/prisma.js";
import { hashToken } from "../utils/inviteToken.js";
import { setAuthCookie, clearAuthCookie } from "../utils/authCookie.js";

/**
 * POST /auth/login
 */
export async function loginUser(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, email: true, role: true, passwordHash: true, isActive: true }
  });

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const valid = await bcrypt.compare(String(password), user.passwordHash);

  if (!valid) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  if (!user.isActive) {
    return res.status(403).json({ message: "Account is disabled" });
  }

  const safeUser = {
    id: user.id,
    email: user.email,
    role: user.role
  };

  const token = jwt.sign(safeUser, process.env.JWT_SECRET, {
    expiresIn: "30m"
  });

  setAuthCookie(res, token);

  return res.json({
    message: "Logged in",
    user: safeUser
  });
}

/**
 * GET /auth/me
 */
export async function getCurrentUser(req, res) {
  const dbUser = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      alumniProfile: { select: { id: true } },
      studentProfile: { select: { id: true } }
    }
  });

  const profileType = dbUser?.alumniProfile
    ? "alumni"
    : dbUser?.studentProfile
      ? "student"
      : null;

  const profileId = dbUser?.alumniProfile?.id || dbUser?.studentProfile?.id || null;

  return res.json({
    id: req.user.id,
    email: req.user.email,
    role: req.user.role,
    profileType,
    profileId
  });
}

/**
 * POST /auth/logout
 */
export async function logoutUser(req, res) {
  clearAuthCookie(res);

  return res.json({
    message: "Logged out"
  });
}

/**
 * POST /auth/claim
 */
export async function claimAccount(req, res) {

  const { token, password } = req.body || {};

  if (!token || !password) {
    return res.status(400).json({ message: "token and password are required" });
  }

  if (String(password).length < 10) {
    return res.status(400).json({
      message: "Password must be at least 10 characters"
    });
  }

  const tokenHash = hashToken(String(token));

  const invite = await prisma.inviteToken.findUnique({
    where: { tokenHash }
  });

  if (!invite) {
    return res.status(400).json({ message: "Invalid token" });
  }

  if (invite.usedAt) {
    return res.status(400).json({ message: "Token already used" });
  }

  if (invite.expiresAt < new Date()) {
    return res.status(400).json({ message: "Token expired" });
  }

  let profile;
  let role;

  if (invite.profileType === "alumni") {

    profile = await prisma.alumniProfile.findUnique({
      where: { id: invite.profileId }
    });

    role = "alumni";

  } else if (invite.profileType === "student") {

    profile = await prisma.studentProfile.findUnique({
      where: { id: invite.profileId }
    });

    role = "student";

  } else {

    return res.status(400).json({ message: "Invalid profile type" });

  }

  if (!profile) {
    return res.status(404).json({ message: "Profile not found" });
  }

  /* ---------- IMPORTANT SAFETY CHECK ---------- */

  if (profile.userId) {
    return res.status(409).json({
      message: "Profile already claimed"
    });
  }

  /* ---------- EMAIL ---------- */

  const email = (profile.personalEmail || profile.schoolEmail || "").toLowerCase();

  if (!email) {
    return res.status(400).json({ message: "Profile has no email" });
  }

  const emailTaken = await prisma.user.findUnique({
    where: { email }
  });

  if (emailTaken) {
    return res.status(409).json({
      message: "An account with this email already exists"
    });
  }

  /* ---------- PASSWORD ---------- */

  const passwordHash = await bcrypt.hash(String(password), 10);

  let user;

  if (role === "alumni") {

    user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        isActive: true,
        alumniProfile: {
          connect: { id: invite.profileId }
        }
      },
      select: { id: true, email: true, role: true }
    });

  }

  if (role === "student") {

    user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        isActive: true,
        studentProfile: {
          connect: { id: invite.profileId }
        }
      },
      select: { id: true, email: true, role: true }
    });

  }

  /* ---------- MARK TOKEN USED ---------- */

  await prisma.inviteToken.update({
    where: { tokenHash },
    data: { usedAt: new Date() }
  });

  const safeUser = {
    id: user.id,
    email: user.email,
    role: user.role
  };

  const jwtToken = jwt.sign(safeUser, process.env.JWT_SECRET, {
    expiresIn: "30m"
  });

  setAuthCookie(res, jwtToken);

  return res.status(201).json({
    message: "Account created",
    user: safeUser
  });

}
/**
 * PATCH /auth/password
 */
export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body || {};

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      message: "currentPassword and newPassword are required"
    });
  }

  if (String(newPassword).length < 10) {
    return res.status(400).json({
      message: "New password must be at least 10 characters"
    });
  }

  if (String(currentPassword) === String(newPassword)) {
    return res.status(400).json({
      message: "New password must be different from current password"
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, passwordHash: true, isActive: true }
  });

  if (!user || !user.isActive) {
    return res.status(403).json({ message: "Account is disabled" });
  }

  const isCurrentValid = await bcrypt.compare(
    String(currentPassword),
    user.passwordHash
  );

  if (!isCurrentValid) {
    return res.status(401).json({ message: "Current password is incorrect" });
  }

  const passwordHash = await bcrypt.hash(String(newPassword), 10);

  await prisma.user.update({
    where: { id: req.user.id },
    data: { passwordHash }
  });

  return res.json({ message: "Password updated successfully" });
}