import { Router } from "express";
import {
  loginUser,
  logoutUser,
  getCurrentUser,
  claimAccount,
  changePassword
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  loginBodySchema,
  claimAccountBodySchema,
  changePasswordBodySchema
} from "../validators/auth.validators.js";

const router = Router();

/**
 * POST /auth/login
 */
router.post("/login", validate({ body: loginBodySchema }), loginUser);

/**
 * POST /auth/logout
 */
router.post("/logout", logoutUser);

/**
 * GET /auth/me
 */
router.get("/me", requireAuth, getCurrentUser);

/**
 * POST /auth/claim
 */
router.post("/claim", validate({ body: claimAccountBodySchema }), claimAccount);

/**
 * PATCH /auth/password
 */
router.patch("/password", requireAuth, validate({ body: changePasswordBodySchema }), changePassword);

export default router;