import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import {
  createProfile,
  listProfiles,
  getMyProfile,
  updateMyProfile,
  getProfileById,
} from "../controllers/profile.controller.js";

const router = Router();

/**
 * POST /profiles
 * Faculty/Admin: create an AlumniProfile record (no login account created here).
 */
router.post("/", requireAuth, requireRole(["admin", "faculty"]), createProfile);

/**
 * GET /profiles
 * Admin/Faculty/Student: list alumni profiles
 * Supports filtering
 */
router.get("/", requireAuth, requireRole(["admin", "faculty", "student"]), listProfiles);

/**
 * GET /profiles/me
 * Alumni: fetch their own linked profile
 */
router.get("/me", requireAuth, requireRole(["alumni"]), getMyProfile);

/**
 * PATCH /profiles/me
 * Alumni: update their own profile
 */
router.patch("/me", requireAuth, requireRole(["alumni"]), updateMyProfile);

/**
 * GET /profiles/:id
 * Admin/Faculty/Student: view a profile
 */
router.get("/:id", requireAuth, requireRole(["admin", "faculty", "student"]), getProfileById);

export default router;
