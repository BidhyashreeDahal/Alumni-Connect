import fs from "fs";
import path from "path";
import multer from "multer";
import csv from "csv-parser";
import { prisma } from "../db/prisma.js";
import { recordAuditLog } from "../services/auditLog.service.js";
import { findPotentialUnclaimedAlumniDuplicate } from "../services/profileDuplicate.service.js";

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
    const error = new Error("Only CSV files are allowed");
    error.statusCode = 400;
    error.code = "BAD_REQUEST";
    cb(error);
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

    if (cleanedKey === "email") {
      normalized.__emailFromGeneric =
        typeof row[key] === "string"
          ? row[key].trim()
          : row[key];
    }

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

function getRowErrorReason(error) {
  if (!error) return "Row error";

  if (error.code === "P2002") {
    const targets = Array.isArray(error.meta?.target)
      ? error.meta.target
      : error.meta?.target
      ? [error.meta.target]
      : [];

    if (targets.includes("schoolEmail")) {
      return "School email already exists";
    }

    if (targets.includes("personalEmail")) {
      return "Personal email already exists";
    }

    return "A unique field value already exists";
  }

  return error.message || "Row error";
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
    const filePersonalEmails = new Set();
    const fileSchoolEmails = new Set();

    for (let i = 0; i < rows.length; i++) {

      const rowNumber = i + 2;
      const rawRow = rows[i];
      const row = normalizeRow(rawRow);

      try {

        const { personalEmail, schoolEmail } = getEmails(row);

        if (!row.firstName) {
          skipped.push({ row: rowNumber, reason: "First name is required" });
          continue;
        }

        if (!row.lastName) {
          skipped.push({ row: rowNumber, reason: "Last name is required" });
          continue;
        }

        if (personalEmail && filePersonalEmails.has(personalEmail)) {
          skipped.push({ row: rowNumber, reason: "Duplicate personal email in file" });
          continue;
        }

        if (schoolEmail && fileSchoolEmails.has(schoolEmail)) {
          skipped.push({ row: rowNumber, reason: "Duplicate school email in file" });
          continue;
        }

        if (personalEmail) {
          filePersonalEmails.add(personalEmail);
        }

        if (schoolEmail) {
          fileSchoolEmails.add(schoolEmail);
        }

        if (!row.graduationYear) {
          skipped.push({ row: rowNumber, reason: "Graduation year is required" });
          continue;
        }

        const gradYear = parseGraduationYear(row.graduationYear);
        if (gradYear?.error) {
          skipped.push({ row: rowNumber, reason: gradYear.error });
          continue;
        }

        const duplicate = await findPotentialUnclaimedAlumniDuplicate({
          firstName: row.firstName,
          lastName: row.lastName,
          graduationYear: gradYear.value,
          program: row.program
        });

        if (duplicate) {
          skipped.push({
            row: rowNumber,
            reason: "Possible duplicate alumni profile exists",
            duplicateProfileId: duplicate.id
          });
          continue;
        }

        const profile = await prisma.alumniProfile.create({
          data: {
            firstName: row.firstName || null,
            lastName: row.lastName || null,
            personalEmail,
            schoolEmail,
            program: row.program || null,
            graduationYear: gradYear.value,
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
          reason: getRowErrorReason(err)
        });

      }

    }

    await cleanupFile(filePath);

    await recordAuditLog(req, {
      action: "bulk_import_completed",
      entityType: "bulk_import",
      summary: "Imported alumni profiles from CSV",
      metadata: {
        profileType: "alumni",
        totalRows: rows.length,
        created: created.length,
        skipped: skipped.length
      }
    });

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
      const gradYear = parseGraduationYear(row.graduationYear);
      try {

        const { personalEmail, schoolEmail } = getEmails(row);
        const genericEmail = row.__emailFromGeneric
          ? String(row.__emailFromGeneric).trim().toLowerCase()
          : null;

        const effectiveSchoolEmail = schoolEmail || genericEmail;
        const effectivePersonalEmail =
          schoolEmail
            ? personalEmail
            : personalEmail && personalEmail === genericEmail
            ? null
            : personalEmail;

       if (!row.firstName) {
       skipped.push({ row: rowNumber, reason: "First name is required" });
       continue;
    }

       if (!row.lastName) {
       skipped.push({ row: rowNumber, reason: "Last name is required" });
       continue;
    }

       if (!effectiveSchoolEmail) {
       skipped.push({ row: rowNumber, reason: "School email is required" });
       continue;
    }

      if (fileEmails.has(effectiveSchoolEmail)) {
      skipped.push({ row: rowNumber, reason: "Duplicate school email in file" });
      continue;
    }
      fileEmails.add(effectiveSchoolEmail);
         if (gradYear?.error) {
        skipped.push({ row: rowNumber, reason: gradYear.error });
        continue;
      }

        const profile = await prisma.studentProfile.create({
          data: {
            firstName: row.firstName || null,
            lastName: row.lastName || null,
            personalEmail: effectivePersonalEmail,
            schoolEmail: effectiveSchoolEmail,
            program: row.program || null,
            graduationYear: gradYear?.value ?? null,
            skills: parseSkills(row.skills)
          }
        });

        created.push(profile);

      } catch (err) {

        skipped.push({
          row: rowNumber,
          reason: getRowErrorReason(err)
        });

      }

    }

    await cleanupFile(filePath);

    await recordAuditLog(req, {
      action: "bulk_import_completed",
      entityType: "bulk_import",
      summary: "Imported student profiles from CSV",
      metadata: {
        profileType: "student",
        totalRows: rows.length,
        created: created.length,
        skipped: skipped.length
      }
    });

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