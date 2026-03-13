import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import {
  createUser,
  listUsers,
  updateUserByAdmin
} from "../controllers/users.controller.js";

const router = Router();

/**
 * POST /users
 * Admin-only: create admin, faculty, or student accounts.
 * Alumni accounts are created via invite/claim.
 */
router.post("/", requireAuth, requireRole(["admin"]), createUser);

/**
 * GET /users
 * Admin-only: list all system users.
 */
router.get("/", requireAuth, requireRole(["admin"]), listUsers);

/**
 * PATCH /users/:id
 * Admin-only: manage role and active status.
 */
router.patch("/:id", requireAuth, requireRole(["admin"]), updateUserByAdmin);



export default router;
