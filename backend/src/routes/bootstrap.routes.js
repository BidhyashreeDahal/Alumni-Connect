import { Router } from "express";
import { bootstrapAdmin } from "../controllers/bootstrap.controller.js";
import { bootstrapLimiter } from "../middleware/rateLimit.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { bootstrapAdminBodySchema } from "../validators/bootstrap.validators.js";

const router = Router();

/**
 * POST /auth/bootstrap-admin
 * One-time: only allowed if no admin exists yet
 */
router.post("/bootstrap-admin", bootstrapLimiter, validate({ body: bootstrapAdminBodySchema }), bootstrapAdmin);

export default router;
