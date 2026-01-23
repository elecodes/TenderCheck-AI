import { describe, it, expect, vi } from 'vitest';
import { PdfParserAdapter } from '../src/infrastructure/adapters/PdfParserAdapter.js';

// Mock pdf-parse
vi.mock('pdf-parse', () => {
  return {
    default: vi.fn().mockImplementation(async (buffer: Buffer) => {
      if (buffer.toString() === 'bad') throw new Error('Corrupt PDF');
      return { text: 'Extracted PDF Content' };
    }),
  };
});

describe('PdfParserAdapter', () => {
  it('should extract text from valid buffer', async () => {
    const adapter = new PdfParserAdapter();
    const result = await adapter.parse(Buffer.from('good'));
    expect(result).toBe('Extracted PDF Content');
  });

  it('should throw AppError on failure', async () => {
    const adapter = new PdfParserAdapter();
    await expect(adapter.parse(Buffer.from('bad'))).rejects.toThrow('Failed to parse PDF');
  });
});
