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
  firstName: optionalTrimmedString(),
  lastName: optionalTrimmedString(),
  email: optionalTrimmedString(),
  schoolEmail: optionalTrimmedString(),
  personalEmail: optionalTrimmedString(),
  industry: optionalTrimmedString(),
  company: optionalTrimmedString(),
  jobTitle: optionalTrimmedString(),
  skill: optionalTrimmedString(),
  interests: optionalTrimmedString(),
  hasLinkedin: optionalEnum(["yes", "no"]),
  hasMeetingLink: optionalEnum(["yes", "no"]),
  openToMentorship: optionalEnum(["true", "false"]),
  yearsExperienceMin: optionalPositiveInt({ max: 80 }),
  yearsExperienceMax: optionalPositiveInt({ max: 80 }),
  profileType: optionalEnum(["student", "alumni"]),
  claimed: optionalEnum(["claimed", "unclaimed"]),
  updatedAfter: optionalTrimmedString(),
  updatedBefore: optionalTrimmedString()
});
