import { Router } from "express";
import {
  loginUser,
  logoutUser,
  getCurrentUser,
  claimAccount
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

export default router;