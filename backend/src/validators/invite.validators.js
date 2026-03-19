import { z } from "zod";

const inviteTypeSchema = z.enum(["alumni", "student"]);

export const createInviteBodySchema = z.object({
  profileId: z.string().trim().min(1, "profileId is required"),
  type: inviteTypeSchema
});

export const listInviteStatusesQuerySchema = z.object({
  type: inviteTypeSchema.or(z.literal("")).optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional()
});
