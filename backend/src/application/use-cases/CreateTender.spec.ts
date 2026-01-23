import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateTender } from './CreateTender.js';
import type { ITenderRepository } from '../../domain/repositories/ITenderRepository.js';
// Note: Depending on project structure, ITenderRepository might be in interfaces. Assuming interfaces based on previous file views.
// Actually, I should use the path I saw in CreateTender.ts before: '../../domain/repositories/ITenderRepository' was in the import, but I injected it using '../../domain/interfaces/ITenderRepository.js' in the new code.
// Let's stick to '../../domain/interfaces/ITenderRepository.js' if that's where I assumed it was. 
// Wait, previous CreateTender had `import { ITenderRepository } from '../../domain/repositories/ITenderRepository';`
// I changed it to `domain/interfaces`. I should check where it actually is.
// But mostly I need to mock it.

import type { IPdfParser } from '../../domain/interfaces/IPdfParser.js';
import { RequirementsExtractor } from '../../domain/services/RequirementsExtractor.js';

describe('CreateTender Use Case', () => {
  let createTender: CreateTender;
  let mockRepository: any;
  let mockPdfParser: any;
  let mockExtractor: any;

  beforeEach(() => {
    mockRepository = {
      save: vi.fn(),
    };
    mockPdfParser = {
      parse: vi.fn(),
    };
    mockExtractor = {
      extract: vi.fn(),
    };
    const mockValidationEngine = {
      validate: vi.fn().mockResolvedValue([]),
    } as any;

    createTender = new CreateTender(mockRepository, mockPdfParser, mockExtractor, mockValidationEngine);
  });

  it('should parse PDF, extract requirements, and save tender', async () => {
    const title = 'Test Tender';
    const buffer = Buffer.from('fake pdf content');
    const fileName = 'test.pdf';
    const extractedText = 'This tender must be great.';
    const mockRequirements = [{ id: '1', description: 'Must be great', priority: 'MANDATORY', source: 'pliego' }];

    mockPdfParser.parse.mockResolvedValue(extractedText);
    mockExtractor.extract.mockReturnValue(mockRequirements);

    const result = await createTender.execute(title, buffer, fileName);

    expect(mockPdfParser.parse).toHaveBeenCalledWith(buffer);
    expect(mockExtractor.extract).toHaveBeenCalledWith(extractedText);
    expect(mockRepository.save).toHaveBeenCalled();
    expect(result.requirements).toEqual(mockRequirements);
    expect(result.status).toBe('COMPLETED');
    expect(result.documentUrl).toBe(fileName);
  });
});
