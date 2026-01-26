import type { ITenderRepository } from "../../domain/repositories/ITenderRepository.js";
import type { IPdfParser } from "../../domain/interfaces/IPdfParser.js";
import type { ITenderAnalyzer } from "../../domain/interfaces/ITenderAnalyzer.js";
import { AppError } from "../../domain/errors/AppError.js";
import type { ValidationResult } from "../../domain/entities/ValidationResult.js";
import {
  MIN_JUSTIFICATION_LENGTH,
  MIN_ITEMS_LENGTH,
} from "../../config/constants.js";

export class ValidateProposal {
  constructor(
    private readonly tenderRepository: ITenderRepository,
    private readonly pdfParser: IPdfParser,
    private readonly tenderAnalyzer: ITenderAnalyzer,
  ) {}

  async execute(
    tenderId: string,
    proposalBuffer: Buffer,
  ): Promise<ValidationResult[]> {
    // 1. Fetch Tender
    const tender = await this.tenderRepository.findById(tenderId);
    if (!tender) {
      throw AppError.notFound(`Tender with ID ${tenderId} not found`);
    }

    // 2. Parse Proposal PDF
    const proposalText = await this.pdfParser.parse(proposalBuffer);
    if (!proposalText || proposalText.length < MIN_JUSTIFICATION_LENGTH) {
      throw AppError.badRequest("Proposal PDF seems empty or unreadable");
    }

    // 3. Compare Requirements vs Proposal
    const results: ValidationResult[] = [];
    const requirements = tender.requirements || [];

    // Limit items for performance in MVP
    const itemsToAnalyze = requirements.slice(0, 10);

    for (const req of itemsToAnalyze) {
      const comparison = await this.tenderAnalyzer.compareProposal(
        req.text,
        proposalText,
      );

      results.push({
        requirementId: req.id,
        status: comparison.status === "COMPLIANT" ? "MET" : "NOT_MET",
        reasoning: comparison.reasoning,
        confidence: comparison.score / 100,
        evidence: {
          text: comparison.sourceQuote || "No evidence found",
          pageNumber: 0, // Mock page
        },
      });
    }

    // 4. Update Tender Entity
    // We keep the SCOPE_CHECK if it was there, but replace any previous requirement validation
    const scopeCheck = (tender.results || []).find(
      (r) => r.requirementId === "SCOPE_CHECK",
    );
    tender.results = scopeCheck ? [scopeCheck, ...results] : results;

    await this.tenderRepository.save(tender);

    return results;
  }
}
