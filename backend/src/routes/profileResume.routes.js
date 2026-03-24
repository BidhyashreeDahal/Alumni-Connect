import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  getProfileResume,
  getProfileResumeMeta,
  uploadMyProfileResume,
  uploadProfileResume
} from "../controllers/profileResume.controller.js";
import { profilePhotoParamsSchema } from "../validators/profilePhoto.validators.js";

const router = Router();

router.get(
  "/:profileType/:profileId/meta",
  requireAuth,
  requireRole(["admin", "faculty", "alumni", "student"]),
  validate({ params: profilePhotoParamsSchema }),
  getProfileResumeMeta
);

router.get(
  "/:profileType/:profileId",
  requireAuth,
  requireRole(["admin", "faculty", "alumni", "student"]),
  validate({ params: profilePhotoParamsSchema }),
  getProfileResume
);

router.post(
  "/me",
  requireAuth,
  requireRole(["alumni", "student"]),
  uploadProfileResume,
  uploadMyProfileResume
);

export default router;
