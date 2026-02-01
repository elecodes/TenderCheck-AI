import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../src/presentation/server.js";
import { TenderAnalysisSchema } from "../src/domain/schemas/TenderAnalysisSchema.js";

describe("Security Headers (Helmet)", () => {
  it("should have security headers enabled", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    // Helmet defaults
    expect(res.headers["x-dns-prefetch-control"]).toBe("off");
    // Frameguard is enabled for protection against clickjacking
    expect(res.headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(res.headers["strict-transport-security"]).toBeDefined();
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["content-security-policy"]).toBeDefined();
  });

  it("should not expose X-Powered-By header", async () => {
    const res = await request(app).get("/health");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });

  it("should allow requests with no origin (like curl)", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
  });

  it("should block requests from unauthorized origins in production", async () => {
    // Mock NODE_ENV to production for this test
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    // We need to define some allowed origins or it will fail for everything except no-origin
    process.env.ALLOWED_ORIGINS = "http://trusted.com";

    const res = await request(app)
      .get("/health")
      .set("Origin", "http://malicious.com");

    expect(res.status).toBe(500); // CORS middleware usually throws an error which Express catches as 500 or 403 depending on setup.
    // Actually the callback(err) in cors middleware usually results in 500 unless handled.
    // Let's check the error message if possible or just status.
    // Note: express default error handler might return html or text.

    process.env.NODE_ENV = originalEnv;
  });
});

describe("Zod Schema Validation (Zero-Trust)", () => {
  it("should validate a valid TenderAnalysis object", () => {
    const validData = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      tenderTitle: "Test Tender",
      documentUrl: "http://example.com/doc.pdf",
      status: "PENDING",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        pageCount: 10,
      },
    };

    const result = TenderAnalysisSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject invalid TenderAnalysis object", () => {
    const invalidData = {
      id: "123",
      // tenderTitle missing
      documentUrl: "", // Should fail min(1)
      status: "INVALID_STATUS",
      createdAt: "not-a-date",
    };

    const result = TenderAnalysisSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issues = result.error.issues;
      // console.log('Validation Issues:', JSON.stringify(issues, null, 2));
      expect(issues.find((i) => i.path[0] === "tenderTitle")).toBeDefined();
      expect(issues.find((i) => i.path[0] === "documentUrl")).toBeDefined();
      expect(issues.find((i) => i.path[0] === "status")).toBeDefined();
      expect(issues.find((i) => i.path[0] === "createdAt")).toBeDefined();
    }
  });

  it("should validate Requirement sub-schema", () => {
    const validData = {
      id: "req-1",
      tenderTitle: "T",
      documentUrl: "http://e.com",
      status: "COMPLETED",
      createdAt: new Date(),
      updatedAt: new Date(),
      requirements: [
        {
          id: "r1",
          text: "Must be secure",
          type: "MANDATORY",
          source: {
            pageNumber: 1,
            snippet: "...must be secure...",
          },
          keywords: ["secure"],
          confidence: 0.95,
        },
      ],
    };
    const result = TenderAnalysisSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});
