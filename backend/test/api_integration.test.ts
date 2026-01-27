import { describe, it, expect, vi, afterEach } from "vitest";
import request from "supertest";
import { app } from "../src/presentation/server.js";
import { PdfParserAdapter } from "../src/infrastructure/adapters/PdfParserAdapter.js";
import { MistralGenkitService } from "../src/infrastructure/services/MistralGenkitService.js";

import jwt from "jsonwebtoken";
import { JWT_SECRET_FALLBACK } from "../src/config/constants.js";

import { SqliteDatabase } from "../src/infrastructure/database/SqliteDatabase.js";

const generateTestToken = () => {
  return jwt.sign(
    { userId: "test-user-id", email: "test@example.com" },
    process.env.JWT_SECRET || JWT_SECRET_FALLBACK,
    { expiresIn: "1h" },
  );
};

describe("Integration: POST /api/tenders/analyze", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should upload a PDF, extract requirements, and return 201", async () => {
    const token = generateTestToken();
    const db = SqliteDatabase.getInstance();

    // Ensure user exists due to FK constraint
    db.prepare(
      "INSERT OR IGNORE INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)",
    ).run("test-user-id", "test@example.com", "hash", "Test User");

    // Spy on the real PdfParserAdapter to return fake text without needing a real PDF
    const parseSpy = vi
      .spyOn(PdfParserAdapter.prototype, "parse")
      .mockResolvedValue(
        "El sistema deberá procesar pagos. Must be secure. This text must be longer than 50 chars to pass validation.",
      );

    // Spy on MistralGenkitService to avoid calling local LLM
    const analyzeSpy = vi
      .spyOn(MistralGenkitService.prototype, "analyze")
      .mockResolvedValue({
        id: "123",
        userId: "test-user-id",
        tenderTitle: "Integration Test Tender",
        requirements: [
          {
            id: "1",
            text: "El sistema deberá procesar pagos.",
            type: "MANDATORY",
            keywords: [],
            source: { pageNumber: 1, snippet: "snippet" },
            confidence: 0.9,
          },
          {
            id: "2",
            text: "Must be secure.",
            type: "MANDATORY",
            keywords: [],
            source: { pageNumber: 1, snippet: "snippet" },
            confidence: 0.9,
          },
        ],
        results: [],
        status: "COMPLETED",
        createdAt: new Date(),
        updatedAt: new Date(),
        documentUrl: "test.pdf",
      });

    const response = await request(app)
      .post("/api/tenders/analyze")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from("fake pdf content"), "test.pdf")
      .field("title", "Integration Test Tender");

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.tenderTitle).toBe("Integration Test Tender");
    expect(response.body.status).toBe("COMPLETED");
    expect(response.body.requirements).toHaveLength(2);
    expect(response.body.requirements[0].text).toContain("deberá");
    expect(parseSpy).toHaveBeenCalled();
    expect(analyzeSpy).toHaveBeenCalled();
  }, 10000); // Increased timeout to 10 seconds for first-time model loading

  it("should return 400 if no file is uploaded", async () => {
    const token = generateTestToken();
    const response = await request(app)
      .post("/api/tenders/analyze")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "No File" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message");
    expect(response.body.status).toBe("error");
  });

  it("should return 401 if no token provided", async () => {
    const response = await request(app)
      .post("/api/tenders/analyze")
      .attach("file", Buffer.from("fake pdf content"), "test.pdf");

    expect(response.status).toBe(401);
  });
});
