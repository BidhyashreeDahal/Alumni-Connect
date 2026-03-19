import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { listDirectoryUsers } from "../controllers/directory.controller.js";
import { listDirectoryQuerySchema } from "../validators/directory.validators.js";

const router = Router();

/**
 * Unified Directory
 * Returns users based on role:
 * student -> alumni
 * alumni -> alumni + students
 * faculty/admin -> all
 */
router.get("/", requireAuth, validate({ query: listDirectoryQuerySchema }), listDirectoryUsers);

export default router;