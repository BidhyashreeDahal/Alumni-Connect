import { z } from "zod";

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
