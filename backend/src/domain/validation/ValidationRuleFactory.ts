import { TursoDatabase } from "../../infrastructure/database/TursoDatabase.js";
import { ScopeValidationRule } from "./rules/ScopeValidationRule.js";
import type { IRule } from "../interfaces/IRule.js";

export class ValidationRuleFactory {
  static async createRules(industryName?: string): Promise<IRule[]> {
    const db = TursoDatabase.getInstance();
    const targetIndustry = industryName || "Digital Services";

    try {
      const result = await db.execute({
        sql: "SELECT positive_keywords, negative_keywords FROM industry_presets WHERE name = ?",
        args: [targetIndustry],
      });

      if (result.rows.length > 0 && result.rows[0]) {
        const row = result.rows[0];
        const positives = JSON.parse((row.positive_keywords as string) || "[]");
        const negatives = JSON.parse((row.negative_keywords as string) || "[]");

        return [new ScopeValidationRule(positives, negatives)];
      }
    } catch (error) {
      console.error("Error fetching industry presets:", error);
    }

    // Fallback to basic Digital Services defaults if DB fails or industry not found
    return [
      new ScopeValidationRule(
        [
          "software",
          "digital",
          "plataforma",
          "app",
          "sistema",
          "informático",
          "tecnológico",
          "cloud",
        ],
        ["limpieza", "obra", "construcción"],
      ),
    ];
  }
}
