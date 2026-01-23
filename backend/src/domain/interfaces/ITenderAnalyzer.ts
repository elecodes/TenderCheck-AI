import type { TenderAnalysis } from "../entities/TenderAnalysis.js";

export interface ITenderAnalyzer {
  analyze(text: string): Promise<TenderAnalysis>;
}
