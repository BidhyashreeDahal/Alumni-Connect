import fs from "fs";
import path from "path";
import multer from "multer";
import { prisma } from "../db/prisma.js";
import { recordAuditLog } from "../services/auditLog.service.js";
import {
  buildCloudinaryDeliveryUrl,
  cloudinaryResourceExists,
  isCloudinaryEnabled,
  uploadRawBuffer
} from "../services/cloudinaryMedia.service.js";

const uploadsRoot = process.env.UPLOADS_DIR
  ? path.resolve(String(process.env.UPLOADS_DIR))
  : path.join(process.cwd(), "uploads");
const resumeDir = path.join(uploadsRoot, "profile-resumes");

if (!fs.existsSync(resumeDir)) {
  fs.mkdirSync(resumeDir, { recursive: true });
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const isPdfMime = file.mimetype === "application/pdf";
    const isPdfName = String(file.originalname || "").toLowerCase().endsWith(".pdf");
    if (!isPdfMime && !isPdfName) {
      const error = new Error("Only PDF resume files are allowed");
      error.statusCode = 400;
      error.code = "BAD_REQUEST";
      return cb(error);
    }
    cb(null, true);
  }
});

function normalizeProfileType(value) {
  const t = String(value || "").toLowerCase();
  if (t === "alumni" || t === "student") return t;
  return null;
}

function getResumeFileName(profileType, profileId) {
  return `${profileType}-${profileId}.pdf`;
}

function getResumePublicId(profileType, profileId) {
  return `alumni-connect/profile-resumes/${profileType}-${profileId}.pdf`;
}

function getResumePath(profileType, profileId) {
  return path.join(resumeDir, getResumeFileName(profileType, profileId));
}

async function resolveProfileOwner(profileType, profileId) {
  if (profileType === "alumni") {
    const profile = await prisma.alumniProfile.findUnique({
      where: { id: profileId },
      select: { id: true, userId: true }
    });
    return profile;
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { id: profileId },
    select: { id: true, userId: true }
  });
  return profile;
}

function canViewResume({ profileType, profileOwnerUserId, requester }) {
  const isOwner = Boolean(profileOwnerUserId && profileOwnerUserId === requester.id);
  const isAdminOrFaculty = requester.role === "admin" || requester.role === "faculty";
  const isStudent = requester.role === "student";

  if (profileType === "student") {
    // Student resume is private to owner and staff.
    return isOwner || isAdminOrFaculty;
  }

  // Alumni resume can be viewed by owner, students, and staff (not other alumni).
  return isOwner || isStudent || isAdminOrFaculty;
}

export const uploadProfileResume = upload.single("resume");

/**
 * POST /profile-resume/me
 * Student/Alumni only
 */
export async function uploadMyProfileResume(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "Resume file is required" });
  }

  if (!["student", "alumni"].includes(req.user.role)) {
    return res.status(403).json({ message: "Only student/alumni can upload resume" });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      alumniProfile: { select: { id: true } },
      studentProfile: { select: { id: true } }
    }
  });

  const profileType = req.user.role;
  const profileId =
    profileType === "alumni"
      ? dbUser?.alumniProfile?.id
      : dbUser?.studentProfile?.id;

  if (!profileId) {
    return res.status(404).json({ message: "Linked profile not found" });
  }

  if (isCloudinaryEnabled()) {
    await uploadRawBuffer({
      publicId: getResumePublicId(profileType, profileId),
      buffer: req.file.buffer
    });
  } else {
    const filePath = getResumePath(profileType, profileId);
    fs.writeFileSync(filePath, req.file.buffer);
  }

  await recordAuditLog(req, {
    action: "profile_resume_uploaded",
    entityType: `${profileType}_profile`,
    entityId: profileId,
    summary: "Uploaded profile resume",
    metadata: {
      mimeType: req.file.mimetype,
      size: req.file.size
    }
  });

  return res.json({
    message: "Profile resume uploaded",
    resumeUrl: `/profile-resume/${profileType}/${profileId}?v=${Date.now()}`
  });
}

/**
 * GET /profile-resume/:profileType/:profileId/meta
 */
export async function getProfileResumeMeta(req, res) {
  const profileType = normalizeProfileType(req.params.profileType);
  const profileId = req.params.profileId;

  if (!profileType || !profileId) {
    return res.status(400).json({ message: "Invalid resume path" });
  }

  const profile = await resolveProfileOwner(profileType, profileId);
  if (!profile) {
    return res.status(404).json({ message: "Profile not found" });
  }

  if (!canViewResume({ profileType, profileOwnerUserId: profile.userId, requester: req.user })) {
    return res.status(403).json({ message: "Not authorized to view this resume" });
  }

  const available = isCloudinaryEnabled()
    ? await cloudinaryResourceExists({
        publicId: getResumePublicId(profileType, profileId),
        resourceType: "raw"
      })
    : fs.existsSync(getResumePath(profileType, profileId));

  return res.json({
    available
  });
}

/**
 * GET /profile-resume/:profileType/:profileId
 */
export async function getProfileResume(req, res) {
  const profileType = normalizeProfileType(req.params.profileType);
  const profileId = req.params.profileId;

  if (!profileType || !profileId) {
    return res.status(400).json({ message: "Invalid resume path" });
  }

  const profile = await resolveProfileOwner(profileType, profileId);
  if (!profile) {
    return res.status(404).json({ message: "Profile not found" });
  }

  if (!canViewResume({ profileType, profileOwnerUserId: profile.userId, requester: req.user })) {
    return res.status(403).json({ message: "Not authorized to view this resume" });
  }

  if (isCloudinaryEnabled()) {
    const deliveryUrl = buildCloudinaryDeliveryUrl({
      publicId: getResumePublicId(profileType, profileId),
      resourceType: "raw"
    });

    const cloudinaryRes = await fetch(deliveryUrl);
    if (!cloudinaryRes.ok) {
      return res.status(cloudinaryRes.status === 404 ? 404 : 502).json({
        message: cloudinaryRes.status === 404 ? "Resume not found" : "Failed to fetch resume"
      });
    }

    const bytes = Buffer.from(await cloudinaryRes.arrayBuffer());
    const contentType = cloudinaryRes.headers.get("content-type") || "application/pdf";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", "inline");
    return res.send(bytes);
  }

  const filePath = getResumePath(profileType, profileId);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "Resume not found" });
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "inline");
  return res.sendFile(filePath);
}
