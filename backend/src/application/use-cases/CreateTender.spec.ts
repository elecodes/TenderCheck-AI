import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateTender } from "./CreateTender.js";
import { VectorSearchService } from "../../infrastructure/services/VectorSearchService.js";
import type { ITenderRepository } from "../../domain/repositories/ITenderRepository.js";
import type { IPdfParser } from "../../domain/interfaces/IPdfParser.js";
import type { ITenderAnalyzer } from "../../domain/interfaces/ITenderAnalyzer.js";
import { ValidationEngine } from "../../domain/validation/ValidationEngine.js";

vi.mock("../../domain/validation/ValidationRuleFactory.js", () => ({
  ValidationRuleFactory: {
    createRules: vi.fn().mockResolvedValue([]),
  },
}));

describe("CreateTender Use Case", () => {
  let createTender: CreateTender;
  let mockRepository: any;
  let mockPdfParser: any;
  let mockAnalyzer: any;
  let mockValidationEngine: any;
  let mockVectorSearch: any;

  beforeEach(() => {
    mockRepository = {
      save: vi.fn(),
    };
    mockPdfParser = {
      parse: vi.fn(),
    };
    mockAnalyzer = {
      analyze: vi.fn(),
    };
    mockVectorSearch = {
      generateEmbedding: vi
        .fn()
        .mockResolvedValue(new Float32Array([0.1, 0.2, 0.3])),
      serializeEmbedding: vi.fn().mockReturnValue(Buffer.from("mock-emb")),
    };
    mockValidationEngine = {
      validate: vi.fn(), // Corrected method name to validate based on CreateTender.ts usage
    };

    createTender = new CreateTender(
      mockRepository,
      mockPdfParser,
      mockAnalyzer,
      mockVectorSearch,
    );
  });

  it("should parse PDF, extract requirements, and save tender", async () => {
    const mockAnalysis = {
      id: "123",
      tenderTitle: "Analyzed Tender",
      requirements: [
        {
          id: "1",
          text: "Must be great",
          type: "MANDATORY",
          keywords: [],
        },
      ],
      results: [],
      status: "COMPLETED",
      createdAt: new Date(),
      updatedAt: new Date(),
      documentUrl: "test.pdf",
    };

    mockPdfParser.parse.mockResolvedValue("This tender must be great.");
    mockAnalyzer.analyze.mockResolvedValue(mockAnalysis);
    // Mocking execute output if relevant, or checking side effects
    mockRepository.save.mockResolvedValue({ ...mockAnalysis, id: "saved_123" });
    mockValidationEngine.validate.mockResolvedValue([]);

    const result = await createTender.execute(
      "test-user-id",
      Buffer.from("fake"),
    );

    expect(mockPdfParser.parse).toHaveBeenCalled();
    expect(mockAnalyzer.analyze).toHaveBeenCalled();
    expect(mockRepository.save).toHaveBeenCalled();
    expect(result.requirements).toHaveLength(1);
  });
});
