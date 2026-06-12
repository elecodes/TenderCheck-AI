import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthController } from "../../../src/presentation/controllers/AuthController";
import { AuthService } from "../../../src/application/services/AuthService";
import { AppError } from "../../../src/domain/errors/AppError";
import type { Request, Response, NextFunction } from "express";

describe("AuthController", () => {
  let authController: AuthController;
  let mockAuthService: any;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockAuthService = {
      register: vi.fn(),
      login: vi.fn(),
      requestPasswordReset: vi.fn(),
    };

    authController = new AuthController(mockAuthService as AuthService);

    mockReq = {
      body: {},
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    } as unknown as Response;

    mockNext = vi.fn();
  });

  describe("register", () => {
    const validBody = {
      name: "Test User",
      email: "test@example.com",
      password: "Password123!",
    };

    it("should register user successfully", async () => {
      mockReq.body = validBody;
      const mockUser = { id: "1", ...validBody };
      const mockAuthResult = { token: "token", user: mockUser };

      mockAuthService.register.mockResolvedValue(mockUser);
      mockAuthService.login.mockResolvedValue(mockAuthResult);

      await authController.register(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockAuthService.register).toHaveBeenCalledWith(
        validBody.name,
        validBody.email,
        validBody.password,
        undefined,
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User registered successfully",
          token: "token",
        }),
      );
    });

    it("should return validation error for invalid body", async () => {
      mockReq.body = { ...validBody, email: "invalid-email" };

      await authController.register(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect((mockNext as any).mock.calls[0][0].message).toContain(
        "Validation Error",
      );
    });
  });

  describe("login", () => {
    const validBody = {
      email: "test@example.com",
      password: "Password123!",
    };

    it("should login successfully", async () => {
      mockReq.body = validBody;
      const mockUser = { id: "1", email: validBody.email };
      const mockAuthResult = { token: "token", user: mockUser };

      mockAuthService.login.mockResolvedValue(mockAuthResult);

      await authController.login(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockAuthService.login).toHaveBeenCalledWith(
        validBody.email,
        validBody.password,
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        token: "token",
        user: expect.objectContaining({ id: "1" }),
      });
      expect(mockRes.cookie).toHaveBeenCalled();
    });

    it("should handle authentication errors", async () => {
      mockReq.body = validBody;
      mockAuthService.login.mockRejectedValue(new Error("Invalid credentials"));

      await authController.login(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe("logout", () => {
    it("should clear cookie and return success message", async () => {
      await authController.logout(mockReq as Request, mockRes as Response);

      expect(mockRes.clearCookie).toHaveBeenCalledWith(
        "token",
        expect.any(Object),
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Logged out successfully",
      });
    });
  });
});
