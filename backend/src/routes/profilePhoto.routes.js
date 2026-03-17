import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import {
  getProfilePhoto,
  uploadMyProfilePhoto,
  uploadProfilePhoto
} from "../controllers/profilePhoto.controller.js";

const router = Router();

router.get(
  "/:profileType/:profileId",
  requireAuth,
  requireRole(["admin", "faculty", "alumni", "student"]),
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
