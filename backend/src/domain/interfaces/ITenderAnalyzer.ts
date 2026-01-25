import type { TenderAnalysis } from "../entities/TenderAnalysis.js";

export interface ITenderAnalyzer {
  analyze(text: string): Promise<TenderAnalysis>;
  compareProposal(
    requirementText: string,
    proposalText: string,
  ): Promise<{
    status: "COMPLIANT" | "NON_COMPLIANT" | "PARTIAL";
    reasoning: string;
    score: number;
    sourceQuote: string;
  }>;
}
