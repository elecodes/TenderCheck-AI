import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LocalRAGLegalService } from './LocalRAGLegalService.js';

// Mock OpenAI
const mockCreateEmbedding = vi.fn();
vi.mock('openai', () => {
  return {
    default: class {
      embeddings = {
        create: mockCreateEmbedding
      };
    }
  };
});

describe('LocalRAGLegalService', () => {
  let service: LocalRAGLegalService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new LocalRAGLegalService('fake-key');
  });

  it('should return relevant citations when query matches content', async () => {
    // 1. Mock the embedding response for the QUERY
    // Return a vector that aligns with "Article 100" (Budget)
    // We cheat by making the mock return a specific vector we know, 
    // but since we blindly calculate cosine of "A vs B", we just need consistent returns.
    
    // Simplified: We Mock implementation to return a "vector of 1s" for everything 
    // so cosine similarity is 1.0 (perfect match)
    mockCreateEmbedding.mockResolvedValue({
      data: [{ embedding: [1, 1, 1] }]
    });

    const results = await service.citationSearch('presupuesto');

    // Since our mock embedding always returns [1,1,1] and the service embeds the docs with [1,1,1],
    // everything will match perfectly (relevance 1.0).
    // This tests the flow, not the math.
    expect(results.length).toBeGreaterThan(0);
    if (results[0]) {
        expect(results[0].relevance).toBeCloseTo(1.0);
    }
    expect(mockCreateEmbedding).toHaveBeenCalled();
  });

  it('should handle undefined embeddings gracefully', async () => {
     mockCreateEmbedding.mockResolvedValue({
      data: [] // Empty
    });

    const results = await service.citationSearch('test');
    expect(results).toEqual([]);
  });
});
