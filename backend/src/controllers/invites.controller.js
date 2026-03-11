import { prisma } from "../db/prisma.js";
import { generateRawToken, hashToken } from "../utils/inviteToken.js";

/**
 * Generate invite for Student or Alumni profile
 * Faculty/Admin only
 */
export async function createInvite(req, res) {
  const { profileId, type } = req.body;

  if (!profileId || !type) {
    return res.status(400).json({ message: "profileId and type are required" });
  }

  if (!["alumni", "student"].includes(type)) {
    return res.status(400).json({ message: "type must be alumni or student" });
  }

  let profile;

  try {
    // Find the profile
    if (type === "alumni") {
      profile = await prisma.alumniProfile.findUnique({
        where: { id: profileId }
      });
    } else {
      profile = await prisma.studentProfile.findUnique({
        where: { id: profileId }
      });
    }

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const email = profile.personalEmail || profile.schoolEmail;

    if (!email) {
      return res.status(400).json({ message: "Profile has no email to invite" });
    }

    // Check if this profile already has a user account
    let existingUser;

    if (type === "alumni") {
      existingUser = await prisma.user.findFirst({
        where: {
          alumniProfile: {
            id: profileId
          }
        },
        select: { id: true }
      });
    }

    if (type === "student") {
      existingUser = await prisma.user.findFirst({
        where: {
          studentProfile: {
            id: profileId
          }
        },
        select: { id: true }
      });
    }

    if (existingUser) {
      return res.status(409).json({ message: "Profile already claimed" });
    }

    // Generate invite token
    const rawToken = generateRawToken();
    const tokenHash = hashToken(rawToken);

    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    await prisma.inviteToken.create({
      data: {
        tokenHash,
        profileId,
        profileType: type,
        expiresAt
      }
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const inviteLink = `${frontendUrl}/claim?token=${rawToken}`;

    return res.status(201).json({
      message: "Invite created",
      inviteLink,
      expiresAt,
      sentTo: email,
      profileType: type
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create invite" });
  }
}