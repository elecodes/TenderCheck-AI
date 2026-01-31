import { describe, it, expect, vi } from "vitest";
import { ValidationEngine } from "../../src/domain/validation/ValidationEngine.js";
import { IRule } from "../../src/domain/interfaces/IRule.js";
import { TenderAnalysis } from "../../src/domain/entities/TenderAnalysis.js";
import { ValidationResult } from "../../src/domain/entities/ValidationResult.js";

describe("ValidationEngine", () => {
  it("should return empty array if no rules", async () => {
    const engine = new ValidationEngine([]);
    const analysis: TenderAnalysis = {
        id: "id",
        userId: "user",
        tenderTitle: "title",
        documentUrl: "hash",
        status: "PENDING",
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    const results = await engine.validate(analysis);
    expect(results).toEqual([]);
  });

  it("should collect results from rules that return a failure/warning", async () => {
    const mockRule: IRule = {
      id: "mock-rule",
      validate: vi.fn().mockResolvedValue({
        requirementId: "req-1",
        status: "NOT_MET",
        reasoning: "failed",
        confidence: 1.0,
      } as ValidationResult),
    };

    const engine = new ValidationEngine([mockRule]);
    const analysis: TenderAnalysis = {
        id: "id",
        userId: "user",
        tenderTitle: "title",
        documentUrl: "hash",
        status: "PENDING",
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const results = await engine.validate(analysis);
    expect(results).toHaveLength(1);
    expect(results[0].status).toBe("NOT_MET");
  });

  it("should ignore rules that return null (pass)", async () => {
    const passingRule: IRule = {
      id: "passing-rule",
      validate: vi.fn().mockResolvedValue(null),
    };

    const engine = new ValidationEngine([passingRule]);
    const analysis: TenderAnalysis = {
        id: "id",
        userId: "user",
        tenderTitle: "title",
        documentUrl: "hash",
        status: "PENDING",
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const results = await engine.validate(analysis);
    expect(results).toEqual([]);
  });
});
