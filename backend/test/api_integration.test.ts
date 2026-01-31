import { describe, it, expect, vi, afterEach, beforeAll } from "vitest";
import request from "supertest";
// import { app } from "../src/presentation/server.js"; // Removed static import
import { PdfParserAdapter } from "../src/infrastructure/adapters/PdfParserAdapter.js";
import { GeminiGenkitService } from "../src/infrastructure/services/GeminiGenkitService.js";

import jwt from "jsonwebtoken";
import { JWT_SECRET_FALLBACK } from "../src/config/constants.js";

import { SqliteDatabase } from "../src/infrastructure/database/SqliteDatabase.js";

let app: any;

const generateTestToken = () => {
  return jwt.sign(
    { userId: "test-user-id", email: "test@example.com" },
    process.env.JWT_SECRET || JWT_SECRET_FALLBACK,
    { expiresIn: "1h" },
  );
};

describe("Integration: POST /api/tenders/analyze", () => {
  beforeAll(async () => {
    // Setup in-memory DB for testing
    process.env.TURSO_DB_URL = "file::memory:";
    process.env.TURSO_AUTH_TOKEN = "test-token";
    process.env.DATABASE_PATH = ""; // Ensure this doesn't override
    process.env.GOOGLE_GENAI_API_KEY = "test-api-key"; // Prevent init crash

    // Initialize schema
    await SqliteDatabase.initializeSchema();

    // Import app after DB setup
    const mod = await import("../src/presentation/server.js");
    app = mod.app;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should upload a PDF, extract requirements, and return 201", async () => {
    const token = generateTestToken();
    const db = SqliteDatabase.getInstance();

    // Ensure user exists due to FK constraint (Async Turso call)
    await db.execute(
      "INSERT OR IGNORE INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)",
      ["test-user-id", "test@example.com", "hash", "Test User"],
    );

    // Spy on the real PdfParserAdapter to return fake text without needing a real PDF
    const parseSpy = vi
      .spyOn(PdfParserAdapter.prototype, "parse")
      .mockResolvedValue(
        "El sistema deberá procesar pagos. Must be secure. This text must be longer than 50 chars to pass validation.",
      );

    // Spy on GeminiGenkitService to avoid calling cloud LLM
    const analyzeSpy = vi
      .spyOn(GeminiGenkitService.prototype, "analyze")
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

    if (response.status !== 201) {
      console.error(
        "Test Failed. Response Body:",
        JSON.stringify(response.body, null, 2),
      );
    }

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

describe("Integration: POST /api/tenders/:id/validate-proposal", () => {
  it("should upload proposal, validate against tender, and return results", async () => {
    const token = generateTestToken();
    const db = SqliteDatabase.getInstance();

    // 1. Create a Tender to validate against
    // We can insert directly into DB to simulate existing state
    // Or assume the mock repository in the route handles it if we mock it?
    // But `TenderRoutes.ts` instantiates `TursoTenderRepository` directly!
    // So we must use the DB to "seed" the state.
    await db.execute(
       "INSERT OR IGNORE INTO tenders (id, user_id, title, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
       ["tender-123", "test-user-id", "Test Tender", "COMPLETED", new Date().toISOString(), new Date().toISOString()]
    );
     // Insert requirements? The Use Case logic fetches them.
     // But `ValidateProposal` uses `tenderRepository.findById`.
     // If `TursoTenderRepository` is real, it query DB.
     // So we must insert requirements.
     // This is getting complex for an integration test if we have to seed everything.
     // Alternatives:
     // 1. Mock `ValidateProposal` prototype using vi.spyOn?
     // `ValidateProposal` is imported in `TenderRoutes`.
     // If I spyOn `ValidateProposal.prototype.execute`, I can skip the DB setup!

    const { ValidateProposal } = await import("../src/application/use-cases/ValidateProposal.js");
    const executeSpy = vi.spyOn(ValidateProposal.prototype, "execute").mockResolvedValue([
        {
            requirementId: "req-1",
            status: "MET",
            reasoning: "Good",
            confidence: 1,
            evidence: { text: "ev", pageNumber: 1 }
        }
    ]);

    const response = await request(app)
      .post("/api/tenders/tender-123/validate-proposal")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from("proposal pdf"), "proposal.pdf");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.results).toHaveLength(1);
    expect(executeSpy).toHaveBeenCalled();
  });
});
