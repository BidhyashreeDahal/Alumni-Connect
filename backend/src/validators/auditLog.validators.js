import { z } from "zod";
import { optionalPositiveInt, optionalTrimmedString } from "./shared.validators.js";

export const listAuditLogsQuerySchema = z.object({
  page: optionalPositiveInt(),
  pageSize: optionalPositiveInt({ max: 100 }),
  action: optionalTrimmedString(),
  entityType: optionalTrimmedString(),
  actorId: optionalTrimmedString(),
  search: optionalTrimmedString()
});
