import { randomUUID } from 'crypto';
import type { ITenderRepository } from '../../domain/repositories/ITenderRepository.js';
import type { IPdfParser } from '../../domain/interfaces/IPdfParser.js';
import type { RequirementsExtractor } from '../../domain/services/RequirementsExtractor.js';
import type { TenderAnalysis } from '../../domain/entities/TenderAnalysis.js';
import type { ValidationEngine } from '../../domain/validation/ValidationEngine.js';

export class CreateTender {
  constructor(
    private readonly tenderRepository: ITenderRepository,
    private readonly pdfParser: IPdfParser,
    private readonly requirementsExtractor: RequirementsExtractor,
    private readonly validationEngine: ValidationEngine
  ) {}

  async execute(
    tenderTitle: string,
    fileBuffer: Buffer,
    originalFileName: string,
  ): Promise<TenderAnalysis> {
    // 1. Parse PDF
    const text = await this.pdfParser.parse(fileBuffer);

    // 2. Extract Requirements
    const requirements = this.requirementsExtractor.extract(text);

    // 3. Create Tender Entity
    const newTender: TenderAnalysis = {
      id: randomUUID(),
      tenderTitle,
      documentUrl: originalFileName, // Placeholder for actual storage URL
      status: "PROCESSING", 
      createdAt: new Date(),
      updatedAt: new Date(),
      requirements: requirements,
      results: [],
    };

    // 4. Validate (e.g. Scope Check)
    const validationResults = await this.validationEngine.validate(newTender);
    newTender.results = validationResults;
    newTender.status = "COMPLETED"; // Or FAILED/PARTIAL based on results if needed

    // 5. Save
    await this.tenderRepository.save(newTender);

    return newTender;
  }
}
