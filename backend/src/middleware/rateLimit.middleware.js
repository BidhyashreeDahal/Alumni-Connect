import rateLimit from "express-rate-limit";

function buildLimiter({ windowMs, max, message, skipSuccessfulRequests = false }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    message: {
      message,
      code: "RATE_LIMITED",
      details: null
    }
  });
}

export const authLoginLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts. Please try again later.",
  skipSuccessfulRequests: true
});

export const authClaimLimiter = buildLimiter({
  windowMs: 30 * 60 * 1000,
  max: 10,
  message: "Too many claim attempts. Please try again later."
});

export const bootstrapLimiter = buildLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: "Too many bootstrap attempts. Please try again later."
});

export const passwordChangeLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many password change attempts. Please try again later."
});

export const inviteMutationLimiter = buildLimiter({
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: "Too many invite actions. Please try again later."
});

export const bulkImportLimiter = buildLimiter({
  windowMs: 30 * 60 * 1000,
  max: 10,
  message: "Too many bulk import attempts. Please try again later."
});
