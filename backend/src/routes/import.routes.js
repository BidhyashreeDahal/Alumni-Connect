import express from "express";
import {
  uploadCSV,
  importAlumniProfiles,
  importStudentProfiles
} from "../controllers/import.controller.js";

const router = express.Router();

/*
  POST /bulk-import/alumni
  Import alumni profiles from CSV
*/
router.post(
  "/alumni",
  uploadCSV,
  importAlumniProfiles
);

/*
  POST /bulk-import/student
  Import student profiles from CSV
*/
router.post(
  "/student",
  uploadCSV,
  importStudentProfiles
);

export default router;