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
      error = new AppError("Internal Server Error", 500, false);
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
    message: isOperational ? message : "Something went wrong",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
