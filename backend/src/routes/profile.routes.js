import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { getProfileById } from "../controllers/profile.controller.js";

const router = Router();

router.get(
  "/:id",
  requireAuth,
  requireRole(["admin", "faculty", "alumni", "student"]),
  getProfileById
);

export default router;