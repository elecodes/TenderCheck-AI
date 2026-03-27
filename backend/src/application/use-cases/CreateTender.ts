import type { ITenderRepository } from "../../domain/repositories/ITenderRepository.js";
import type { IPdfParser } from "../../domain/interfaces/IPdfParser.js";
import type { ITenderAnalyzer } from "../../domain/interfaces/ITenderAnalyzer.js";
import { AppError } from "../../domain/errors/AppError.js";
import type { TenderAnalysis } from "../../domain/entities/TenderAnalysis.js";
import type { Requirement } from "../../domain/entities/Requirement.js";
import { VectorSearchService } from "../../infrastructure/services/VectorSearchService.js";
import {
  chunkPages,
  getTotalChunks,
  type PageChunk,
} from "../../infrastructure/utils/chunking.js";
import { ValidationRuleFactory } from "../../domain/validation/ValidationRuleFactory.js";
import { ValidationEngine } from "../../domain/validation/ValidationEngine.js";
import {
  PAGES_PER_CHUNK,
  CHUNK_MAX_CHARS,
  CHUNK_PARALLEL_PROCESSING,
  LARGE_PDF_THRESHOLD,
} from "../../config/constants.js";

export class CreateTender {
  constructor(
    private readonly tenderRepository: ITenderRepository,
    private readonly pdfParser: IPdfParser,
    private readonly tenderAnalyzer: ITenderAnalyzer,
    private readonly vectorSearch: VectorSearchService,
  ) {}

  async execute(
    userId: string,
    pdfBuffer: Buffer,
    industry?: string,
  ): Promise<TenderAnalysis> {
    const pageCount = await this.pdfParser.getPageCount(pdfBuffer);
    console.log(`📄 PDF has ${pageCount} pages`);

    let analysis: TenderAnalysis;

    if (pageCount > LARGE_PDF_THRESHOLD) {
      console.log(
        `📑 Large PDF detected (${pageCount} pages). Using chunked processing...`,
      );
      analysis = await this.processLargePdf(userId, pdfBuffer, pageCount);
    } else {
      analysis = await this.processStandardPdf(userId, pdfBuffer);
    }

    const rules = await ValidationRuleFactory.createRules(industry);
    const engine = new ValidationEngine(rules);
    const validationResults = await engine.validate(analysis);

    if (validationResults.length > 0) {
      (analysis as any).scopeValidation = validationResults[0];
    }

    if (analysis.requirements && analysis.requirements.length > 0) {
      console.log(
        `Generating embeddings for ${analysis.requirements.length} requirements...`,
      );
      for (const req of analysis.requirements) {
        const embedding = await this.vectorSearch.generateEmbedding(req.text);
        const embeddingBuffer = this.vectorSearch.serializeEmbedding(embedding);
        (req as any).embedding = embeddingBuffer;
      }
      console.log("✅ Embeddings generated successfully");
    }

    await this.tenderRepository.save(analysis);
    return analysis;
  }

  private async processStandardPdf(
    userId: string,
    pdfBuffer: Buffer,
  ): Promise<TenderAnalysis> {
    const text = await this.pdfParser.parse(pdfBuffer);
    if (!text) {
      throw AppError.badRequest("Could not extract text from PDF");
    }

    const analysis = await this.tenderAnalyzer.analyze(text);
    analysis.userId = userId;
    return analysis;
  }

  private async processLargePdf(
    userId: string,
    pdfBuffer: Buffer,
    pageCount: number,
  ): Promise<TenderAnalysis> {
    const pages = await this.pdfParser.parsePages(pdfBuffer);
    if (!pages || pages.length === 0) {
      throw AppError.badRequest("Could not extract pages from PDF");
    }

    const totalChunks = getTotalChunks(pageCount, PAGES_PER_CHUNK);
    console.log(
      `🔀 Created ${totalChunks} chunks (${PAGES_PER_CHUNK} pages each)`,
    );

    const chunks = chunkPages(pages, {
      pagesPerChunk: PAGES_PER_CHUNK,
      maxCharsPerChunk: CHUNK_MAX_CHARS,
    });

    const chunkResults = await this.tenderAnalyzer.analyzeChunks(chunks);

    const allRequirements: Requirement[] = [];
    let summary = "";

    for (const result of chunkResults) {
      if (result.error) {
        console.warn(`⚠️ Chunk ${result.chunkIndex} failed: ${result.error}`);
        continue;
      }

      allRequirements.push(...result.requirements);

      if (!summary && result.requirements.length > 0) {
        summary = `Análisis de ${pageCount} páginas distribuido en ${totalChunks} chunks.`;
      }
    }

    if (allRequirements.length === 0) {
      throw AppError.badRequest(
        "No requirements could be extracted from any chunk",
      );
    }

    console.log(`📊 Total requirements extracted: ${allRequirements.length}`);

    return {
      id: crypto.randomUUID(),
      userId,
      tenderTitle: `Tender Analysis (${pageCount} pages)`,
      documentUrl: "",
      status: "COMPLETED",
      createdAt: new Date(),
      updatedAt: new Date(),
      requirements: allRequirements,
      results: [],
    };
  }
}
