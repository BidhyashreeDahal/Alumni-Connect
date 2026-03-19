export class AppError extends Error {
  constructor(message, statusCode = 500, options = {}) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = options.code || "INTERNAL_ERROR";
    this.details = options.details || null;
    this.isOperational = options.isOperational ?? true;
  }

  static badRequest(message, details = null) {
    return new AppError(message, 400, { code: "BAD_REQUEST", details });
  }

  static unauthorized(message = "Unauthorized", details = null) {
    return new AppError(message, 401, { code: "UNAUTHORIZED", details });
  }

  static forbidden(message = "Forbidden", details = null) {
    return new AppError(message, 403, { code: "FORBIDDEN", details });
  }

  static notFound(message = "Not found", details = null) {
    return new AppError(message, 404, { code: "NOT_FOUND", details });
  }

  static conflict(message, details = null) {
    return new AppError(message, 409, { code: "CONFLICT", details });
  }
}
