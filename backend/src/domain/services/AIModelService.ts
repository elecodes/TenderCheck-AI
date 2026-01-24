import OpenAI from "openai";
import type { TenderAnalysis } from "../entities/TenderAnalysis.js";
import { AppError } from '../errors/AppError.js';
import type { ITenderAnalyzer } from "../interfaces/ITenderAnalyzer.js";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

// Zod schema for structured output (Reliability)
const ComparisonSchema = z.object({
  status: z.enum(['COMPLIANT', 'NON_COMPLIANT', 'PARTIAL']),
  reasoning: z.string(),
  score: z.number().min(0).max(100),
  sourceQuote: z.string()
});

export class OpenAIModelService implements ITenderAnalyzer {
  private openai: OpenAI;
  private readonly MODEL = "gpt-4o-2024-08-06"; // Turbo/Omni

  constructor() {
     // Ensure API Key is present or handle it
     const apiKey = process.env.OPENAI_API_KEY;
     if (!apiKey) {
         console.warn("OPENAI_API_KEY not set. Service will fail if not using Mock Mode.");
     }
     this.openai = new OpenAI({ apiKey: apiKey || "dummy" });
  }

  async analyze(text: string): Promise<TenderAnalysis> {
    // Placeholder implementation for 'analyze' (CreateTender flow)
    // Preserving existing behavior (throwing error) or stubbing
    throw new Error("Method analyze() not fully implemented in this phase.");
  }

  async compareProposal(
      requirementText: string, 
      proposalText: string, 
      legalContext: string[] = []
  ): Promise<{ status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PARTIAL'; reasoning: string; score: number; sourceQuote: string }> {
      
      const legalPrompt = legalContext.length > 0 
        ? `\n\nLEGAL CONTEXT (from Ley de Contratos del Sector Público):\n${legalContext.join("\n")}\n\nINSTRUCTION: Cross-reference the proposal not just against the requirement, but also ensure it doesn't violate the cited Legal Articles.`
        : "";

      const prompt = `
      You are an expert Public Tender Auditor.
      
      REQUIREMENT:
      "${requirementText}"

      PROPOSAL EXCERPT:
      "${proposalText.slice(0, 8000)}" 
      
      ${legalPrompt}

      TASK:
      Determine if the PROPOSAL meets the REQUIREMENT. 
      If Legal Context is provided, highlight potential legal risks.
      Return a JSON.
      `;

      try {
        const completion = await this.openai.chat.completions.create({
            model: this.MODEL,
            messages: [
                { role: "system", content: "You are a strict compliance auditor. Return strictly valid JSON." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
        });

        const choice = completion.choices[0];
        if (!choice || !choice.message.content) {
             throw AppError.internal("Empty response from AI");
        }
        const content = choice.message.content;

        const rawJson = JSON.parse(content);
        const result = ComparisonSchema.parse(rawJson);

        return result;

      } catch (error: any) {
           console.error("OpenAI Compare Error:", error);
           
           // Fallback for Demo/No-Quota
           if (error?.status === 429 || error?.code === 'insufficient_quota') {
               console.warn("⚠️ OpenAI Quota Exceeded. Using Mock Analysis.");
               return {
                   status: 'COMPLIANT',
                   reasoning: "MOCK ANALYSIS: The proposal mentions specific experience in software development which matches the requirement. (Fallback Mode triggered due to API limits).",
                   score: 85,
                   sourceQuote: "proposal text snippet example..."
               };
           }

           throw AppError.internal("AI Service unavailable or response invalid");
      }
  }
}
