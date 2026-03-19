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

  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || "15", 10), 1), 100);

  const skip = (page - 1) * pageSize;

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
          { personalEmail: { contains: search, mode: "insensitive" } },
          { schoolEmail: { contains: search, mode: "insensitive" } },
          { user: { is: { email: { contains: search, mode: "insensitive" } } } }
        ]
      : undefined
  };

  function deriveStatus(profile, latestInvite) {
    if (profile.userId) return "claimed";
    if (!latestInvite) return "never_invited";
    if (latestInvite.usedAt) return "claimed";
    if (latestInvite.expiresAt < new Date()) return "expired";
    return "pending";
  }

  function mapInvite(profileType, profile, latestInvite) {
    return {
      profileType,
      profileId: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email:
        profileType === "alumni"
          ? profile.personalEmail || profile.schoolEmail || null
          : profile.schoolEmail || profile.personalEmail || profile.user?.email || null,
      status: deriveStatus(profile, latestInvite),
      lastInviteAt: latestInvite?.createdAt || null,
      expiresAt: latestInvite?.expiresAt || null,
      updatedAt: profile.updatedAt
    };
  }

  function sortInvites(a, b) {
    const aInviteTime = a.lastInviteAt ? new Date(a.lastInviteAt).getTime() : 0;
    const bInviteTime = b.lastInviteAt ? new Date(b.lastInviteAt).getTime() : 0;

    if (bInviteTime !== aInviteTime) {
      return bInviteTime - aInviteTime;
    }

    const aUpdatedTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const bUpdatedTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;

    if (bUpdatedTime !== aUpdatedTime) {
      return bUpdatedTime - aUpdatedTime;
    }

    const aName = `${a.lastName || ""} ${a.firstName || ""}`.trim().toLowerCase();
    const bName = `${b.lastName || ""} ${b.firstName || ""}`.trim().toLowerCase();

    return aName.localeCompare(bName);
  }

  async function getLatestInviteMap(profileIds, profileType) {
    if (!profileIds.length) return new Map();

    const tokens = await prisma.inviteToken.findMany({
      where: {
        profileType,
        profileId: { in: profileIds }
      },
      orderBy: [{ createdAt: "desc" }]
    });

    const latestInviteByProfile = new Map();
    for (const token of tokens) {
      if (!latestInviteByProfile.has(token.profileId)) {
        latestInviteByProfile.set(token.profileId, token);
      }
    }

    return latestInviteByProfile;
  }

  if (!type) {
    const [alumniProfiles, studentProfiles] = await Promise.all([
      prisma.alumniProfile.findMany({
        where: alumniWhere,
        include: { user: { select: { email: true } } },
        orderBy: [{ updatedAt: "desc" }, { lastName: "asc" }, { firstName: "asc" }]
      }),
      prisma.studentProfile.findMany({
        where: studentWhere,
        include: { user: { select: { email: true } } },
        orderBy: [{ updatedAt: "desc" }, { lastName: "asc" }, { firstName: "asc" }]
      })
    ]);

    const [latestAlumniInvites, latestStudentInvites] = await Promise.all([
      getLatestInviteMap(alumniProfiles.map((profile) => profile.id), "alumni"),
      getLatestInviteMap(studentProfiles.map((profile) => profile.id), "student")
    ]);

    const combined = [
      ...alumniProfiles.map((profile) =>
        mapInvite("alumni", profile, latestAlumniInvites.get(profile.id))
      ),
      ...studentProfiles.map((profile) =>
        mapInvite("student", profile, latestStudentInvites.get(profile.id))
      )
    ].sort(sortInvites);

    const total = combined.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return res.json({
      invites: combined.slice(skip, skip + pageSize).map(({ updatedAt, ...rest }) => rest),
      meta: {
        page,
        pageSize,
        total,
        totalPages
      }
    });
  }

  if (type === "alumni") {
    const [profiles, total] = await Promise.all([
      prisma.alumniProfile.findMany({
        where: alumniWhere,
        include: { user: { select: { email: true } } },
        orderBy: [{ updatedAt: "desc" }, { lastName: "asc" }, { firstName: "asc" }],
        skip,
        take: pageSize
      }),
      prisma.alumniProfile.count({ where: alumniWhere })
    ]);

    const latestInvites = await getLatestInviteMap(
      profiles.map((profile) => profile.id),
      "alumni"
    );

    return res.json({
      invites: profiles.map((profile) => {
        const { updatedAt, ...rest } = mapInvite("alumni", profile, latestInvites.get(profile.id));
        return rest;
      }),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize))
      }
    });
  }

  if (type === "student") {
    const [profiles, total] = await Promise.all([
      prisma.studentProfile.findMany({
        where: studentWhere,
        include: { user: { select: { email: true } } },
        orderBy: [{ updatedAt: "desc" }, { lastName: "asc" }, { firstName: "asc" }],
        skip,
        take: pageSize
      }),
      prisma.studentProfile.count({ where: studentWhere })
    ]);

    const latestInvites = await getLatestInviteMap(
      profiles.map((profile) => profile.id),
      "student"
    );

    return res.json({
      invites: profiles.map((profile) => {
        const { updatedAt, ...rest } = mapInvite("student", profile, latestInvites.get(profile.id));
        return rest;
      }),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize))
      }
    });
  }

  return res.status(400).json({ message: "type must be alumni or student when provided" });

}