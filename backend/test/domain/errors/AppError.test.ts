import { describe, it, expect } from "vitest";
import { AppError } from "../../../src/domain/errors/AppError.js";

describe("AppError", () => {
  it("should create instance with custom code", () => {
    const err = new AppError("msg", 123, false);
    expect(err.message).toBe("msg");
    expect(err.statusCode).toBe(123);
    expect(err.isOperational).toBe(false);
  });

  it("should create instance with default isOperational=true", () => {
    const err = new AppError("msg", 123);
    expect(err.isOperational).toBe(true);
  });

  it("should capture stack trace", () => {
    const err = new AppError("msg", 500);
    expect(err.stack).toBeDefined();
  });

  it("should have factory methods matching status codes", () => {
    let err = AppError.badRequest("bad");
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe("bad");

    err = AppError.unauthorized("auth");
    expect(err.statusCode).toBe(401);

    err = AppError.forbidden("forbid");
    expect(err.statusCode).toBe(403);

    err = AppError.notFound("miss");
    expect(err.statusCode).toBe(404);

    err = AppError.internal("oops");
    expect(err.statusCode).toBe(500);
    expect(err.isOperational).toBe(false);
  });
});
