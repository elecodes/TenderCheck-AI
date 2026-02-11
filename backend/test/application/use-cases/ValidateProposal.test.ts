import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ValidateProposal } from "../../../src/application/use-cases/ValidateProposal.js";
import { VectorSearchService } from "../../../src/infrastructure/services/VectorSearchService.js";
import { AppError } from "../../../src/domain/errors/AppError.js";
import { TursoDatabase } from "../../../src/infrastructure/database/TursoDatabase.js";

// Mock external dependencies
const mockTenderRepository = {
  findById: vi.fn(),
  save: vi.fn(),
};

const mockPdfParser = {
  parse: vi.fn(),
};

const mockTenderAnalyzer = {
  analyze: vi.fn(),
  compareBatch: vi.fn(),
};

// Mock VectorSearchService inside the class using vi.mock
vi.mock("../../../src/infrastructure/services/VectorSearchService.js", () => {
  return {
    VectorSearchService: class {
      generateEmbedding() {
        return Promise.resolve(new Float32Array([0.1, 0.2, 0.3]));
      }
      serializeEmbedding() {
        return Buffer.from("mock-embedding");
      }
      deserializeEmbedding() {
        return new Float32Array([0.1, 0.2, 0.3]);
      }
      findSimilar() {
        return [{ id: "req-1", similarity: 0.95 }];
      }
    },
  };
});

// Mock TursoDatabase singleton
vi.mock("../../../src/infrastructure/database/TursoDatabase.js", () => {
  const mockExecute = vi.fn().mockResolvedValue({ rows: [] }); // Default return
  return {
    TursoDatabase: {
      getInstance: vi.fn().mockReturnValue({
        execute: mockExecute,
      }),
    },
  };
});

describe("ValidateProposal Use Case", () => {
  let validateProposal: ValidateProposal;

  beforeEach(() => {
    vi.clearAllMocks();
    validateProposal = new ValidateProposal(
      mockTenderRepository as any,
      mockPdfParser as any,
      mockTenderAnalyzer as any,
      new VectorSearchService(),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should throw NotFound error if tender does not exist", async () => {
    mockTenderRepository.findById.mockResolvedValue(null);

    await expect(
      validateProposal.execute("tender-123", Buffer.from("pdf")),
    ).rejects.toThrow(AppError);

    expect(mockTenderRepository.findById).toHaveBeenCalledWith("tender-123");
  });

  it("should throw BadRequest error if proposal PDF is empty or too short", async () => {
    mockTenderRepository.findById.mockResolvedValue({ id: "tender-123" });
    mockPdfParser.parse.mockResolvedValue(""); // Empty text

    await expect(
      validateProposal.execute("tender-123", Buffer.from("pdf")),
    ).rejects.toThrow("Proposal PDF seems empty");
  });

  it("should validate relevant requirements via Vector Search and update tender", async () => {
    const mockTender = {
      id: "tender-123",
      requirements: [
        { id: "req-1", text: "Must support SSO" },
        { id: "req-2", text: "Must handle 1M users" },
      ],
      results: [],
    };

    const mockProposalText = "We support SSO login for all users.";

    mockTenderRepository.findById.mockResolvedValue(mockTender);
    mockPdfParser.parse.mockResolvedValue(mockProposalText);

    // Mock Turso DB responses for embeddings
    // 1. check ensuring embeddings (none returned, so it generates)
    // 2. fetch embeddings for finding relevant
    const mockDb = TursoDatabase.getInstance();
    (mockDb.execute as any).mockResolvedValue({
      rows: [{ embedding: Buffer.from("mock-embedding") }],
    });

    // Mock Analyzer response for the batch
    const mockBatchResult = new Map();
    mockBatchResult.set("req-1", {
      status: "COMPLIANT",
      reasoning: "Confirmed SSO support.",
      score: 95,
      sourceQuote: "We support SSO",
    });

    mockTenderAnalyzer.compareBatch.mockResolvedValue(mockBatchResult);

    const results = await validateProposal.execute(
      "tender-123",
      Buffer.from("pdf"),
    );

    // Expected 2 results:
    // 1. req-1 (Relevant, Analyzed -> MET)
    // 2. req-2 (Not Relevant, Skipped -> NOT_MET)
    expect(results).toHaveLength(2);

    const relevantResult = results.find((r) => r.requirementId === "req-1");
    expect(relevantResult?.status).toBe("MET");
    expect(relevantResult?.reasoning).toBe("Confirmed SSO support.");

    const skippedResult = results.find((r) => r.requirementId === "req-2");
    expect(skippedResult?.status).toBe("NOT_MET"); // Skipped default
    expect(skippedResult?.reasoning).toContain("no relevante");

    // Verify Repository Update
    expect(mockTenderRepository.save).toHaveBeenCalled();
    const saveCallArg = mockTenderRepository.save.mock.calls[0][0];
    expect(saveCallArg.results).toHaveLength(2);
  });

  it("should generate embeddings if they do not exist in database", async () => {
    const mockTender = {
      id: "tender-123",
      requirements: [{ id: "req-1", text: "Must do X" }],
    };
    mockTenderRepository.findById.mockResolvedValue(mockTender);
    mockPdfParser.parse.mockResolvedValue(
      "Some longer text to pass length check",
    );

    const mockDb = TursoDatabase.getInstance();
    // 1. ensureEmbeddingsExist check: return empty (trigger generate)
    // 2. findRelevantRequirements: return one with embedding
    (mockDb.execute as any)
      .mockResolvedValueOnce({ rows: [] }) // Trigger generation
      .mockResolvedValueOnce({ rows: [{ embedding: Buffer.from("mock") }] }); // for findRelevant

    await validateProposal.execute("tender-123", Buffer.from("pdf"));

    expect(mockTenderRepository.findById).toHaveBeenCalled();
  });

  it("should process all requirements if Vector Search returns nothing (Fallback)", async () => {
    const mockTender = {
      id: "tender-123",
      requirements: [{ id: "req-1", text: "Must do X" }],
    };
    mockTenderRepository.findById.mockResolvedValue(mockTender);
    mockPdfParser.parse.mockResolvedValue(
      "Some longer text to pass length check",
    );

    const mockDb = TursoDatabase.getInstance();
    (mockDb.execute as any).mockResolvedValue({
      rows: [{ embedding: Buffer.from("mock-embedding") }],
    });

    // Force VectorSearch to return empty similar list
    vi.spyOn(VectorSearchService.prototype, "findSimilar").mockReturnValue([]);

    const mockBatchResult = new Map();
    mockBatchResult.set("req-1", {
      status: "COMPLIANT",
      reasoning: "Fallback match.",
      score: 80,
    });
    mockTenderAnalyzer.compareBatch.mockResolvedValue(mockBatchResult);

    const results = await validateProposal.execute(
      "tender-123",
      Buffer.from("pdf"),
    );

    expect(results).toHaveLength(1);
    expect(mockTenderAnalyzer.compareBatch).toHaveBeenCalled();
  });

  it("should handle partial status and normalize confidence scores", async () => {
    const mockTender = {
      id: "tender-123",
      requirements: [{ id: "req-1", text: "X" }],
      results: [
        { requirementId: "SCOPE_CHECK", status: "MET", reasoning: "OK" },
      ],
    };
    mockTenderRepository.findById.mockResolvedValue(mockTender);
    mockPdfParser.parse.mockResolvedValue(
      "Some longer text to pass length check",
    );

    const mockDb = TursoDatabase.getInstance();
    (mockDb.execute as any).mockResolvedValue({
      rows: [{ embedding: Buffer.from("mock") }],
    });

    const mockBatchResult = new Map();
    mockBatchResult.set("req-1", {
      status: "PARTIAL",
      score: 0.85,
      reasoning: "Partially done.",
    });
    mockTenderAnalyzer.compareBatch.mockResolvedValue(mockBatchResult);

    const results = await validateProposal.execute(
      "tender-123",
      Buffer.from("pdf"),
    );

    expect(results[0].status).toBe("PARTIALLY_MET");
    expect(results[0].confidence).toBe(0.85);

    // Verify SCOPE_CHECK was preserved
    const saveCallArg = mockTenderRepository.save.mock.calls[0][0];
    expect(
      saveCallArg.results.find((r: any) => r.requirementId === "SCOPE_CHECK"),
    ).toBeDefined();
  });

  it("should process multiple chunks if requirements exceed BATCH_CHUNK_SIZE", async () => {
    const mockTender = {
      id: "tender-123",
      requirements: [
        { id: "req-1", text: "R1" },
        { id: "req-2", text: "R2" },
        { id: "req-3", text: "R3" },
        { id: "req-4", text: "R4" },
      ],
    };
    mockTenderRepository.findById.mockResolvedValue(mockTender);
    mockPdfParser.parse.mockResolvedValue(
      "Some longer text to pass length check",
    );

    // Force findSimilar to return all 4 so it triggers 2 chunks (size 3 and 1)
    vi.spyOn(VectorSearchService.prototype, "findSimilar").mockReturnValue([
      { id: "req-1", similarity: 0.9 },
      { id: "req-2", similarity: 0.9 },
      { id: "req-3", similarity: 0.9 },
      { id: "req-4", similarity: 0.9 },
    ]);

    // Mock compareBatch to return results for all IDs
    mockTenderAnalyzer.compareBatch.mockImplementation((reqs) => {
      const m = new Map();
      reqs.forEach((r: any) => m.set(r.id, { status: "COMPLIANT", score: 90 }));
      return Promise.resolve(m);
    });

    const results = await validateProposal.execute(
      "tender-123",
      Buffer.from("pdf"),
    );
    expect(results).toHaveLength(4);
    // BATCH_CHUNK_SIZE is 3, so 4 reqs = 2 batches
    expect(mockTenderAnalyzer.compareBatch).toHaveBeenCalledTimes(2);
  });
});
