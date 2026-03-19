import { z } from "zod";

export const idSchema = z.string().trim().min(1, "Id is required");

export const idParamsSchema = z.object({
  id: idSchema
});

export function optionalPositiveInt({ min = 1, max } = {}) {
  let schema = z.coerce.number().int().min(min);
  if (max !== undefined) {
    schema = schema.max(max);
  }

  return z.preprocess(
    (value) => (value === undefined || value === null || value === "" ? undefined : value),
    schema.optional()
  );
}

export function optionalTrimmedString() {
  return z.preprocess(
    (value) => {
      if (value === undefined || value === null) return undefined;
      if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed === "" ? undefined : trimmed;
      }
      return value;
    },
    z.string().optional()
  );
}

export function optionalEnum(values) {
  return z.preprocess(
    (value) => {
      if (value === undefined || value === null || value === "") return undefined;
      return value;
    },
    z.enum(values).optional()
  );
}
