import { z } from "zod";
import {
  idParamsSchema,
  optionalPositiveInt,
  optionalTrimmedString
} from "./shared.validators.js";

const emailFieldSchema = z.union([
  z.string().trim().email(),
  z.literal(""),
  z.null()
]).optional();

const optionalTextSchema = z.union([
  z.string().trim(),
  z.literal(""),
  z.null()
]).optional();

const yearFieldSchema = z.union([
  z.coerce.number().int().min(1900).max(2100),
  z.literal(""),
  z.null()
]).optional();

export const alumniIdParamsSchema = idParamsSchema;

export const createAlumniProfileBodySchema = z.object({
  schoolEmail: emailFieldSchema,
  personalEmail: emailFieldSchema,
  firstName: z.string().trim().min(1, "firstName is required"),
  lastName: z.string().trim().min(1, "lastName is required"),
  program: optionalTextSchema,
  graduationYear: z.coerce.number().int().min(1900).max(2100),
  jobTitle: optionalTextSchema,
  company: optionalTextSchema,
  skills: z.array(z.string().trim()).optional(),
  linkedinUrl: optionalTextSchema,
  meetingLink: optionalTextSchema
});

export const updateAlumniProfileBodySchema = z.object({
  personalEmail: emailFieldSchema,
  jobTitle: optionalTextSchema,
  company: optionalTextSchema,
  skills: z.array(z.string().trim()).optional(),
  firstName: optionalTextSchema,
  lastName: optionalTextSchema,
  linkedinUrl: optionalTextSchema,
  meetingLink: optionalTextSchema,
  graduationYear: yearFieldSchema
}).refine((data) => Object.values(data).some((value) => value !== undefined), {
  message: "At least one field must be provided",
  path: ["personalEmail"]
});

export const updateUnclaimedAlumniEmailsBodySchema = z.object({
  schoolEmail: emailFieldSchema,
  personalEmail: emailFieldSchema
}).refine((data) => data.schoolEmail !== undefined || data.personalEmail !== undefined, {
  message: "At least one of schoolEmail or personalEmail must be provided",
  path: ["schoolEmail"]
});

export const listAlumniProfilesQuerySchema = z.object({
  program: optionalTrimmedString(),
  year: optionalPositiveInt({ min: 1900, max: 2100 }),
  skill: optionalTrimmedString(),
  search: optionalTrimmedString(),
  page: optionalPositiveInt(),
  pageSize: optionalPositiveInt({ max: 100 })
});
