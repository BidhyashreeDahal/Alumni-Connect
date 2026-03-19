import { z } from "zod";
import {
  idParamsSchema,
  optionalEnum,
  optionalTrimmedString
} from "./shared.validators.js";

const audienceSchema = z.enum(["all", "student", "alumni"]);
const optionalTextSchema = z.union([
  z.string().trim(),
  z.literal(""),
  z.null()
]).optional();

export const eventIdParamsSchema = idParamsSchema;

export const createEventBodySchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: optionalTextSchema,
  location: optionalTextSchema,
  eventDate: z.coerce.date(),
  targetAudience: audienceSchema.optional()
});

export const updateEventBodySchema = createEventBodySchema;

export const listEventsQuerySchema = z.object({
  search: optionalTrimmedString(),
  timeframe: optionalEnum(["all", "past", "upcoming"]),
  audience: optionalEnum(["all", "student", "alumni"])
});
