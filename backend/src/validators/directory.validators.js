import { z } from "zod";
import {
  optionalEnum,
  optionalPositiveInt,
  optionalTrimmedString
} from "./shared.validators.js";

export const listDirectoryQuerySchema = z.object({
  page: optionalPositiveInt(),
  pageSize: optionalPositiveInt({ max: 100 }),
  search: optionalTrimmedString(),
  program: optionalTrimmedString(),
  year: optionalPositiveInt({ min: 1900, max: 2100 }),
  industry: optionalTrimmedString(),
  profileType: optionalEnum(["student", "alumni"]),
  claimed: optionalEnum(["claimed", "unclaimed"]),
  updatedAfter: optionalTrimmedString()
});
