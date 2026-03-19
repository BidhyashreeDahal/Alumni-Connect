import { z } from "zod";
import { idParamsSchema, optionalPositiveInt } from "./shared.validators.js";

export const mentorshipRequestBodySchema = z.object({
  alumniId: z.string().trim().min(1, "alumniId is required"),
  message: z.string().trim().min(20, "Please explain what mentorship help you need (minimum 20 characters)")
});

export const mentorshipIdParamsSchema = idParamsSchema;

export const mentorshipPaginationQuerySchema = z.object({
  page: optionalPositiveInt(),
  limit: optionalPositiveInt({ max: 100 })
});
