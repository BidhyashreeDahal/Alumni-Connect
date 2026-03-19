import { z } from "zod";

export const updateSettingsBodySchema = z.object({
  profileVisibility: z.enum(["public", "students_only", "hidden"]).optional(),
  emailMentorship: z.boolean().optional(),
  emailEvents: z.boolean().optional(),
  emailAnnouncements: z.boolean().optional()
}).refine((data) => Object.values(data).some((value) => value !== undefined), {
  message: "At least one settings field must be provided",
  path: ["profileVisibility"]
});
