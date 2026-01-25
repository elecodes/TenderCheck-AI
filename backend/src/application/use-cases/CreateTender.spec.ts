import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateTender } from "./CreateTender.js";
import type { ITenderRepository } from "../../domain/repositories/ITenderRepository.js";
import type { IPdfParser } from "../../domain/interfaces/IPdfParser.js";
import type { ITenderAnalyzer } from "../../domain/interfaces/ITenderAnalyzer.js";
import { ValidationEngine } from "../../domain/validation/ValidationEngine.js";

describe("CreateTender Use Case", () => {
  let createTender: CreateTender;
  let mockRepository: any;
  let mockPdfParser: any;
  let mockAnalyzer: any;
  let mockValidationEngine: any;

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
    mockValidationEngine = {
      validate: vi.fn(), // Corrected method name to validate based on CreateTender.ts usage
    };

    createTender = new CreateTender(
      mockRepository,
      mockPdfParser,
      mockAnalyzer,
      mockValidationEngine,
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
      "Test Tender Title",
      Buffer.from("fake"),
      "test.pdf",
    );

    expect(mockPdfParser.parse).toHaveBeenCalled();
    expect(mockAnalyzer.analyze).toHaveBeenCalled();
    expect(mockRepository.save).toHaveBeenCalled();
    expect(result.requirements).toHaveLength(1);
  });
});
