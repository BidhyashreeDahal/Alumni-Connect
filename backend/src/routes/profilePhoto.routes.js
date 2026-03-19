import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  getProfilePhoto,
  uploadMyProfilePhoto,
  uploadProfilePhoto
} from "../controllers/profilePhoto.controller.js";
import { profilePhotoParamsSchema } from "../validators/profilePhoto.validators.js";

const router = Router();

router.get(
  "/:profileType/:profileId",
  requireAuth,
  requireRole(["admin", "faculty", "alumni", "student"]),
  validate({ params: profilePhotoParamsSchema }),
  getProfilePhoto
);

router.post(
  "/me",
  requireAuth,
  requireRole(["alumni", "student"]),
  uploadProfilePhoto,
  uploadMyProfilePhoto
);

export default router;
