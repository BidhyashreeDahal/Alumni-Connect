import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { generateRawToken, hashToken } from "../utils/inviteToken.js";

const router = Router();

/**
 * POST /profiles/:id/invite
 * Faculty/Admin: generate one-time invite token for an AlumniProfile.
 **/
router.post(
  "/profiles/:id/invite",
  requireAuth,
  requireRole(["admin", "faculty"]),
  async (req, res) => {
    const { id } = req.params;

    const profile = await prisma.alumniProfile.findUnique({ where: { id } });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    // Ensure there is an email target (invite should go somewhere)
    if (!profile.personalEmail && !profile.schoolEmail) {
      return res.status(400).json({ message: "Profile has no email to invite" });
    }

    // If profile is already claimed (user exists), block new invites
    const alreadyClaimed = await prisma.user.findFirst({
      where: { alumniProfileId: id },
      select: { id: true },
    });
    if (alreadyClaimed) {
      return res.status(409).json({ message: "Profile already claimed by an account" });
    }

    const rawToken = generateRawToken();
    const tokenHash = hashToken(rawToken);

    // 48 hours expiry (adjust if you want)
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    await prisma.inviteToken.create({
      data: {
        profileId: id,
        tokenHash,
        expiresAt,
      },
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const inviteLink = `${frontendUrl}/claim?token=${rawToken}`;

    return res.status(201).json({
      message: "Invite created",
      inviteLink, // For now we return the link instead of sending email
      expiresAt,
      sentTo: profile.personalEmail || profile.schoolEmail,
    });
  }
);

export default router;
