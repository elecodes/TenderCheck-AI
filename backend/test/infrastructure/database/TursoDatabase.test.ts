import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TursoDatabase } from "../../../src/infrastructure/database/TursoDatabase";
import { createClient } from "@libsql/client";
import { readFileSync } from "fs";

// Mock fs
vi.mock("fs");

// Mock @libsql/client
vi.mock("@libsql/client", () => ({
  createClient: vi.fn(() => ({
    execute: vi.fn(),
    close: vi.fn(),
  })),
}));

describe("TursoDatabase", () => {
  beforeEach(() => {
    // Reset singleton instance if possible or mock process.env
    vi.resetModules();
    process.env.TURSO_DB_URL = "libsql://test-db.turso.io";
    process.env.TURSO_AUTH_TOKEN = "test-token";
    // We need to access the private instance to reset it, or just rely on fresh execution if we can
    (TursoDatabase as any).instance = null;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should enforce HTTPS protocol when TURSO_DB_URL starts with libsql://", () => {
    TursoDatabase.getInstance();

    expect(createClient).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "https://test-db.turso.io",
        authToken: "test-token",
      }),
    );
  });

  it("should throw error if TURSO_DB_URL is missing", () => {
    delete process.env.TURSO_DB_URL;
    (TursoDatabase as any).instance = null;
    expect(() => TursoDatabase.getInstance()).toThrow(
      "TURSO_DB_URL is missing",
    );
  });

  it("should throw error if TURSO_AUTH_TOKEN is missing for remote URL", () => {
    process.env.TURSO_DB_URL = "libsql://remote.db";
    delete process.env.TURSO_AUTH_TOKEN;
    (TursoDatabase as any).instance = null;
    expect(() => TursoDatabase.getInstance()).toThrow(
      "TURSO_AUTH_TOKEN is required",
    );
  });

  it("should NOT throw error if TURSO_AUTH_TOKEN is missing for local file URL", () => {
    process.env.TURSO_DB_URL = "file:local.db";
    delete process.env.TURSO_AUTH_TOKEN;
    (TursoDatabase as any).instance = null;
    expect(() => TursoDatabase.getInstance()).not.toThrow();
  });

  describe("initializeSchema", () => {
    it("should read schema file and execute statements", async () => {
      // Mock fs.readFileSync
      vi.mocked(readFileSync).mockReturnValue(
        "CREATE TABLE test; INSERT INTO test VALUES (1);",
      );

      // Mock db instance
      const mockExecute = vi.fn().mockResolvedValue({ rows: [] });
      (TursoDatabase as any).instance = {
        execute: mockExecute,
      } as any;

      await TursoDatabase.initializeSchema();

      // Verify fs.readFileSync called
      expect(readFileSync).toHaveBeenCalled();
      // Verify db.execute called for generic schema
      expect(mockExecute).toHaveBeenCalledWith("CREATE TABLE test");
      expect(mockExecute).toHaveBeenCalledWith("INSERT INTO test VALUES (1)");
    });

    it("should seed industry presets if table is empty", async () => {
      // Mock fs
      vi.mocked(readFileSync).mockReturnValue("");

      const mockExecute = vi
        .fn()
        // Migration check
        .mockResolvedValueOnce({})
        // Count check
        .mockResolvedValueOnce({ rows: [{ count: 0 }] })
        // Insertions
        .mockResolvedValue({});

      (TursoDatabase as any).instance = {
        execute: mockExecute,
      } as any;

      await TursoDatabase.initializeSchema();

      // We expect calls for:
      // 1. Migration (embedding)
      // 2. Count check
      // 3. Inserts (2 presets)
      // We can check if it attempted to insert into industry_presets
      expect(mockExecute).toHaveBeenCalledWith(
        expect.objectContaining({
          sql: expect.stringContaining("INSERT INTO industry_presets"),
        }),
      );
    });

    it("should NOT seed industry presets if table is NOT empty", async () => {
      // Mock fs
      vi.mocked(readFileSync).mockReturnValue("");

      const mockExecute = vi
        .fn()
        // Migration check
        .mockResolvedValueOnce({})
        // Count check - return count > 0
        .mockResolvedValueOnce({ rows: [{ count: 5 }] });

      (TursoDatabase as any).instance = {
        execute: mockExecute,
      } as any;

      await TursoDatabase.initializeSchema();

      // Should verify that INSERT was NOT called
      expect(mockExecute).not.toHaveBeenCalledWith(
        expect.objectContaining({
          sql: expect.stringContaining("INSERT INTO industry_presets"),
        }),
      );
    });
  });
});
