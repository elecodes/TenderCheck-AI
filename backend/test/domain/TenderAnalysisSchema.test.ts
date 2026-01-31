import { describe, it, expect } from "vitest";
import {
  TenderAnalysisSchema,
  RequirementSchema,
  ValidationResultSchema,
} from "../../src/domain/schemas/TenderAnalysisSchema.js";

describe("TenderAnalysisSchema", () => {
  it("should validate a valid TenderAnalysis object", () => {
    const validData = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      tenderTitle: "Test Tender",
      documentUrl: "http://example.com/doc.pdf",
      status: "PENDING",
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        pageCount: 10,
        processingTimeMs: 100,
        modelVersion: "gemini-1.5",
      },
    };

    const result = TenderAnalysisSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should fail on invalid data", () => {
    const invalidData = {
      id: "invalid-uuid", // Too short/not UUID if strict, but schema says .or(min(1))
      // Missing title
      status: "INVALID_STATUS",
    };

    const result = TenderAnalysisSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should validate a Requirement", () => {
    const req = {
      id: "req-1",
      text: "Must do X",
      type: "MANDATORY",
      source: {
        pageNumber: 1,
        snippet: "snippet",
      },
      keywords: ["must"],
      confidence: 0.9,
    };
    const result = RequirementSchema.safeParse(req);
    expect(result.success).toBe(true);
  });

  it("should validate a ValidationResult", () => {
    const val = {
      requirementId: "req-1",
      status: "MET",
      reasoning: "Reason",
      confidence: 1,
      evidence: {
        text: "Evidence",
        pageNumber: 1,
      },
    };
    const result = ValidationResultSchema.safeParse(val);
    expect(result.success).toBe(true);
  });
});
