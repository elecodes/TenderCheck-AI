import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "../../../src/application/services/AuthService.js";
import { AppError } from "../../../src/domain/errors/AppError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Mock dependencies
const mockUserRepository = {
  findByEmail: vi.fn(),
  save: vi.fn(),
  findById: vi.fn(),
};

// Mock bcrypt and jwt
vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed-password"),
    compare: vi.fn(),
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn().mockReturnValue("mock-token"),
  },
}));

// Mock global fetch for Google Auth
global.fetch = vi.fn();

describe("AuthService", () => {
  let authService: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    authService = new AuthService(mockUserRepository as any);
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.save.mockResolvedValue(undefined);

      const user = await authService.register(
        "John Doe",
        "john@example.com",
        "password123"
      );

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith("john@example.com");
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(user.email).toBe("john@example.com");
      expect(user.passwordHash).toBe("hashed-password");
    });

    it("should throw error if user already exists", async () => {
      mockUserRepository.findByEmail.mockResolvedValue({ id: "1" });

      await expect(
        authService.register("John", "john@example.com", "pass")
      ).rejects.toThrow("User already exists");

      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("should login successfully with valid credentials", async () => {
      const mockUser = {
        id: "user-1",
        email: "john@example.com",
        passwordHash: "hashed-real-password",
      };
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(true);

      const result = await authService.login("john@example.com", "password123");

      expect(result.token).toBe("mock-token");
      expect(result.user).toEqual(mockUser);
      expect(jwt.sign).toHaveBeenCalled();
    });

    it("should throw error/return null if user not found", async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login("missing@example.com", "pass")
      ).rejects.toThrow("Invalid credentials");
    });

    it("should throw error if password does not match", async () => {
      mockUserRepository.findByEmail.mockResolvedValue({
        passwordHash: "hash",
      });
      (bcrypt.compare as any).mockResolvedValue(false);

      await expect(
        authService.login("john@example.com", "wrongpass")
      ).rejects.toThrow("Invalid credentials");
    });
  });

  describe("loginWithGoogle", () => {
    it("should login existing user with Google token", async () => {
      // Mock Google API response
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          email: "google@example.com",
          name: "Google User",
        }),
      });

      const mockUser = { id: "g-1", email: "google@example.com" };
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await authService.loginWithGoogle("valid-google-token");

      expect(result.token).toBe("mock-token");
      expect(result.user).toEqual(mockUser);
      expect(mockUserRepository.save).not.toHaveBeenCalled(); // No save needed for existing
    });

    it("should register new user if not found", async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
            email: "new@example.com",
            name: "New Google User",
        }),
      });

      mockUserRepository.findByEmail.mockResolvedValue(null);

      const result = await authService.loginWithGoogle("valid-token");

      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result.user.email).toBe("new@example.com");
      expect(result.token).toBe("mock-token");
    });
  });
});
