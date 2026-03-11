import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  listAlumni,
  listStudents
} from "../controllers/directory.controller.js";

const router = Router();

/**
 * Alumni directory
 */
router.get("/alumni", requireAuth, listAlumni);

/**
 * Student directory
 */
router.get("/students", requireAuth, listStudents);

export default router;