import { z } from "zod";

export const bootstrapAdminBodySchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(10, "Password must be at least 10 characters"),
  secret: z.string().min(1, "secret is required")
});
