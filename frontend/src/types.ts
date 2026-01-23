export interface Requirement {
  id: string;
  text: string;
  type: "MANDATORY" | "OPTIONAL" | "UNKNOWN";
  source: {
    pageNumber: number;
    snippet: string;
  };
  keywords: string[];
  confidence: number;
}

export interface ValidationResult {
  requirementId: string;
  status: "MET" | "NOT_MET" | "PARTIALLY_MET" | "AMBIGUOUS";
  evidence?: {
    text: string;
    pageNumber: number;
  };
  reasoning: string;
  confidence: number;
}

export interface TenderAnalysis {
  id: string;
  tenderTitle: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  requirements?: Requirement[];
  results?: ValidationResult[];
  createdAt: string;
}
