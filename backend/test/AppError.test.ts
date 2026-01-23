import { describe, it, expect } from "vitest";
import { AppError } from "../src/domain/errors/AppError.js";

describe("AppError", () => {
  it("should create an operational error with given status", () => {
    const error = new AppError("Test error", 400);
    expect(error.message).toBe("Test error");
    expect(error.statusCode).toBe(400);
    expect(error.isOperational).toBe(true);
  });

  it("should create badRequest (400) error", () => {
    const error = AppError.badRequest("Bad data");
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe("Bad data");
    expect(error.isOperational).toBe(true);
  });

  it("should create unauthorized (401) error", () => {
    const error = AppError.unauthorized("No auth");
    expect(error.statusCode).toBe(401);
  });

  it("should create forbidden (403) error", () => {
    const error = AppError.forbidden("Forbidden");
    expect(error.statusCode).toBe(403);
  });

  it("should create notFound (404) error", () => {
    const error = AppError.notFound("Missing");
    expect(error.statusCode).toBe(404);
  });

  it("should create internal (500) non-operational error", () => {
    const error = AppError.internal("Crash");
    expect(error.statusCode).toBe(500);
    expect(error.isOperational).toBe(false);
  });
});
