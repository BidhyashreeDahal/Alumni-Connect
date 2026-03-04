import { Router } from "express";
import { bootstrapAdmin } from "../controllers/bootstrap.controller.js";

const router = Router();

/**
 * POST /auth/bootstrap-admin
 * One-time: only allowed if no admin exists yet
 */
router.post("/bootstrap-admin", bootstrapAdmin);

export default router;
