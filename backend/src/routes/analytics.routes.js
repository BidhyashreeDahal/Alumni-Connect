import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { getDashboard } from "../controllers/analytics.controller.js";

const router = Router();

/**
 * GET /analytics/dashboard
 * Faculty/Admin: program engagement insights
 */
router.get(
  "/dashboard",
  requireAuth,
  requireRole(["admin", "faculty"]),
  getDashboard
);

export default router;
