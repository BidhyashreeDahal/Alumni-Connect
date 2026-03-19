import crypto from "crypto";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

function generateCsrfToken() {
  return crypto.randomBytes(32).toString("hex");
}

function csrfCookieOptions() {
  return {
    httpOnly: false,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    maxAge: env.COOKIE_MAX_AGE_MS,
    path: "/"
  };
}

export function ensureCsrfToken(req, res) {
  const existing = req.cookies?.[env.CSRF_COOKIE_NAME];
  if (existing) return existing;

  const token = generateCsrfToken();
  res.cookie(env.CSRF_COOKIE_NAME, token, csrfCookieOptions());
  return token;
}

export function getCsrfToken(req, res) {
  const csrfToken = ensureCsrfToken(req, res);
  res.set({
    "Cache-Control": "no-store, no-cache, must-revalidate, private",
    Pragma: "no-cache",
    Expires: "0"
  });

  return res.status(200).json({ csrfToken });
}

export function requireCsrfProtection(req, _res, next) {
  const method = String(req.method || "GET").toUpperCase();
  const safeMethod = ["GET", "HEAD", "OPTIONS"].includes(method);

  if (safeMethod) {
    return next();
  }

  const cookieToken = req.cookies?.[env.CSRF_COOKIE_NAME];
  const headerToken = req.get("x-csrf-token");

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return next(
      new AppError("CSRF token missing or invalid", 403, {
        code: "CSRF_MISMATCH"
      })
    );
  }

  return next();
}
