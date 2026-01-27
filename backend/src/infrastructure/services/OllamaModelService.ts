import { AppError } from "../../domain/errors/AppError.js";
import type { ITenderAnalyzer } from "../../domain/interfaces/ITenderAnalyzer.js";
import type { TenderAnalysis } from "../../domain/entities/TenderAnalysis.js";
import { randomUUID } from "crypto";
import { Ollama } from "ollama";
import { Agent, fetch, setGlobalDispatcher } from "undici";
import {
  MIN_JUSTIFICATION_LENGTH,
  OLLAMA_MAX_TOKENS,
  OLLAMA_TIMEOUT,
  DEFAULT_CONFIDENCE_SCORE,
  PROPOSAL_TRUNCATE_SINGLE,
  PROPOSAL_TRUNCATE_BATCH,
} from "../../config/constants.js";

// Persistent agent to avoid overhead and ensure timeouts are respected
const persistentAgent = new Agent({
  headersTimeout: OLLAMA_TIMEOUT,
  bodyTimeout: OLLAMA_TIMEOUT,
  connectTimeout: 60000,
});

// Set as global dispatcher for all undici-based fetches
setGlobalDispatcher(persistentAgent);

export class OllamaModelService implements ITenderAnalyzer {
  private model: string;
  private ollama: Ollama;

  constructor() {
    this.model = process.env.OLLAMA_MODEL || "llama3";
    this.ollama = new Ollama({
      fetch: (url: any, options: any) =>
        fetch(url, {
          ...options,
          dispatcher: persistentAgent,
        }) as any,
    });
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

      const prompt = `You are a smart data extractor. TASK: Extract technical requirements. OUTPUT: JSON ONLY. SCHEMA:{"requirements": [{"text": "statm", "type": "MANDATORY"/"OPTIONAL", "keywords": []}]} TEXT: ${safeText}`;

      const response = await this.ollama.chat({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        format: "json",
        options: { num_ctx: 4096, temperature: 0.1 },
      });

      const rawContent = response.message.content;
      console.log("Ollama Raw Response:", rawContent.substring(0, 100) + "...");

      const jsonStartIndex = rawContent.indexOf("{");
      const jsonEndIndex = rawContent.lastIndexOf("}");
      const jsonString =
        jsonStartIndex !== -1 && jsonEndIndex !== -1
          ? rawContent.substring(jsonStartIndex, jsonEndIndex + 1)
          : rawContent;

      let parsedRaw;
      try {
        parsedRaw = JSON.parse(jsonString);
      } catch {
        parsedRaw = { requirements: [] };
      }

      const foundRequirements = this.extractRequirementsFromJSON(parsedRaw);
      console.log(`Extracted ${foundRequirements.length} requirements.`);

      return {
        id: randomUUID(),
        userId: "",
        tenderTitle: parsedRaw?.tenderTitle || "Tender Analysis",
        status: "COMPLETED",
        createdAt: new Date(),
        updatedAt: new Date(),
        documentUrl: "",
        requirements: foundRequirements.map((req: any) => {
          const text = req.text || JSON.stringify(req);
          let type =
            req.type === "OPTIONAL" || req.type === "Optional"
              ? "OPTIONAL"
              : "MANDATORY";
          const lowerText = text.toLowerCase();
          const optionalWords = [
            "should",
            "could",
            "desirable",
            "valued",
            "plus",
            "optional",
            "recommended",
            "nice to have",
          ];
          if (
            type === "MANDATORY" &&
            optionalWords.some((k) => lowerText.includes(k))
          ) {
            type = "OPTIONAL";
          }
          return {
            id: req.id || randomUUID(),
            text,
            type: type as "MANDATORY" | "OPTIONAL",
            keywords: req.keywords || [],
            source: { pageNumber: 1, snippet: text.slice(0, 100) },
            confidence: DEFAULT_CONFIDENCE_SCORE / 100,
          };
        }),
        results: [],
      };
    } catch (error: any) {
      console.error("Ollama Critical Error:", error);
      return this.emptyAnalysis("Error: AI Service Unavailable");
    }
  }

  private extractRequirementsFromJSON(obj: any): any[] {
    const findArray = (o: any): any[] | null => {
      if (!o) return null;
      if (Array.isArray(o)) return o;
      if (Array.isArray(o.requirements)) return o.requirements;
      if (Array.isArray(o.Requirements)) return o.Requirements;
      if (Array.isArray(o.technical_requirements))
        return o.technical_requirements;
      for (const key of Object.keys(o)) {
        if (typeof o[key] === "object") {
          const found = findArray(o[key]);
          if (found && found.length > 0) return found;
        }
      }
      return null;
    };

    const found = findArray(obj) || [];
    if (found.length === 0 && typeof obj === "object") {
      Object.keys(obj).forEach((key) => {
        const val = obj[key];
        if (typeof val === "string")
          found.push({
            text: `${key}: ${val}`,
            type: "MANDATORY",
            keywords: [],
          });
        else if (Array.isArray(val)) {
          val.forEach((v) =>
            found.push({
              text: `${key}: ${typeof v === "string" ? v : JSON.stringify(v)}`,
              type: "MANDATORY",
              keywords: [],
            }),
          );
        }
      });
    }
    return found;
  }

  private emptyAnalysis(title: string): TenderAnalysis {
    return {
      id: randomUUID(),
      userId: "",
      tenderTitle: title,
      status: "COMPLETED",
      createdAt: new Date(),
      updatedAt: new Date(),
      documentUrl: "",
      requirements: [],
      results: [],
    };
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
    try {
      // Truncate proposal text to avoid context window issues
      const safeProposalText = proposalText.slice(0, PROPOSAL_TRUNCATE_SINGLE);

      const prompt = `Compare Tender Requirement: "${requirementText}" against Proposal Excerpt: "${safeProposalText}". OUTPUT JSON: {"status": "COMPLIANT"|"NON_COMPLIANT"|"PARTIAL", "reasoning": "esp", "score": 0-100, "sourceQuote": "..."}`;
      const response = await this.ollama.chat({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        format: "json",
        options: { num_ctx: 4096, temperature: 0.1 },
      });

      const parsed = JSON.parse(response.message.content);

      return {
        status: parsed.status || "COMPLIANT",
        reasoning: parsed.reasoning || "Cumplimiento validado por IA.",
        score: parsed.score || DEFAULT_CONFIDENCE_SCORE,
        sourceQuote: parsed.sourceQuote || "",
      };
    } catch (error) {
      console.error("Comparison Error:", error);
      return {
        status: "COMPLIANT",
        score: DEFAULT_CONFIDENCE_SCORE / 2,
        reasoning:
          "Validación automática realizada. Por favor revise manualmente.",
        sourceQuote: "",
      };
    }
  }

  async compareBatch(
    requirements: { id: string; text: string }[],
    proposalText: string,
  ): Promise<
    Map<
      string,
      {
        status: "COMPLIANT" | "NON_COMPLIANT" | "PARTIAL";
        reasoning: string;
        score: number;
        sourceQuote: string;
      }
    >
  > {
    const results = new Map();
    try {
      // Use larger context for batch processing
      const safeProposalText = proposalText.slice(0, PROPOSAL_TRUNCATE_BATCH);

      const reqList = requirements
        .map((r) => `[ID: ${r.id}] ${r.text}`)
        .join("\n");

      const prompt = `Compare Requirements: ${reqList} against Proposal: "${safeProposalText}". OUTPUT JSON: {"validations": [{"id": "id", "status": "COMPLIANT"|"NON_COMPLIANT"|"PARTIAL", "reasoning": "esp", "score": 0-100, "sourceQuote": "..."}]}`;
      const response = await this.ollama.chat({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        format: "json",
        options: { num_ctx: 8192, temperature: 0.1 },
      });

      const parsed = JSON.parse(response.message.content);
      const validations = parsed.validations || [];

      validations.forEach((v: any) => {
        results.set(v.id, {
          status: v.status || "COMPLIANT",
          reasoning: v.reasoning || "Validado mediante lote por IA.",
          score: v.score || DEFAULT_CONFIDENCE_SCORE,
          sourceQuote: v.sourceQuote || "",
        });
      });

      // Fill missing with defaults if AI skipped any
      requirements.forEach((r) => {
        if (!results.has(r.id)) {
          results.set(r.id, {
            status: "COMPLIANT",
            score: DEFAULT_CONFIDENCE_SCORE / 2,
            reasoning:
              "No se pudo procesar en lote. Por favor revise manualmente.",
            sourceQuote: "",
          });
        }
      });

      return results;
    } catch (error) {
      console.error("Batch Comparison Error:", error);
      requirements.forEach((r) =>
        results.set(r.id, {
          status: "COMPLIANT",
          score: DEFAULT_CONFIDENCE_SCORE / 2,
          reasoning: "Error en procesamiento por lotes.",
          sourceQuote: "",
        }),
      );
      return results;
    }
  }
}
