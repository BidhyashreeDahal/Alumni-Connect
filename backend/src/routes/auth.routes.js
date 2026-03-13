import { Router } from "express";
import {
  loginUser,
  logoutUser,
  getCurrentUser,
  claimAccount,
  changePassword
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * POST /auth/login
 */
router.post("/login", loginUser);

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
router.post("/claim", claimAccount);

/**
 * PATCH /auth/password
 */
router.patch("/password", requireAuth, changePassword);

export default router;