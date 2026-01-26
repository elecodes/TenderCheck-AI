import type { ITenderRepository } from "../../domain/repositories/ITenderRepository.js";
import type { IPdfParser } from "../../domain/interfaces/IPdfParser.js";
import type { ITenderAnalyzer } from "../../domain/interfaces/ITenderAnalyzer.js";
import { AppError } from "../../domain/errors/AppError.js";
import type { ValidationResult } from "../../domain/entities/ValidationResult.js";
import {
  MIN_JUSTIFICATION_LENGTH,
  BATCH_CHUNK_SIZE,
  DEFAULT_CONFIDENCE_SCORE,
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

    // Chunk size for batch processing
    const chunks = [];
    for (let i = 0; i < requirements.length; i += BATCH_CHUNK_SIZE) {
      chunks.push(requirements.slice(i, i + BATCH_CHUNK_SIZE));
    }

    console.log(
      `Processing ${requirements.length} requirements in ${chunks.length} batches...`,
    );

    const batchPromises = chunks.map(async (chunk) => {
      const batchResults = await this.tenderAnalyzer.compareBatch(
        chunk.map((r) => ({ id: r.id, text: r.text })),
        proposalText,
      );

      return chunk.map((req) => {
        const comparison = batchResults.get(req.id);
        return {
          requirementId: req.id,
          status: (comparison?.status === "COMPLIANT" ? "MET" : "NOT_MET") as
            | "MET"
            | "NOT_MET",
          reasoning: comparison?.reasoning || "Validación automática.",
          confidence: (comparison?.score || DEFAULT_CONFIDENCE_SCORE) / 100,
          evidence: {
            text:
              comparison?.sourceQuote || "No se encontró evidencia específica.",
            pageNumber: 0,
          },
        };
      });
    });

    const resultsMatrix = await Promise.all(batchPromises);
    results.push(...resultsMatrix.flat());

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
