import fs from "fs";
import path from "path";
import multer from "multer";
import sharp from "sharp";
import { prisma } from "../db/prisma.js";
import { recordAuditLog } from "../services/auditLog.service.js";
import {
  buildCloudinaryDeliveryUrl,
  isCloudinaryEnabled,
  uploadImageBuffer
} from "../services/cloudinaryMedia.service.js";

const uploadsRoot = process.env.UPLOADS_DIR
  ? path.resolve(String(process.env.UPLOADS_DIR))
  : path.join(process.cwd(), "uploads");
const photoDir = path.join(uploadsRoot, "profile-photos");

if (!fs.existsSync(photoDir)) {
  fs.mkdirSync(photoDir, { recursive: true });
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype?.startsWith("image/")) {
      const error = new Error("Only image files are allowed");
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

const OUTPUT_SIZE = 512;
const OUTPUT_QUALITY = 86;
const MIN_INPUT_DIMENSION = OUTPUT_SIZE;

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

function getPhotoPublicId(profileType, profileId) {
  return `alumni-connect/profile-photos/${profileType}-${profileId}`;
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

  let processedBuffer;
  try {
    const image = sharp(req.file.buffer, { failOn: "none" });
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      return res.status(400).json({ message: "Invalid image file" });
    }

    if (metadata.width < MIN_INPUT_DIMENSION || metadata.height < MIN_INPUT_DIMENSION) {
      return res.status(400).json({
        message: `Image is too small. Minimum size is ${MIN_INPUT_DIMENSION}x${MIN_INPUT_DIMENSION}px`
      });
    }

    processedBuffer = await image
      .rotate()
      .resize(OUTPUT_SIZE, OUTPUT_SIZE, {
        fit: "cover",
        position: "centre",
        withoutEnlargement: true
      })
      .webp({
        quality: OUTPUT_QUALITY,
        effort: 4
      })
      .toBuffer();
  } catch {
    return res.status(400).json({ message: "Invalid or unsupported image file" });
  }

  if (isCloudinaryEnabled()) {
    await uploadImageBuffer({
      publicId: getPhotoPublicId(profileType, profileId),
      buffer: processedBuffer,
      format: "webp"
    });
  } else {
    const fileName = `${profileType}-${profileId}.webp`;
    deleteExistingProfilePhotos(profileType, profileId);
    fs.writeFileSync(path.join(photoDir, fileName), processedBuffer);
  }

  await recordAuditLog(req, {
    action: "profile_photo_uploaded",
    entityType: `${profileType}_profile`,
    entityId: profileId,
    summary: "Uploaded profile photo",
    metadata: {
      mimeType: req.file.mimetype,
      originalSize: req.file.size,
      outputSize: processedBuffer.length,
      outputFormat: "webp",
      outputDimensions: `${OUTPUT_SIZE}x${OUTPUT_SIZE}`
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

  if (isCloudinaryEnabled()) {
    const deliveryUrl = buildCloudinaryDeliveryUrl({
      publicId: getPhotoPublicId(profileType, profileId),
      resourceType: "image",
      format: "webp"
    });

    const cloudinaryRes = await fetch(deliveryUrl);
    if (!cloudinaryRes.ok) {
      return res.status(cloudinaryRes.status === 404 ? 404 : 502).json({
        message: cloudinaryRes.status === 404 ? "Photo not found" : "Failed to fetch photo"
      });
    }

    const bytes = Buffer.from(await cloudinaryRes.arrayBuffer());
    const contentType = cloudinaryRes.headers.get("content-type") || "image/webp";
    res.setHeader("Content-Type", contentType);
    return res.send(bytes);
  }

  const fileName = findPhotoFile(profileType, profileId);
  if (!fileName) {
    return res.status(404).json({ message: "Photo not found" });
  }

  return res.sendFile(path.join(photoDir, fileName));
}
