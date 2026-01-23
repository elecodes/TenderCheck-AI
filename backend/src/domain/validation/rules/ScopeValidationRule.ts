import type { IRule } from "../../interfaces/IRule.js";
import type { TenderAnalysis } from "../../entities/TenderAnalysis.js";
import type { ValidationResult } from "../../entities/ValidationResult.js";

export class ScopeValidationRule implements IRule {
  id = "scope-validation";
  
  private readonly positiveKeywords = ['software', 'digital', 'plataforma', 'app', 'sistema', 'informático', 'tecnológico', 'licencias', 'cloud', 'seguridad'];
  private readonly negativeKeywords = ['limpieza', 'obra', 'construcción', 'mantenimiento vial', 'jardinería', 'seguridad física'];

  async validate(analysis: TenderAnalysis): Promise<ValidationResult | null> {
    const textToCheck = (analysis.tenderTitle + ' ' + (analysis.requirements?.map(r => r.text).join(' ') || '')).toLowerCase();

    // Check for negative keywords first (Fail fast)
    for (const neg of this.negativeKeywords) {
      if (textToCheck.includes(neg)) {
        return {
          requirementId: 'SCOPE_CHECK',
          status: 'NOT_MET',
          reasoning: `Tender appears to be out of scope. Detected negative keyword: "${neg}". This system is optimized for digital services.`,
          confidence: 0.9,
          evidence: {
            text: `Detected match for exclusionary keyword: ${neg}`,
            pageNumber: 0
          }
        };
      }
    }

    // Check for positive keywords
    const hasPositive = this.positiveKeywords.some(pos => textToCheck.includes(pos));
    if (!hasPositive) {
      return {
        requirementId: 'SCOPE_CHECK',
        status: 'AMBIGUOUS',
        reasoning: `Could not definitively categorize this as a digital/software tender. Found no relevant keywords.`,
        confidence: 0.6,
        evidence: {
          text: "No positive keywords found in title or requirements.",
          pageNumber: 0
        }
      };
    }

    // Passed
    return {
        requirementId: 'SCOPE_CHECK',
        status: 'MET',
        reasoning: "Tender aligns with digital services scope.",
        confidence: 0.85
    };
  }
}
