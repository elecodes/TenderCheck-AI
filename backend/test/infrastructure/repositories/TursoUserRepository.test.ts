import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TursoUserRepository } from "../../../src/infrastructure/repositories/TursoUserRepository";
import { TursoDatabase } from "../../../src/infrastructure/database/TursoDatabase";
import { v4 as uuidv4 } from "uuid";

// Mock TursoDatabase
vi.mock("../../../src/infrastructure/database/TursoDatabase", () => ({
  TursoDatabase: {
    getInstance: vi.fn(),
  },
}));

describe("TursoUserRepository", () => {
  let repository: TursoUserRepository;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      execute: vi.fn(),
    };
    (TursoDatabase.getInstance as any).mockReturnValue(mockDb);
    repository = new TursoUserRepository();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("findByEmail", () => {
    it("should return user if found", async () => {
      const mockRow = {
        id: "user-123",
        email: "test@example.com",
        password_hash: "hashed_pw",
        name: "Test User",
        company: "Test Co",
        created_at: new Date().toISOString(),
      };

      mockDb.execute.mockResolvedValue({
        rows: [mockRow],
      });

      const user = await repository.findByEmail("test@example.com");

      expect(mockDb.execute).toHaveBeenCalledWith({
        sql: "SELECT * FROM users WHERE email = ?",
        args: ["test@example.com"],
      });
      expect(user).toBeDefined();
      expect(user?.id).toBe(mockRow.id);
      expect(user?.email).toBe(mockRow.email);
    });

    it("should return null if not found", async () => {
      mockDb.execute.mockResolvedValue({
        rows: [],
      });

      const user = await repository.findByEmail("unknown@example.com");

      expect(user).toBeNull();
    });
  });

  describe("findById", () => {
    it("should return user if found", async () => {
      const mockRow = {
        id: "user-123",
        email: "test@example.com",
        password_hash: "hashed_pw",
        name: "Test User",
        created_at: new Date().toISOString(),
      };

      mockDb.execute.mockResolvedValue({
        rows: [mockRow],
      });

      const user = await repository.findById("user-123");

      expect(mockDb.execute).toHaveBeenCalledWith({
        sql: "SELECT * FROM users WHERE id = ?",
        args: ["user-123"],
      });
      expect(user?.id).toBe("user-123");
    });

    it("should return null if not found", async () => {
      mockDb.execute.mockResolvedValue({
        rows: [],
      });

      const user = await repository.findById("unknown-id");

      expect(user).toBeNull();
    });
  });

  describe("save", () => {
    it("should insert new user correctly", async () => {
      const newUser = {
        id: uuidv4(),
        email: "new@example.com",
        passwordHash: "hash",
        name: "New User",
        createdAt: new Date(),
      };

      mockDb.execute.mockResolvedValue({ rows: [] });

      await repository.save(newUser);

      expect(mockDb.execute).toHaveBeenCalledWith({
        sql: "INSERT INTO users (id, email, password_hash, name, company, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        args: [
          newUser.id,
          newUser.email,
          newUser.passwordHash,
          newUser.name,
          null,
          expect.any(String),
        ],
      });
    });
  });
});
