import { describe, it, expect } from "vitest";
import { AppError } from "../../src/domain/errors/AppError.js";

describe("AppError", () => {
  it("should create a basic operational error", () => {
    const error = new AppError("Some error", 418);
    expect(error.message).toBe("Some error");
    expect(error.statusCode).toBe(418);
    expect(error.isOperational).toBe(true);
  });

  it("should create a badRequest error (400)", () => {
    const error = AppError.badRequest("Bad Input");
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe("Bad Input");
    expect(error.isOperational).toBe(true);
  });

  it("should create an unauthorized error (401)", () => {
    const error = AppError.unauthorized("No Token");
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe("No Token");
  });

  it("should create a forbidden error (403)", () => {
    const error = AppError.forbidden("Access Denied");
    expect(error.statusCode).toBe(403);
    expect(error.message).toBe("Access Denied");
  });

  it("should create a notFound error (404)", () => {
    const error = AppError.notFound("User Missing");
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe("User Missing");
  });

  it("should create an internal error (500) and set operational to false", () => {
    const error = AppError.internal("Crash");
    expect(error.statusCode).toBe(500);
    expect(error.message).toBe("Crash");
    expect(error.isOperational).toBe(false);
  });

  it("should be an instance of Error and AppError", () => {
    const error = AppError.badRequest("Test");
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.name).toBe("Error");
  });

  it("should have a stack trace", () => {
    const error = new AppError("Stack test", 500);
    expect(error.stack).toBeDefined();
    expect(error.stack).toContain("AppError");
  });

  it("should allow creating a non-operational error via constructor", () => {
    const error = new AppError("Not operational", 500, false);
    expect(error.isOperational).toBe(false);
  });
  it("should handle environments without Error.captureStackTrace", () => {
    const originalCaptureStackTrace = Error.captureStackTrace;
    try {
      // @ts-expect-error - Simulating non-V8 environment
      Error.captureStackTrace = undefined;
      const error = new AppError("No stack trace", 500);
      expect(error.message).toBe("No stack trace");
      expect(error.statusCode).toBe(500);
    } finally {
      Error.captureStackTrace = originalCaptureStackTrace;
    }
  });
});
