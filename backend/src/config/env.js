import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

function normalizeOrigin(value) {
  if (!value) return null;
  const normalized = String(value).trim();
  if (!normalized) return null;

  try {
    return new URL(normalized).origin;
  } catch {
    return normalized.replace(/\/+$/, "");
  }
}

function parseBoolean(value) {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "boolean") return value;

  const normalized = String(value).trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(normalized)) return true;
  if (["false", "0", "no", "off"].includes(normalized)) return false;
  return value;
}

const rawEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  PORT: z.preprocess(
    (value) => (value === undefined || value === null || value === "" ? 5000 : value),
    z.coerce.number().int().min(1).max(65535)
  ),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  BOOTSTRAP_SECRET: z.string().min(1, "BOOTSTRAP_SECRET is required"),
  FRONTEND_URL: z.string().url().optional(),
  CORS_ORIGINS: z.string().optional(),
  UPLOADS_DIR: z.string().trim().min(1).optional(),
  CLOUDINARY_CLOUD_NAME: z.string().trim().min(1).optional(),
  CLOUDINARY_API_KEY: z.string().trim().min(1).optional(),
  CLOUDINARY_API_SECRET: z.string().trim().min(1).optional(),
  COOKIE_NAME: z.string().trim().min(1).default("ac_auth"),
  CSRF_COOKIE_NAME: z.string().trim().min(1).default("ac_csrf"),
  COOKIE_SECURE: z.preprocess(parseBoolean, z.boolean().optional()),
  COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"]).optional(),
  TRUST_PROXY: z.preprocess(parseBoolean, z.boolean().default(false))
});

const parsedEnv = rawEnvSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const issues = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
    .join("; ");

  throw new Error(`Invalid environment configuration: ${issues}`);
}

const baseEnv = parsedEnv.data;
const frontendUrl = baseEnv.FRONTEND_URL ?? (baseEnv.NODE_ENV === "production" ? null : "http://localhost:5173");

if (!frontendUrl) {
  throw new Error("Invalid environment configuration: FRONTEND_URL is required in production");
}

const frontendOrigins = Array.from(
  new Set(
    (baseEnv.CORS_ORIGINS
      ? baseEnv.CORS_ORIGINS.split(",")
      : baseEnv.NODE_ENV === "production"
        ? [frontendUrl]
        : [frontendUrl, "http://localhost:5173", "http://localhost:5174"]
    )
      .map(normalizeOrigin)
      .filter(Boolean)
  )
);

const cookieSecure = baseEnv.COOKIE_SECURE ?? baseEnv.NODE_ENV === "production";
const cookieSameSite = baseEnv.COOKIE_SAME_SITE ?? (cookieSecure ? "none" : "lax");

if (cookieSameSite === "none" && !cookieSecure) {
  throw new Error("Invalid environment configuration: COOKIE_SAME_SITE 'none' requires secure cookies");
}

const hasAnyCloudinaryEnv = Boolean(
  baseEnv.CLOUDINARY_CLOUD_NAME || baseEnv.CLOUDINARY_API_KEY || baseEnv.CLOUDINARY_API_SECRET
);
const hasAllCloudinaryEnv = Boolean(
  baseEnv.CLOUDINARY_CLOUD_NAME && baseEnv.CLOUDINARY_API_KEY && baseEnv.CLOUDINARY_API_SECRET
);

if (hasAnyCloudinaryEnv && !hasAllCloudinaryEnv) {
  throw new Error(
    "Invalid environment configuration: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET must all be set together"
  );
}

export const env = {
  ...baseEnv,
  FRONTEND_URL: frontendUrl,
  FRONTEND_ORIGINS: frontendOrigins,
  CLOUDINARY_ENABLED: hasAllCloudinaryEnv,
  COOKIE_SECURE: cookieSecure,
  COOKIE_SAME_SITE: cookieSameSite,
  COOKIE_MAX_AGE_MS: 30 * 60 * 1000
};
