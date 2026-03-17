import fs from "fs";
import path from "path";
import multer from "multer";
import csv from "csv-parser";
import { prisma } from "../db/prisma.js";

/* ---------------- MULTER SETUP ---------------- */

const uploadDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
    cb(null, safeName);
  }
});

function csvFileFilter(_req, file, cb) {
  if (
    file.mimetype === "text/csv" ||
    file.originalname.toLowerCase().endsWith(".csv")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only CSV files are allowed"));
  }
}

export const uploadCSV = multer({
  storage,
  fileFilter: csvFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
}).single("file");

/* ---------------- COLUMN ALIASES ---------------- */

const columnAliases = {
  firstname: "firstName",
  lastname: "lastName",

  email: "personalEmail",
  personalemail: "personalEmail",
  schoolemail: "schoolEmail",

  program: "program",

  graduationyear: "graduationYear",
  gradyear: "graduationYear",

  company: "company",
  jobtitle: "jobTitle",

  skills: "skills",

  linkedin: "linkedinUrl",
  linkedinurl: "linkedinUrl",

  meetinglink: "meetingLink",
  calendly: "meetingLink"
};

/* ---------------- NORMALIZATION ---------------- */

function normalizeHeader(header) {
  return String(header || "")
    .trim()
    .replace(/\uFEFF/g, "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/_/g, "")
    .replace(/-/g, "");
}

function normalizeRow(row) {
  const normalized = {};

  for (const key in row) {
    const cleanedKey = normalizeHeader(key);
    const mappedKey = columnAliases[cleanedKey];

    if (!mappedKey) continue;

    normalized[mappedKey] =
      typeof row[key] === "string"
        ? row[key].trim()
        : row[key];
  }

  return normalized;
}

/* ---------------- HELPERS ---------------- */

function parseSkills(value) {
  if (!value) return [];

  return String(value)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseGraduationYear(value) {
  if (!value) return null;

  const year = parseInt(String(value).trim(), 10);

  if (isNaN(year) || year < 1900 || year > 2100) {
    return { error: "Invalid graduation year" };
  }

  return { value: year };
}

function getEmails(row) {
  const personalEmail = row.personalEmail
    ? row.personalEmail.toLowerCase()
    : null;

  const schoolEmail = row.schoolEmail
    ? row.schoolEmail.toLowerCase()
    : null;

  return {
    personalEmail,
    schoolEmail,
    anyEmail: personalEmail || schoolEmail
  };
}

async function cleanupFile(filePath) {
  if (!filePath) return;

  try {
    await fs.promises.unlink(filePath);
  } catch {}
}

/* =====================================================
   ALUMNI IMPORT
===================================================== */

export async function importAlumniProfiles(req, res) {

  if (!req.file) {
    return res.status(400).json({ message: "CSV file is required" });
  }

  const filePath = req.file.path;
  const rows = [];

  try {

    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => rows.push(data))
        .on("end", resolve)
        .on("error", reject);
    });

    const created = [];
    const skipped = [];
    const fileEmails = new Set();

    for (let i = 0; i < rows.length; i++) {

      const rowNumber = i + 2;
      const rawRow = rows[i];
      const row = normalizeRow(rawRow);

      try {

        const { personalEmail, schoolEmail, anyEmail } = getEmails(row);

        if (!anyEmail) {
          skipped.push({ row: rowNumber, reason: "Missing email" });
          continue;
        }

        if (fileEmails.has(anyEmail)) {
          skipped.push({ row: rowNumber, reason: "Duplicate email in file" });
          continue;
        }

        fileEmails.add(anyEmail);

        const gradYear = parseGraduationYear(row.graduationYear);

        const profile = await prisma.alumniProfile.create({
          data: {
            firstName: row.firstName || null,
            lastName: row.lastName || null,
            personalEmail,
            schoolEmail,
            program: row.program || null,
            graduationYear: gradYear?.value ?? null,
            company: row.company || null,
            jobTitle: row.jobTitle || null,
            skills: parseSkills(row.skills),
            linkedinUrl: row.linkedinUrl || null,
            meetingLink: row.meetingLink || null
          }
        });

        created.push(profile);

      } catch (err) {

        skipped.push({
          row: rowNumber,
          reason: err.message || "Row error"
        });

      }

    }

    await cleanupFile(filePath);

    return res.json({
      message: "Import complete",
      summary: {
        totalRows: rows.length,
        created: created.length,
        skipped: skipped.length
      },
      created,
      skipped
    });

  } catch (err) {

    await cleanupFile(filePath);

    return res.status(500).json({
      message: "Failed to import CSV"
    });

  }
}

/* =====================================================
   STUDENT IMPORT
===================================================== */

export async function importStudentProfiles(req, res) {

  if (!req.file) {
    return res.status(400).json({ message: "CSV file is required" });
  }

  const filePath = req.file.path;
  const rows = [];

  try {

    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => rows.push(data))
        .on("end", resolve)
        .on("error", reject);
    });

    const created = [];
    const skipped = [];
    const fileEmails = new Set();

    for (let i = 0; i < rows.length; i++) {

      const rowNumber = i + 2;
      const rawRow = rows[i];
      const row = normalizeRow(rawRow);

      try {

        const { personalEmail, schoolEmail, anyEmail } = getEmails(row);

        if (!anyEmail) {
          skipped.push({ row: rowNumber, reason: "Missing email" });
          continue;
        }

        if (fileEmails.has(anyEmail)) {
          skipped.push({ row: rowNumber, reason: "Duplicate email in file" });
          continue;
        }

        fileEmails.add(anyEmail);

        const profile = await prisma.studentProfile.create({
          data: {
            firstName: row.firstName || null,
            lastName: row.lastName || null,
            personalEmail,
            schoolEmail,
            program: row.program || null,
            graduationYear: row.graduationYear || null,
            skills: parseSkills(row.skills)
          }
        });

        created.push(profile);

      } catch (err) {

        skipped.push({
          row: rowNumber,
          reason: err.message || "Row error"
        });

      }

    }

    await cleanupFile(filePath);

    return res.json({
      message: "Import complete",
      summary: {
        totalRows: rows.length,
        created: created.length,
        skipped: skipped.length
      },
      created,
      skipped
    });

  } catch (err) {

    await cleanupFile(filePath);

    return res.status(500).json({
      message: "Failed to import CSV"
    });

  }
}