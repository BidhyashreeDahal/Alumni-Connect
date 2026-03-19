import { z } from "zod";
import {
  idParamsSchema,
  optionalEnum,
  optionalTrimmedString
} from "./shared.validators.js";

const targetRoleSchema = z.enum(["student", "alumni"]);

const optionalTargetProgramSchema = z.union([
  z.string().trim().min(1),
  z.literal(""),
  z.null()
]).optional();

const optionalTargetGradYearSchema = z.preprocess(
  (value) => {
    if (value === undefined || value === null || value === "") return undefined;
    return value;
  },
  z.coerce.number().int().min(1900).max(2500).optional()
);

export const announcementIdParamsSchema = idParamsSchema;

export const listAnnouncementsQuerySchema = z.object({
  search: optionalTrimmedString(),
  targetRole: optionalEnum(["student", "alumni"]),
  mine: z.enum(["true", "false"]).optional()
});

export const createAnnouncementBodySchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  content: z.string().trim().min(1, "Content is required"),
  targetRole: targetRoleSchema.optional(),
  targetProgram: optionalTargetProgramSchema,
  targetGradYear: optionalTargetGradYearSchema
});

export const updateAnnouncementBodySchema = createAnnouncementBodySchema;
