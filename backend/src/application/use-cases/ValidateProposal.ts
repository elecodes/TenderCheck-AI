import type { ITenderRepository } from '../../domain/repositories/ITenderRepository.js';
import type { IPdfParser } from '../../domain/interfaces/IPdfParser.js';
import type { ITenderAnalyzer } from '../../domain/interfaces/ITenderAnalyzer.js';
import type { ILegalDataSource } from '../../domain/interfaces/ILegalDataSource.js';
import { AppError } from '../../domain/errors/AppError.js';
import type { ValidationResult } from '../../domain/entities/ValidationResult.js';

export class ValidateProposal {
  constructor(
    private readonly tenderRepository: ITenderRepository,
    private readonly pdfParser: IPdfParser,
    private readonly tenderAnalyzer: ITenderAnalyzer,
    private readonly legalService: ILegalDataSource
  ) {}

  async execute(tenderId: string, proposalBuffer: Buffer): Promise<ValidationResult[]> {
    // 1. Fetch Tender
    const tender = await this.tenderRepository.findById(tenderId);
    if (!tender) {
      throw AppError.notFound(`Tender with ID ${tenderId} not found`);
    }

    // 2. Parse Proposal PDF
    const proposalText = await this.pdfParser.parse(proposalBuffer);
    if (!proposalText || proposalText.length < 50) {
      throw AppError.badRequest("Proposal PDF seems empty or unreadable");
    }

    // 3. Compare Requirements vs Proposal
    const results: ValidationResult[] = [];
    const requirements = tender.requirements || []; 

    // Limit to first 5 requirements for MVP performance/quota safety
    for (const req of requirements.slice(0, 5)) {
        // Relaxed condition for testing: Allow 'UNKNOWN' types too if needed, or stick to MANDATORY
        if (req.type === 'MANDATORY' || req.type === 'UNKNOWN') {
            // New Phase 7 Logic: Search for legal context
            // We search using the requirement text itself to find relevant laws
            const legalCitations = await this.legalService.citationSearch(req.text);

            const legalContext = legalCitations.map(c => `${c.article}: ${c.text}`);

            const comparison = await this.tenderAnalyzer.compareProposal(req.text, proposalText, legalContext);
            
            results.push({
                requirementId: req.id,
                status: comparison.status === 'COMPLIANT' ? 'MET' : 'NOT_MET',
                reasoning: comparison.reasoning,
                confidence: comparison.score / 100,
                evidence: {
                    text: comparison.sourceQuote || "No evidence found",
                    pageNumber: 0 // Mock page
                },
                legalCitations: legalCitations.map(c => ({
                    article: c.article,
                    text: c.text,
                    relevance: c.relevance
                }))
            });
        }
    }

    // 4. Update Tender Entity with new results (Or separate Proposal entity?)
    // For MVP, we overwrite 'results' or append? 
    // Ideally, TenderAnalysis results field IS the validation result.
    tender.results = [...(tender.results || []), ...results];
    await this.tenderRepository.save(tender);

    return results;
  }
}
