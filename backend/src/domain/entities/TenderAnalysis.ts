import type { Requirement } from "./Requirement.js";
import type { ValidationResult } from "./ValidationResult.js";

export type AnalysisStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface TenderAnalysis {
  id: string;
  userId: string;
  tenderTitle: string;
  documentUrl: string; // Path or URL to the uploaded PDF
  status: AnalysisStatus;
  createdAt: Date;
  updatedAt: Date;

  // Extracted requirements from the Tender
  requirements?: Requirement[];

  // Validation results after comparing with a proposal
  results?: ValidationResult[];

  // Metadata
  metadata?: {
    pageCount?: number;
    processingTimeMs?: number;
    modelVersion?: string;
  };
}
