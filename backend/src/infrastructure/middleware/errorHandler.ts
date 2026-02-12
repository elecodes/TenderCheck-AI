import type { Request, Response, NextFunction } from "express";
import { AppError } from "../../domain/errors/AppError.js";

// 3. Observability: Sentry
import * as Sentry from "@sentry/node";

export const globalErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let error = err;

  if (!(error instanceof AppError)) {
    // Check for MulterError (File Upload Errors)
    if (err.name === "MulterError") {
      const multerErr = err as any;
      if (multerErr.code === "LIMIT_FILE_SIZE") {
        error = AppError.badRequest(
          "File is too large. Maximum allowed size is 50MB.",
        );
      } else {
        error = AppError.badRequest(`File upload error: ${multerErr.message}`);
      }
    } else {
      // Convert unknown errors to AppError
      if (err.name === "ZodError" || (err as any).issues) {
        error = AppError.badRequest("Validation Error");
      } else if (
        err.name === "LibsqlError" ||
        (err as any).code === "SQLITE_UNKNOWN"
      ) {
        console.error("💥 [DB ERROR] Turso/Libsql Connection Failed:", err);
        error = new AppError(
          "Database Service Unavailable. Please try again.",
          503,
          false,
        );
      } else {
        console.error("💥 [CRASH] Unknown Error detected in Middleware:", err);
        console.error("Stack trace:", err.stack);
        error = new AppError("Internal Server Error", 500, false);
      }
    }
  }

  const { statusCode, message, isOperational } = error as AppError;

  // Logging Strategy
  if (!isOperational) {
    console.error("💥 UNEXPECTED ERROR:", err);
    Sentry.captureException(err);
  } else {
    console.warn("⚠️ OPERATIONAL ERROR:", message);
  }

  // Response Strategy
  res.status(statusCode).json({
    status: "error",
    error: isOperational ? message : "Something went wrong", // Frontend expects 'error'
    message: isOperational ? message : "Something went wrong", // Backward compatibility
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
