import express from "express";
import {
  createProfile,
  listProfiles,
  getMyProfile,
  updateMyProfile,
  getProfileById
} from "../controllers/alumni.controller.js";

import { requireAuth } from "../middleware/auth.middleware.js";

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
router.post("/", requireAuth, createProfile);

/**
 * List alumni profiles
 * Public directory search
 */
router.get("/", listProfiles);

/**
 * Get current logged-in user's alumni profile
 */
router.get("/me", requireAuth, getMyProfile);

/**
 * Update current user's alumni profile
 */
router.put("/me", requireAuth, updateMyProfile);

/**
 * Get specific alumni profile by id
 */
router.get("/:id", getProfileById);

export default router;