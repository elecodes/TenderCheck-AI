import { describe, it, expect, vi, beforeEach } from "vitest";
import { VectorSearchService } from "../../../src/infrastructure/services/VectorSearchService.js";

// Mock genkit
const mockEmbed = vi.fn();
vi.mock("genkit", () => ({
  genkit: () => ({
    embed: (...args: any[]) => mockEmbed(...args),
  }),
}));

vi.mock("@genkit-ai/google-genai", () => ({
  googleAI: vi.fn(),
}));

// Mock telemetry
vi.mock("../../../src/config/genkit-telemetry.js", () => ({
  genkitTelemetry: {
    logFlowStart: vi.fn(),
    logFlowComplete: vi.fn(),
    logFlowError: vi.fn(),
    logVectorSearch: vi.fn(),
  },
}));

describe("VectorSearchService", () => {
  let service: VectorSearchService;

  beforeEach(() => {
    service = new VectorSearchService();
    mockEmbed.mockReset();
  });

  describe("generateEmbedding", () => {
    it("should return an embedding vector", async () => {
      const mockVector = new Float32Array([0.1, 0.2, 0.3]);
      mockEmbed.mockResolvedValueOnce({ embedding: Array.from(mockVector) });

      const result = await service.generateEmbedding("test text");

      expect(mockEmbed).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Float32Array);
      expect(result.length).toBe(3);
      expect(result[0]).toBeCloseTo(0.1);
    });

    it("should handle array response from genkit", async () => {
      const mockVector = new Float32Array([0.1, 0.2, 0.3]);
      mockEmbed.mockResolvedValueOnce([{ embedding: Array.from(mockVector) }]);

      const result = await service.generateEmbedding("test text");

      expect(result).toBeInstanceOf(Float32Array);
      expect(result.length).toBe(3);
    });

    it("should return zero vector on error", async () => {
      mockEmbed.mockRejectedValueOnce(new Error("API Error"));

      const result = await service.generateEmbedding("test text");

      expect(result).toBeInstanceOf(Float32Array);
      expect(result.length).toBe(3072); // Default dimension
      expect(result[0]).toBe(0);
    });
  });

  describe("cosineSimilarity", () => {
    it("should calculate correct similarity", () => {
      const a = new Float32Array([1, 0, 0]);
      const b = new Float32Array([1, 0, 0]);
      expect(service.cosineSimilarity(a, b)).toBe(1);

      const c = new Float32Array([0, 1, 0]);
      expect(service.cosineSimilarity(a, c)).toBe(0);
    });

    it("should handle dimension mismatch gracefully", () => {
      const a = new Float32Array([1, 0]);
      const b = new Float32Array([1, 0, 0]);
      expect(service.cosineSimilarity(a, b)).toBe(0);
    });

    it("should handle zero magnitude vectors", () => {
      const a = new Float32Array([0, 0, 0]);
      const b = new Float32Array([1, 0, 0]);
      expect(service.cosineSimilarity(a, b)).toBe(0);
    });
  });

  describe("findSimilar", () => {
    it("should find and sort similar items", () => {
      const query = new Float32Array([1, 0, 0]);
      const candidates = [
        { id: "1", embedding: new Float32Array([0, 1, 0]) }, // 0 similarity
        { id: "2", embedding: new Float32Array([0.9, 0.1, 0]) }, // High similarity
        { id: "3", embedding: new Float32Array([0.1, 0.9, 0]) }, // Low similarity
      ];

      const results = service.findSimilar(query, candidates, 0.5);

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("2");
    });
  });

  describe("serialization", () => {
    it("should serialize and deserialize correctly", () => {
      const original = new Float32Array([0.1, 0.2, 0.3]);
      const buffer = service.serializeEmbedding(original);
      const restored = service.deserializeEmbedding(buffer);

      expect(restored).toEqual(original);
    });

    it("should handle empty buffer deserialization", () => {
      const restored = service.deserializeEmbedding(Buffer.from([]));
      expect(restored.length).toBe(3072);
      expect(restored[0]).toBe(0);
    });
  });
});
