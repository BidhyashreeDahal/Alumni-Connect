import express from "express";
import {
  uploadCSV,
  importAlumniProfiles,
  importStudentProfiles
} from "../controllers/import.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { bulkImportLimiter } from "../middleware/rateLimit.middleware.js";

const router = express.Router();

/*
  POST /bulk-import/alumni
  Import alumni profiles from CSV
*/
router.post(
  "/alumni",
  requireAuth,
  requireRole(["admin", "faculty"]),
  bulkImportLimiter,
  uploadCSV,
  importAlumniProfiles
);

/*
  POST /bulk-import/student
  Import student profiles from CSV
*/
router.post(
  "/student",
  requireAuth,
  requireRole(["admin", "faculty"]),
  bulkImportLimiter,
  uploadCSV,
  importStudentProfiles
);

export default router;