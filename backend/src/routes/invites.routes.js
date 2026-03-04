import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { generateRawToken, hashToken } from "../utils/inviteToken.js";

const router = Router();

/**
 * POST /invites
 * Faculty/Admin generate invite for Student or Alumni profile
 *
 * body:
 * {
 *   profileId: "...",
 *   type: "alumni" | "student"
 * }
 */
router.post(
  "/invites",
  requireAuth,
  requireRole(["admin", "faculty"]),
  async (req, res) => {
    const { profileId, type } = req.body;

    if (!profileId || !type) {
      return res.status(400).json({ message: "profileId and type are required" });
    }

    if (!["alumni", "student"].includes(type)) {
      return res.status(400).json({ message: "type must be alumni or student" });
    }

    let profile;

    if (type === "alumni") {
      profile = await prisma.alumniProfile.findUnique({
        where: { id: profileId },
      });
    } else {
      profile = await prisma.studentProfile.findUnique({
        where: { id: profileId },
      });
    }

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const email = profile.personalEmail || profile.schoolEmail;

    if (!email) {
      return res.status(400).json({ message: "Profile has no email to invite" });
    }

    // Check if already claimed
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { alumniProfileId: type === "alumni" ? profileId : undefined },
          { studentProfileId: type === "student" ? profileId : undefined },
        ],
      },
      select: { id: true },
    });

    if (existingUser) {
      return res.status(409).json({ message: "Profile already claimed" });
    }

    const rawToken = generateRawToken();
    const tokenHash = hashToken(rawToken);

    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    await prisma.inviteToken.create({
      data: {
        tokenHash,
        profileId,
        profileType: type,
        expiresAt,
      },
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const inviteLink = `${frontendUrl}/claim?token=${rawToken}`;

    return res.status(201).json({
      message: "Invite created",
      inviteLink,
      expiresAt,
      sentTo: email,
      profileType: type,
    });
  }
);

export default router;