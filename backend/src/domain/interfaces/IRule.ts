import type { TenderAnalysis } from "../entities/TenderAnalysis.js";
import type { ValidationResult } from "../entities/ValidationResult.js";

export interface IRule {
  id: string;
  validate(analysis: TenderAnalysis): Promise<ValidationResult | null>;
}
