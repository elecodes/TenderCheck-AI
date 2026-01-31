import { describe, it, expect, vi } from "vitest";
import { ValidationEngine } from "../../../src/domain/validation/ValidationEngine.js";
import type { IRule } from "../../../src/domain/interfaces/IRule.js";
import type { TenderAnalysis } from "../../../src/domain/entities/TenderAnalysis.js";

describe("ValidationEngine", () => {
    const mockAnalysis = {} as TenderAnalysis;

    it("should execute all rules and return accumulated results", async () => {
        const rule1: IRule = {
            id: "r1",
            validate: vi.fn().mockResolvedValue({ requirementId: "req1", status: "MET", reasoning: "ok", confidence: 1, evidence: { text: "", pageNumber: 0 } })
        };
        const rule2: IRule = {
            id: "r2",
            validate: vi.fn().mockResolvedValue(null)
        };

        const engine = new ValidationEngine([rule1, rule2]);
        const results = await engine.validate(mockAnalysis);

        expect(rule1.validate).toHaveBeenCalledWith(mockAnalysis);
        expect(rule2.validate).toHaveBeenCalledWith(mockAnalysis);
        expect(results).toHaveLength(1);
        expect(results[0].requirementId).toBe("req1");
    });

    it("should return empty array if no rules provided", async () => {
        const engine = new ValidationEngine([]);
        const results = await engine.validate(mockAnalysis);
        expect(results).toHaveLength(0);
    });
});
