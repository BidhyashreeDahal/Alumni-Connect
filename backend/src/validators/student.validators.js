import { z } from "zod";
import { idParamsSchema } from "./shared.validators.js";

const emailFieldSchema = z.union([
  z.string().trim().email(),
  z.literal(""),
  z.null()
]).optional();

const yearFieldSchema = z.union([
  z.coerce.number().int().min(1900).max(2100),
  z.literal(""),
  z.null()
]).optional();

const optionalTextSchema = z.union([
  z.string().trim(),
  z.literal(""),
  z.null()
]).optional();

const requiredTextSchema = z.string().trim().min(1);

export const createStudentProfileBodySchema = z.object({
  schoolEmail: z.string().trim().email(),
  personalEmail: emailFieldSchema,
  firstName: requiredTextSchema,
  lastName: requiredTextSchema,
  program: optionalTextSchema,
  graduationYear: yearFieldSchema,
  skills: z.array(z.string().trim()).optional(),
  interests: optionalTextSchema,
  linkedinUrl: optionalTextSchema
});

export const updateStudentProfileBodySchema = z.object({
  schoolEmail: emailFieldSchema,
  personalEmail: emailFieldSchema,
  firstName: optionalTextSchema,
  lastName: optionalTextSchema,
  program: optionalTextSchema,
  graduationYear: yearFieldSchema,
  skills: z.array(z.string().trim()).optional(),
  interests: optionalTextSchema,
  linkedinUrl: optionalTextSchema
}).refine((data) => Object.values(data).some((value) => value !== undefined), {
  message: "At least one field must be provided",
  path: ["schoolEmail"]
});

export const studentIdParamsSchema = idParamsSchema;

export const permanentDeleteUnclaimedStudentBodySchema = z.object({
  reason: z.string().trim().min(5, "reason must be at least 5 characters"),
  confirmText: z.string().trim().min(1, "confirmText is required")
});
