import express from "express";
import {
  createProfile,
  listProfiles,
  getMyProfile,
  updateMyProfile,
  getProfileById
} from "../controllers/alumni.controller.js";

import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

/*
------------------------------------------------
Alumni Profile Routes
------------------------------------------------
*/

/**
 * Create alumni profile
 * Faculty/Admin only
 */
router.post("/", requireAuth, requireRole(["admin", "faculty"]), createProfile);

/**
 * List alumni profiles
 * Public directory search
 */
router.get(
  "/",
  requireAuth,
  requireRole(["admin", "faculty", "alumni", "student"]),
  listProfiles
);

/**
 * Get current logged-in user's alumni profile
 */
router.get("/me", requireAuth, requireRole(["alumni"]), getMyProfile);

/**
 * Update current user's alumni profile
 */
router.put("/me", requireAuth, requireRole(["alumni"]), updateMyProfile);

/**
 * Get specific alumni profile by id
 */
router.get(
  "/:id",
  requireAuth,
  requireRole(["admin", "faculty", "alumni", "student"]),
  getProfileById
);

export default router;