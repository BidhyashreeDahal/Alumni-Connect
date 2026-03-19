import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { getProfileById } from "../controllers/profile.controller.js";
import { profileIdParamsSchema } from "../validators/profile.validators.js";

const router = Router();

router.get(
  "/:id",
  requireAuth,
  requireRole(["admin", "faculty", "alumni", "student"]),
  validate({ params: profileIdParamsSchema }),
  getProfileById
);

export default router;