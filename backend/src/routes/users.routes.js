import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { createUser } from "../controllers/users.controller.js";

const router = Router();

/**
 * POST /users
 * Admin-only: create admin, faculty, or student accounts.
 * Alumni accounts are created via invite/claim.
 */
router.post("/", requireAuth, requireRole(["admin"]), createUser);



export default router;
