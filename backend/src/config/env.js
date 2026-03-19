import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

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
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),
  CORS_ORIGINS: z.string().optional(),
  COOKIE_NAME: z.string().trim().min(1).default("ac_auth"),
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

const frontendOrigins = baseEnv.CORS_ORIGINS
  ? baseEnv.CORS_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean)
  : Array.from(
      new Set(
        baseEnv.NODE_ENV === "production"
          ? [baseEnv.FRONTEND_URL]
          : [baseEnv.FRONTEND_URL, "http://localhost:5173", "http://localhost:5174"]
      )
    );

const cookieSecure = baseEnv.COOKIE_SECURE ?? baseEnv.NODE_ENV === "production";
const cookieSameSite = baseEnv.COOKIE_SAME_SITE ?? (cookieSecure ? "none" : "lax");

if (cookieSameSite === "none" && !cookieSecure) {
  throw new Error("Invalid environment configuration: COOKIE_SAME_SITE 'none' requires secure cookies");
}

export const env = {
  ...baseEnv,
  FRONTEND_ORIGINS: frontendOrigins,
  COOKIE_SECURE: cookieSecure,
  COOKIE_SAME_SITE: cookieSameSite,
  COOKIE_MAX_AGE_MS: 30 * 60 * 1000
};
