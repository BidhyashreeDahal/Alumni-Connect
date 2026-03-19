import { z } from "zod";

export const profileIdParamsSchema = z.object({
  id: z.string().trim().min(1, "Profile id is required")
});
