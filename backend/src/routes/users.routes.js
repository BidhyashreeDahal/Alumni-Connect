import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createUser,
  listUsers,
  updateUserByAdmin
} from "../controllers/users.controller.js";
import {
  createUserBodySchema,
  listUsersQuerySchema,
  updateUserBodySchema,
  updateUserParamsSchema
} from "../validators/user.validators.js";

const router = Router();

/**
 * POST /users
 * Admin-only: create admin, faculty, or student accounts.
 * Alumni accounts are created via invite/claim.
 */
router.post("/", requireAuth, requireRole(["admin"]), validate({ body: createUserBodySchema }), createUser);

/**
 * GET /users
 * Admin-only: list all system users.
 */
router.get("/", requireAuth, requireRole(["admin"]), validate({ query: listUsersQuerySchema }), listUsers);

/**
 * PATCH /users/:id
 * Admin-only: manage role and active status.
 */
router.patch(
  "/:id",
  requireAuth,
  requireRole(["admin"]),
  validate({ params: updateUserParamsSchema, body: updateUserBodySchema }),
  updateUserByAdmin
);



export default router;
