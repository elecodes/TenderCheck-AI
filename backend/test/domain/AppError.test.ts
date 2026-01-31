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
});
