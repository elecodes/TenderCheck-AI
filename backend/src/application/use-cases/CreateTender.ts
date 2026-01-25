import { randomUUID } from "crypto";
import type { ITenderRepository } from "../../domain/repositories/ITenderRepository.js";
import type { IPdfParser } from "../../domain/interfaces/IPdfParser.js";
import type { ITenderAnalyzer } from "../../domain/interfaces/ITenderAnalyzer.js";
import type { TenderAnalysis } from "../../domain/entities/TenderAnalysis.js";
import type { ValidationEngine } from "../../domain/validation/ValidationEngine.js";

export class CreateTender {
  constructor(
    private readonly tenderRepository: ITenderRepository,
    private readonly pdfParser: IPdfParser,
    private readonly tenderAnalyzer: ITenderAnalyzer,
    private readonly validationEngine: ValidationEngine,
  ) {}

  async execute(
    userId: string,
    tenderTitle: string,
    fileBuffer: Buffer,
    originalFileName: string,
  ): Promise<TenderAnalysis> {
    // 1. Parse PDF
    const text = await this.pdfParser.parse(fileBuffer);

    // 2. Analyze with AI (Extract Requirements & Metadata)
    const newTender = await this.tenderAnalyzer.analyze(text);

    // 3. Enrich Entity
    newTender.userId = userId;
    newTender.documentUrl = originalFileName;
    // Title from AI might be better, but respect user input or fallback
    newTender.tenderTitle = tenderTitle || newTender.tenderTitle;
    newTender.status = "PROCESSING";

    // 4. Validate (e.g. Scope Check)
    const validationResults = await this.validationEngine.validate(newTender);
    newTender.results = validationResults;
    newTender.status = "COMPLETED"; // Or FAILED/PARTIAL based on results if needed

    // 5. Save
    await this.tenderRepository.save(newTender);

    return newTender;
  }
}
