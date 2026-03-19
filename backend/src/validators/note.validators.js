import { z } from "zod";
import { idParamsSchema, optionalPositiveInt } from "./shared.validators.js";

const profileTypeSchema = z.enum(["student", "alumni"]);

export const noteIdParamsSchema = idParamsSchema;

export const noteProfileParamsSchema = z.object({
  id: z.string().trim().min(1, "Profile id is required")
});

export const createNoteBodySchema = z.object({
  profileId: z.string().trim().min(1, "profileId is required"),
  profileType: profileTypeSchema,
  content: z.string().trim().min(1, "content is required")
});

export const listNotesQuerySchema = z.object({
  profileType: profileTypeSchema,
  page: optionalPositiveInt(),
  limit: optionalPositiveInt({ max: 100 })
});

export const updateNoteBodySchema = z.object({
  content: z.string().trim().min(1, "content is required")
});
