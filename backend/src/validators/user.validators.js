import { z } from "zod";

const adminManagedRoleSchema = z.enum(["admin", "faculty", "student"]);
const systemRoleSchema = z.enum(["admin", "faculty", "student", "alumni"]);

const optionalTrimmedString = z.string().trim().min(1).optional();

export const createUserBodySchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(10, "Password must be at least 10 characters"),
  role: adminManagedRoleSchema,
  firstName: optionalTrimmedString,
  lastName: optionalTrimmedString,
  program: optionalTrimmedString,
  graduationYear: z.coerce.number().int().min(1900).max(2100).optional()
});

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional()
});

export const updateUserParamsSchema = z.object({
  id: z.string().trim().min(1, "User id is required")
});

export const updateUserBodySchema = z.object({
  role: systemRoleSchema.optional(),
  isActive: z.boolean().optional()
}).refine((data) => data.role !== undefined || data.isActive !== undefined, {
  message: "At least one of role or isActive must be provided",
  path: ["role"]
});
