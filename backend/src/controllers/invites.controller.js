import { prisma } from "../db/prisma.js";
import { generateRawToken, hashToken } from "../utils/inviteToken.js";

async function createInviteForProfile(profileId, type) {
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

  return { inviteLink, expiresAt };
}

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

    if (profile.isArchived) {
      return res.status(400).json({ message: "Cannot invite archived profile" });
    }

    const { inviteLink, expiresAt } = await createInviteForProfile(profileId, type);

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

export async function reissueInvite(req, res) {
  const { profileId, type } = req.body || {};

  if (!profileId || !type) {
    return res.status(400).json({ message: "profileId and type are required" });
  }

  if (!["alumni", "student"].includes(type)) {
    return res.status(400).json({ message: "type must be alumni or student" });
  }

  await prisma.inviteToken.updateMany({
    where: {
      profileId,
      profileType: type,
      usedAt: null,
      expiresAt: { gt: new Date() }
    },
    data: { usedAt: new Date() }
  });

  const { inviteLink, expiresAt } = await createInviteForProfile(profileId, type);

  return res.status(201).json({
    message: "Invite reissued",
    inviteLink,
    expiresAt,
    profileId,
    profileType: type
  });
}

export async function listInviteStatuses(req, res) {
  const type = String(req.query.type || "").trim();
  const search = String(req.query.search || "").trim();

  const alumniWhere = {
    isArchived: false,
    OR: search
      ? [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { personalEmail: { contains: search, mode: "insensitive" } },
          { schoolEmail: { contains: search, mode: "insensitive" } }
        ]
      : undefined
  };

  const studentWhere = {
    isArchived: false,
    OR: search
      ? [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { user: { is: { email: { contains: search, mode: "insensitive" } } } }
        ]
      : undefined
  };

  const result = [];

  if (!type || type === "alumni") {
    const alumniProfiles = await prisma.alumniProfile.findMany({
      where: alumniWhere,
      include: {
        user: { select: { email: true } }
      },
      orderBy: [{ updatedAt: "desc" }]
    });

    for (const profile of alumniProfiles) {
      const latestInvite = await prisma.inviteToken.findFirst({
        where: { profileId: profile.id, profileType: "alumni" },
        orderBy: { createdAt: "desc" }
      });

      let status = "never_invited";
      if (profile.userId) {
        status = "claimed";
      } else if (latestInvite) {
        if (latestInvite.usedAt) status = "claimed";
        else if (latestInvite.expiresAt < new Date()) status = "expired";
        else status = "pending";
      }

      result.push({
        profileType: "alumni",
        profileId: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.personalEmail || profile.schoolEmail || null,
        status,
        lastInviteAt: latestInvite?.createdAt || null,
        expiresAt: latestInvite?.expiresAt || null
      });
    }
  }

  if (!type || type === "student") {
    const studentProfiles = await prisma.studentProfile.findMany({
      where: studentWhere,
      include: {
        user: { select: { email: true } }
      },
      orderBy: [{ updatedAt: "desc" }]
    });

    for (const profile of studentProfiles) {
      const latestInvite = await prisma.inviteToken.findFirst({
        where: { profileId: profile.id, profileType: "student" },
        orderBy: { createdAt: "desc" }
      });

      const status = profile.userId
        ? "claimed"
        : latestInvite
          ? latestInvite.usedAt
            ? "claimed"
            : latestInvite.expiresAt < new Date()
              ? "expired"
              : "pending"
          : "never_invited";

      result.push({
        profileType: "student",
        profileId: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.user?.email || null,
        status,
        lastInviteAt: latestInvite?.createdAt || null,
        expiresAt: latestInvite?.expiresAt || null
      });
    }
  }

  return res.json({ invites: result });
}