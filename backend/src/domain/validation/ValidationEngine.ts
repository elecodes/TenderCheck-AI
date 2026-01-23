import type { TenderAnalysis } from "../entities/TenderAnalysis.js";
import type { ValidationResult } from "../entities/ValidationResult.js";
import type { IRule } from "../interfaces/IRule.js";

export class ValidationEngine {
  constructor(private readonly rules: IRule[]) {}

  async validate(analysis: TenderAnalysis): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    for (const rule of this.rules) {
      const result = await rule.validate(analysis);
      if (result) {
        results.push(result);
      }
    }

    return results;
  }
}
