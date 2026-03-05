import { Router } from "express";
import { claimAccount } from "../controllers/auth.controller.js";

const router = Router();

/**
 * POST /auth/claim
 * Claim an account using an invite token
 */
router.post("/claim", claimAccount);

export default router;
