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
  personalEmail: z.string().trim().email().optional(),
  program: optionalTrimmedString,
  graduationYear: z.coerce.number().int().min(1900).max(2100).optional()
}).superRefine((data, ctx) => {
  if (data.role !== "student") return;

  if (!data.firstName || data.firstName.trim().length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "firstName is required for student accounts",
      path: ["firstName"]
    });
  }

  if (!data.lastName || data.lastName.trim().length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "lastName is required for student accounts",
      path: ["lastName"]
    });
  }
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

export const convertUserRoleBodySchema = z.object({
  targetRole: z.enum(["student", "alumni"]),
  reason: z.string().trim().min(5, "reason must be at least 5 characters")
});