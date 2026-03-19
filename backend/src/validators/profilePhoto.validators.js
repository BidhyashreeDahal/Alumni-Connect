import { z } from "zod";

export const profilePhotoParamsSchema = z.object({
  profileType: z.enum(["student", "alumni"]),
  profileId: z.string().trim().min(1, "Profile id is required")
});
