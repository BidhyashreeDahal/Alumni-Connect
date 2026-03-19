import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { getMySettings, updateMySettings } from "../controllers/settings.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { updateSettingsBodySchema } from "../validators/settings.validators.js";

const router = Router();

router.get(
  "/me",
  requireAuth,
  requireRole(["admin", "faculty", "alumni", "student"]),
  getMySettings
);

router.patch(
  "/me",
  requireAuth,
  requireRole(["admin", "faculty", "alumni", "student"]),
  validate({ body: updateSettingsBodySchema }),
  updateMySettings
);

export default router;
