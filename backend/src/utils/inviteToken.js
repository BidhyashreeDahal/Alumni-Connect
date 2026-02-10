import crypto from "crypto";

export function generateRawToken() {
  return crypto.randomBytes(32).toString("hex"); // raw token (send to user)
}

export function hashToken(rawToken) {
  // Store only the hash in DB (safer)
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}
