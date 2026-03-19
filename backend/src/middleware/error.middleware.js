import { AppError } from "../utils/AppError.js";

function mapPrismaError(error) {
  if (!error?.code) return null;

  if (error.code === "P2002") {
    return new AppError("A record with this value already exists", 409, {
      code: "CONFLICT",
      details: error.meta?.target || null
    });
  }

  if (error.code === "P2025") {
    return AppError.notFound("Requested record was not found");
  }

  return null;
}

function mapKnownError(error) {
  if (error instanceof AppError) return error;

  const prismaError = mapPrismaError(error);
  if (prismaError) return prismaError;

  if (error?.name === "MulterError") {
    return AppError.badRequest(error.message);
  }

  if (error?.name === "SyntaxError" && "body" in error) {
    return AppError.badRequest("Invalid JSON payload");
  }

  return new AppError(
    error?.message || "Internal server error",
    500,
    {
      code: "INTERNAL_ERROR",
      isOperational: false
    }
  );
}

export function notFoundHandler(req, _res, next) {
  next(AppError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
}

export function errorHandler(error, _req, res, _next) {
  const appError = mapKnownError(error);
  const isServerError = appError.statusCode >= 500;

  if (isServerError) {
    const requestLogger = _req.log;
    if (requestLogger) {
      requestLogger.error({ err: error, code: appError.code }, "Unhandled request error");
    }
  }

  return res.status(appError.statusCode).json({
    message: appError.message,
    code: appError.code,
    details: appError.details
  });
}
