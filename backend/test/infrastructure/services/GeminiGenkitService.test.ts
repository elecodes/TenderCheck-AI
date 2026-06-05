import { describe, it, expect, vi, beforeEach } from "vitest";
import { GeminiGenkitService } from "../../../src/infrastructure/services/GeminiGenkitService.js";

// Mock the global ai instance
const mockGenerate = vi.fn();
vi.mock("../../../src/config/genkit.config.js", () => ({
  ai: {
    generate: (...args: any[]) => mockGenerate(...args),
  },
}));

describe("GeminiGenkitService", () => {
  let service: GeminiGenkitService;

  beforeEach(() => {
    service = new GeminiGenkitService();
    mockGenerate.mockReset();
  });

  describe("analyze", () => {
    it("should successfully analyze a tender and return mapped results", async () => {
      const mockOutput = {
        summary: "Test Tender Summary",
        requirements: [
          {
            id: "req-1",
            text: "Must have valid ISO 9001",
            type: "TECHNICAL",
            confidence: 1.0,
            keywords: ["ISO", "9001"],
          },
        ],
      };

      mockGenerate.mockResolvedValueOnce({ output: mockOutput });

      const result = await service.analyze("Sample tender text");

      expect(mockGenerate).toHaveBeenCalledTimes(1);
      expect(result.tenderTitle).toBe("Test Tender Summary");
      expect(result.requirements).toHaveLength(1);
      expect(result.requirements[0].text).toBe("Must have valid ISO 9001");
      expect(result.requirements[0].type).toBe("TECHNICAL");
      expect(result.requirements[0].source?.pageNumber).toBe(0);
    });

    it("should return graceful fallback if AI returns empty output", async () => {
      mockGenerate.mockResolvedValueOnce({ output: null });

      const result = await service.analyze("text");

      expect(result.status).toBe("FAILED");
      expect(result.requirements).toHaveLength(0);
      expect(result.results).toHaveLength(0);
    });

    it("should return graceful fallback on unexpected errors", async () => {
      mockGenerate.mockRejectedValueOnce(new Error("API Error"));

      const result = await service.analyze("text");

      expect(result.status).toBe("FAILED");
      expect(result.requirements).toHaveLength(0);
      expect(result.results).toHaveLength(0);
    });
  });

  describe("compareProposal", () => {
    it("should return compliant status when AI confirms", async () => {
      const mockOutput = {
        status: "COMPLIANT",
        reasoning: "Matches requirements",
        score: 1.0,
        sourceQuote: "We have ISO 9001",
      };

      mockGenerate.mockResolvedValueOnce({ output: mockOutput });

      const result = await service.compareProposal("Req text", "Proposal text");

      expect(result.status).toBe("COMPLIANT");
      expect(result.score).toBe(1.0);
    });

    it("should return non-compliant fallback on error", async () => {
      mockGenerate.mockRejectedValueOnce(new Error("AI Crash"));

      const result = await service.compareProposal("Req text", "Proposal text");

      expect(result.status).toBe("NON_COMPLIANT");
      expect(result.reasoning).toContain("AI Analysis Failed");
    });
  });

  describe("compareBatch", () => {
    it("should return a map of results", async () => {
      const mockOutput = {
        results: [
          {
            id: "r1",
            status: "COMPLIANT",
            reasoning: "Good",
            score: 1,
            sourceQuote: "Quote",
          },
        ],
      };

      mockGenerate.mockResolvedValueOnce({ output: mockOutput });

      const reqs = [{ id: "r1", text: "Req 1" }];
      const result = await service.compareBatch(reqs, "Prop text");

      expect(result.size).toBe(1);
      expect(result.get("r1")?.status).toBe("COMPLIANT");
    });

    it("should return empty map on error", async () => {
      mockGenerate.mockRejectedValueOnce(new Error("Batch Fail"));

      const reqs = [{ id: "r1", text: "Req 1" }];
      const result = await service.compareBatch(reqs, "Prop text");

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });
  });
});
