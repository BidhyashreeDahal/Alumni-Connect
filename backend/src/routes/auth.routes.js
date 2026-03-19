import { Router } from "express";
import {
  loginUser,
  logoutUser,
  getCurrentUser,
  claimAccount,
  changePassword
} from "../controllers/auth.controller.js";
import { getCsrfToken } from "../middleware/csrf.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  authClaimLimiter,
  authLoginLimiter,
  passwordChangeLimiter
} from "../middleware/rateLimit.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  loginBodySchema,
  claimAccountBodySchema,
  changePasswordBodySchema
} from "../validators/auth.validators.js";

const router = Router();

/**
 * GET /auth/csrf
 */
router.get("/csrf", getCsrfToken);

/**
 * POST /auth/login
 */
router.post("/login", authLoginLimiter, validate({ body: loginBodySchema }), loginUser);

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
router.post("/claim", authClaimLimiter, validate({ body: claimAccountBodySchema }), claimAccount);

/**
 * PATCH /auth/password
 */
router.patch("/password", requireAuth, passwordChangeLimiter, validate({ body: changePasswordBodySchema }), changePassword);

export default router;