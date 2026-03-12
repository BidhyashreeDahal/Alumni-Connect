import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { getProfileById } from "../controllers/profile.controller.js";

const router = Router();

router.get("/:id", requireAuth, getProfileById);

export default router;