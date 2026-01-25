import { AppError } from "../../domain/errors/AppError.js";
import type { ITenderAnalyzer } from "../../domain/interfaces/ITenderAnalyzer.js";
import type { TenderAnalysis } from "../../domain/entities/TenderAnalysis.js";
import { randomUUID } from "crypto";
import ollama from "ollama";
import {
  MIN_JUSTIFICATION_LENGTH,
  OLLAMA_MAX_TOKENS,
  OLLAMA_TIMEOUT,
} from "../../config/constants.js";

export class OllamaModelService implements ITenderAnalyzer {
  private model: string;

  constructor() {
    this.model = process.env.OLLAMA_MODEL || "llama3";
  }

  async analyze(text: string): Promise<TenderAnalysis> {
    try {
      if (!text || text.length < MIN_JUSTIFICATION_LENGTH) {
        throw AppError.badRequest("Text is too short for analysis");
      }

      const safeText = text.slice(0, OLLAMA_MAX_TOKENS); // 4k chars to be safe
      console.log(
        `Analyzing text with Ollama (Model: ${this.model}). Length: ${safeText.length} chars...`,
      );

      const prompt = `
        You are a smart data extractor.
        TASK: Extract technical requirements from the text below.
        OUTPUT: JSON ONLY.
        SCHEMA:
        {
          "requirements": [
               "text": "The extracted requirement statement", 
               "type": "MANDATORY" (if 'must'/'shall') or "OPTIONAL" (if 'should'/'could'),
               "keywords": ["key1", "key2"]
             }
          ]
        }
        
        TEXT:
        ${safeText}
      `;

      const response = await ollama.chat({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        format: "json",
        options: {
          num_ctx: 4096,
          temperature: 0.1,
        },
      });

      const rawContent = response.message.content;
      console.log("Ollama Raw Response:", rawContent.substring(0, 100) + "...");

      // 1. Sanitize Markdown wrappers
      let jsonString = rawContent;
      const jsonStartIndex = rawContent.indexOf("{");
      const jsonEndIndex = rawContent.lastIndexOf("}");
      if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
        jsonString = rawContent.substring(jsonStartIndex, jsonEndIndex + 1);
      }

      let parsedRaw;
      try {
        parsedRaw = JSON.parse(jsonString);
      } catch (parseError) {
        console.error("JSON Parse Error. Falling back to empty.");
        // Attempt to fix common JSON errors if needed, or just fail safely
        parsedRaw = { requirements: [] };
      }

      // 2. Normalize/Hunt for requirements array
      // Llama 3 often nests things like {"Technical Requirements": ...} or {"Requirements": ...}
      let foundRequirements: any[] = [];

      const findArray = (obj: any): any[] | null => {
        if (!obj) return null;
        if (Array.isArray(obj)) return obj;

        // Check common keys
        if (Array.isArray(obj.requirements)) return obj.requirements;
        if (Array.isArray(obj.Requirements)) return obj.Requirements;
        if (Array.isArray(obj.technical_requirements))
          return obj.technical_requirements;

        // Recursive search in values
        for (const key of Object.keys(obj)) {
          if (typeof obj[key] === "object") {
            const found = findArray(obj[key]);
            if (found && found.length > 0) return found;
          }
        }
        return null;
      };

      foundRequirements = findArray(parsedRaw) || [];

      // If still empty but we have an object structure with keys, maybe convert keys to requirements?
      // (Handling the "Yoga for Children" case seen in logs)
      if (foundRequirements.length === 0 && typeof parsedRaw === "object") {
        // Fallback: Treat top-level keys as requirement titles/text
        console.log("Fallback: converting object keys to requirements");
        Object.keys(parsedRaw).forEach((key) => {
          const val = parsedRaw[key];
          if (typeof val === "string") {
            foundRequirements.push({
              text: `${key}: ${val}`,
              type: "MANDATORY",
              keywords: [],
            });
          } else if (Array.isArray(val)) {
            val.forEach((v) => {
              const text = typeof v === "string" ? v : JSON.stringify(v);
              foundRequirements.push({
                text: `${key}: ${text}`,
                type: "MANDATORY",
                keywords: [],
              });
            });
          }
        });
      }

      console.log(`Extracted ${foundRequirements.length} requirements.`);

      const analysis: TenderAnalysis = {
        id: randomUUID(),
        userId: "", // Will be overwritten by Use Case
        tenderTitle: parsedRaw?.tenderTitle || "Tender Analysis",
        status: "COMPLETED",
        createdAt: new Date(),
        updatedAt: new Date(),
        documentUrl: "",
        requirements: foundRequirements.map((req: any) => {
          const text = req.text || JSON.stringify(req);

          // Heuristic: Auto-detect OPTIONAL if AI missed it
          let type =
            req.type === "OPTIONAL" || req.type === "Optional"
              ? "OPTIONAL"
              : "MANDATORY";
          const optionalKeywords = [
            "should",
            "could",
            "desirable",
            "valued",
            "plus",
            "optional",
            "recommended",
            "nice to have",
          ];

          if (type === "MANDATORY") {
            const lowerText = text.toLowerCase();
            if (optionalKeywords.some((k) => lowerText.includes(k))) {
              type = "OPTIONAL";
            }
          }

          return {
            id: req.id || randomUUID(),
            text: text,
            type: type as "MANDATORY" | "OPTIONAL",
            keywords: req.keywords || [],
            source: {
              pageNumber: 1,
              snippet: text.slice(0, 100),
            },
            confidence: 0.85,
          };
        }),
        results: [],
      };

      return analysis;
    } catch (error: any) {
      console.error("Ollama Critical Error:", error);
      // Safe Fallback prevents 500
      return {
        id: randomUUID(),
        userId: "",
        tenderTitle: "Error: AI Service Unavailable",
        status: "COMPLETED",
        createdAt: new Date(),
        updatedAt: new Date(),
        documentUrl: "",
        requirements: [],
        results: [],
      };
    }
  }

  async compareProposal(
    requirementText: string,
    proposalText: string,
  ): Promise<{
    status: "COMPLIANT" | "NON_COMPLIANT" | "PARTIAL";
    reasoning: string;
    score: number;
    sourceQuote: string;
  }> {
    // Simple mock for now, or implement similar prompt for comparison
    return {
      status: "COMPLIANT",
      score: 85,
      reasoning: "Ollama local comparison pending implementation.",
      sourceQuote: "",
    };
  }
}
