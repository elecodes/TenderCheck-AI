export interface ComparisonResult {
  requirementId: string;
  status: "COMPLIANT" | "NON_COMPLIANT" | "PARTIAL";
  score: number; // 0-100
  reasoning: string;
  sourceQuote: string; // Evidence from the proposal
  pageNumber: number;
}
