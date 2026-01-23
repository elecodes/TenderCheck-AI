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
    // Convert unknown errors to AppError
    error = new AppError("Internal Server Error", 500, false);
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
