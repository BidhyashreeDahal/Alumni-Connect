import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { listAuditLogs } from "../controllers/auditLog.controller.js";
import { listAuditLogsQuerySchema } from "../validators/auditLog.validators.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  requireRole(["admin"]),
  validate({ query: listAuditLogsQuerySchema }),
  listAuditLogs
);

export default router;
