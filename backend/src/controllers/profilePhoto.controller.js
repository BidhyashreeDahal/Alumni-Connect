import fs from "fs";
import path from "path";
import multer from "multer";
import { prisma } from "../db/prisma.js";
import { recordAuditLog } from "../services/auditLog.service.js";

const photoDir = path.join(process.cwd(), "uploads", "profile-photos");

if (!fs.existsSync(photoDir)) {
  fs.mkdirSync(photoDir, { recursive: true });
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype?.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  }
});

function normalizeProfileType(value) {
  const t = String(value || "").toLowerCase();
  if (t === "alumni" || t === "student") return t;
  return null;
}

function getExtFromMime(mime, originalName) {
  if (mime === "image/jpeg") return ".jpg";
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  const ext = path.extname(String(originalName || "")).toLowerCase();
  return ext || ".jpg";
}

function deleteExistingProfilePhotos(profileType, profileId) {
  const prefix = `${profileType}-${profileId}`;
  const files = fs.readdirSync(photoDir);
  for (const file of files) {
    if (file.startsWith(prefix)) {
      try {
        fs.unlinkSync(path.join(photoDir, file));
      } catch {}
    }
  }
}

function findPhotoFile(profileType, profileId) {
  const prefix = `${profileType}-${profileId}`;
  const files = fs.readdirSync(photoDir);
  return files.find((file) => file.startsWith(prefix)) || null;
}

export const uploadProfilePhoto = upload.single("photo");

/**
 * POST /profile-photo/me
 * Student/Alumni only
 */
export async function uploadMyProfilePhoto(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "Photo file is required" });
  }

  if (!["student", "alumni"].includes(req.user.role)) {
    return res.status(403).json({ message: "Only student/alumni can upload profile photo" });
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

  const ext = getExtFromMime(req.file.mimetype, req.file.originalname);
  const fileName = `${profileType}-${profileId}${ext}`;

  deleteExistingProfilePhotos(profileType, profileId);
  fs.writeFileSync(path.join(photoDir, fileName), req.file.buffer);

  await recordAuditLog(req, {
    action: "profile_photo_uploaded",
    entityType: `${profileType}_profile`,
    entityId: profileId,
    summary: "Uploaded profile photo",
    metadata: {
      mimeType: req.file.mimetype,
      size: req.file.size
    }
  });

  return res.json({
    message: "Profile photo uploaded",
    photoUrl: `/profile-photo/${profileType}/${profileId}?v=${Date.now()}`
  });
}

/**
 * GET /profile-photo/:profileType/:profileId
 * Authenticated users can fetch profile photos for directory/profile viewing.
 */
export async function getProfilePhoto(req, res) {
  const profileType = normalizeProfileType(req.params.profileType);
  const profileId = req.params.profileId;

  if (!profileType || !profileId) {
    return res.status(400).json({ message: "Invalid photo path" });
  }

  const fileName = findPhotoFile(profileType, profileId);
  if (!fileName) {
    return res.status(404).json({ message: "Photo not found" });
  }

  return res.sendFile(path.join(photoDir, fileName));
}
