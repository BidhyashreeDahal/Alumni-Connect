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
export const scheduleMentorshipBodySchema = z.object({
  scheduledAt: z.string().datetime(),
  meetingLink: z.string().trim().url("meetingLink must be a valid URL"),
  meetingNotes: z.string().trim().max(1000).optional()
});

export const mentorshipFeedbackBodySchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional()
});

export const mentorshipMessageBodySchema = z.object({
  text: z.string().trim().min(1, "Message cannot be empty").max(1000, "Message is too long")
});

export const mentorshipSlotProposalBodySchema = z.object({
  slots: z.array(z.string().datetime()).min(1, "At least one slot is required").max(5, "Maximum 5 slots allowed"),
  note: z.string().trim().max(1000).optional()
});

export const mentorshipSlotSelectionParamsSchema = mentorshipIdParamsSchema.extend({
  slotId: z.string().trim().min(1, "slotId is required")
});
