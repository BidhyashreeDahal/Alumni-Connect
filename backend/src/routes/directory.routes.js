import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { listDirectoryUsers } from "../controllers/directory.controller.js";

const router = Router();

/**
 * Unified Directory
 * Returns users based on role:
 * student -> alumni
 * alumni -> alumni + students
 * faculty/admin -> all
 */
router.get("/", requireAuth, listDirectoryUsers);

export default router;