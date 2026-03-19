import { z } from "zod";

const trimmedString = z.string().trim();
const emailSchema = trimmedString.email().transform((value) => value.toLowerCase());
const passwordSchema = z.string().min(10, "Password must be at least 10 characters");

export const loginBodySchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required")
});

export const claimAccountBodySchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: passwordSchema
});

export const changePasswordBodySchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"]
});
