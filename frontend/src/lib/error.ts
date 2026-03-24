import axios from "axios";

type BackendValidationIssue = {
  path?: string;
  message?: string;
};

type BackendErrorPayload = {
  message?: string;
  code?: string;
  details?: unknown;
};

function normalizeSafeMessage(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (!text) return null;
  if (text.startsWith("{") || text.startsWith("[") || text.startsWith("<")) return null;
  if (/^\w+Error:/.test(text)) return null;
  if (text.includes("\n") && text.length > 180) return null;
  return text;
}

function getPayload(error: unknown): BackendErrorPayload | null {
  if (!axios.isAxiosError(error)) return null;
  const data = error.response?.data;
  if (!data || typeof data !== "object") return null;
  return data as BackendErrorPayload;
}

function getFirstValidationMessage(details: unknown): string | null {
  if (!Array.isArray(details)) return null;

  for (const item of details) {
    if (!item || typeof item !== "object") continue;
    const issue = item as BackendValidationIssue;
    if (typeof issue.message === "string" && issue.message.trim()) {
      if (typeof issue.path === "string" && issue.path.trim()) {
        return `${issue.path}: ${issue.message}`;
      }
      return issue.message;
    }
  }

  return null;
}

/**
 * Converts unknown/axios/backend errors into user-friendly text.
 * Use this in all catch blocks for UI messages.
 */
export function getUserErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  // Non-axios errors
  if (!axios.isAxiosError(error)) {
    if (error instanceof Error) {
      const safe = normalizeSafeMessage(error.message);
      if (safe) return safe;
    }
    return fallback;
  }

  // Network / CORS / server down
  if (!error.response) {
    if (error.code === "ECONNABORTED") {
      return "Request timed out. Please try again.";
    }
    return "Cannot connect to server. Please check your internet and try again.";
  }

  const status = error.response.status;
  const payload = getPayload(error);
  const code = payload?.code;
  const validationMessage = getFirstValidationMessage(payload?.details);

  // Code-first mapping (from backend AppError.code)
  if (code === "CSRF_MISMATCH") {
    return "Your session security check failed. Please refresh and try again.";
  }
  if (code === "UNAUTHORIZED") {
    return "Your session has expired. Please log in again.";
  }
  if (code === "FORBIDDEN") {
    return "You do not have permission to perform this action.";
  }
  if (code === "NOT_FOUND") {
    return "The requested resource was not found.";
  }
  if (code === "CONFLICT") {
    return "This action conflicts with existing data. Please review and try again.";
  }
  if (code === "BAD_REQUEST") {
    if (validationMessage) return `Please check your input: ${validationMessage}`;
    const safePayloadMessage = normalizeSafeMessage(payload?.message);
    if (safePayloadMessage) {
      return safePayloadMessage;
    }
    return "Some input is invalid. Please review and try again.";
  }

  // Status fallback mapping
  if (status === 400) {
    if (validationMessage) return `Please check your input: ${validationMessage}`;
    const safePayloadMessage = normalizeSafeMessage(payload?.message);
    if (safePayloadMessage) {
      return safePayloadMessage;
    }
    return "Invalid request. Please review your input.";
  }
  if (status === 401) return "Please log in to continue.";
  if (status === 403) return "You are not allowed to do this action.";
  if (status === 404) return "Requested item was not found.";
  if (status === 409) return "This record already exists or was changed by someone else.";
  if (status === 429) return "Too many requests. Please wait a moment and try again.";

  if (status >= 500) {
    return "Server error. Please try again shortly.";
  }

  // Use backend message only for non-server errors and only if plain text
  const safePayloadMessage = normalizeSafeMessage(payload?.message);
  if (safePayloadMessage && status < 500) {
    return safePayloadMessage;
  }

  return fallback;
}