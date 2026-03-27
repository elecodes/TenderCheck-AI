import type { TenderAnalysis } from "../entities/TenderAnalysis.js";
import type { Requirement } from "../entities/Requirement.js";
import type { PageChunk } from "../../infrastructure/utils/chunking.js";

export interface ChunkAnalysisResult {
  chunkIndex: number;
  startPage: number;
  endPage: number;
  requirements: Requirement[];
  error?: string;
}

export interface ITenderAnalyzer {
  analyze(text: string): Promise<TenderAnalysis>;
  analyzeChunk(chunk: PageChunk): Promise<ChunkAnalysisResult>;
  analyzeChunks(chunks: PageChunk[]): Promise<ChunkAnalysisResult[]>;
  compareProposal(
    requirementText: string,
    proposalText: string,
  ): Promise<{
    status: "COMPLIANT" | "NON_COMPLIANT" | "PARTIAL";
    reasoning: string;
    score: number;
    sourceQuote: string;
  }>;
  compareBatch(
    requirements: { id: string; text: string }[],
    proposalText: string,
  ): Promise<
    Map<
      string,
      {
        status: "COMPLIANT" | "NON_COMPLIANT" | "PARTIAL";
        reasoning: string;
        score: number;
        sourceQuote: string;
      }
    >
  >;
}
