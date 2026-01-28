import type { ITenderRepository } from "../../domain/repositories/ITenderRepository.js";
import type { IPdfParser } from "../../domain/interfaces/IPdfParser.js";
import type { ITenderAnalyzer } from "../../domain/interfaces/ITenderAnalyzer.js";
import { AppError } from "../../domain/errors/AppError.js";
import type { TenderAnalysis } from "../../domain/entities/TenderAnalysis.js";
import { VectorSearchService } from "../../infrastructure/services/VectorSearchService.js";
import { TursoDatabase } from "../../infrastructure/database/TursoDatabase.js";

export class CreateTender {
  private vectorSearch: VectorSearchService;

  constructor(
    private readonly tenderRepository: ITenderRepository,
    private readonly pdfParser: IPdfParser,
    private readonly tenderAnalyzer: ITenderAnalyzer,
  ) {
    this.vectorSearch = new VectorSearchService();
  }

  async execute(userId: string, pdfBuffer: Buffer): Promise<TenderAnalysis> {
    // 1. Parse PDF
    const text = await this.pdfParser.parse(pdfBuffer);
    if (!text) {
      throw AppError.badRequest("Could not extract text from PDF");
    }

    // 2. Analyze with AI
    const analysis = await this.tenderAnalyzer.analyze(text);
    analysis.userId = userId;

    // 3. Generate embeddings for requirements (for vector search)
    if (analysis.requirements && analysis.requirements.length > 0) {
      console.log(
        `Generating embeddings for ${analysis.requirements.length} requirements...`,
      );

      for (const req of analysis.requirements) {
        const embedding = await this.vectorSearch.generateEmbedding(req.text);
        const embeddingBuffer = this.vectorSearch.serializeEmbedding(embedding);
        // Store embedding in requirement object for repository to save
        (req as any).embedding = embeddingBuffer;
      }

      console.log("✅ Embeddings generated successfully");
    }

    // 4. Save to repository (including embeddings)
    await this.tenderRepository.save(analysis);

    return analysis;
  }
}
