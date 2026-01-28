import { genkit } from "genkit";
import { googleAI, gemini15Flash } from "@genkit-ai/googleai";
import { z } from "zod";
import type { ITenderAnalyzer } from "../../domain/interfaces/ITenderAnalyzer.js";
import type { TenderAnalysis } from "../../domain/entities/TenderAnalysis.js";

// Initialize Genkit with Google AI
const ai = genkit({
  plugins: [googleAI()],
  model: "googleai/gemini-2.5-flash", // Updated for 2026 compatibility
});

export class GeminiGenkitService implements ITenderAnalyzer {
  async analyze(text: string): Promise<TenderAnalysis> {
    // Define the output schema structure for structured generation
    const AnalysisSchema = z.object({
      summary: z.string(),
      requirements: z.array(
        z.object({
          id: z.string(),
          text: z.string(),
          type: z.enum(["TECHNICAL", "ADMINISTRATIVE", "LEGAL", "FINANCIAL"]), // Align with domain enums
          confidence: z.number(),
          keywords: z.array(z.string()),
        }),
      ),
    });

    try {
      console.log("🤖 Generating analysis with Gemini 1.5 Flash...");

      const { output } = await ai.generate({
        prompt: `Analyze the following tender document text and extract key requirements. 
        Identify if each requirement is Technical, Administrative, Legal, or Financial.
        Provide a confidence score (0-1) for each.
        
        Tender Text:
        ${text.substring(0, 30000)}`, // Truncate to safe limit if needed, though Gemini 1.5 has huge context
        output: { schema: AnalysisSchema },
      });

      if (!output) {
        throw new Error("Empty response from AI model");
      }

      // Map AI output to Domain Entity
      // Note: We generate UUIDs here or let the repo handle it?
      // Better to generate here to be safe.

      const requirements = output.requirements.map(
        (req: any, index: number) => ({
          id: crypto.randomUUID(),
          text: req.text,
          type: req.type as any, // Cast to match stricter domain enum if needed
          confidence: req.confidence,
          keywords: req.keywords,
          source: {
            pageNumber: 0, // Gemini doesn't give page numbers easily from raw text without markers
            snippet: req.text.substring(0, 50) + "...",
          },
        }),
      );

      return {
        id: crypto.randomUUID(),
        userId: "", // Set by caller (CreateTender)
        tenderTitle: output.summary.substring(0, 100) || "Untitled Tender",
        documentUrl: "",
        status: "COMPLETED", // Corrected from ANALYZED to match AnalysisStatus
        createdAt: new Date(),
        updatedAt: new Date(),
        requirements: requirements,
        results: [],
      };
    } catch (error) {
      console.error("Gemini Analysis Failed:", error);
      throw new Error("Failed to analyze tender with Gemini AI");
    }
  }

  async compareProposal(
    _requirement: { id: string; text: string },
    _proposalText: string,
  ): Promise<{
    status: "COMPLIANT" | "NON_COMPLIANT" | "PARTIAL";
    reasoning: string;
    score: number;
    sourceQuote: string;
  }> {
    // Stub implementation for now - Gemini Pro/Flash logic
    // In a real implementation, we would call the model here.
    // For now, returning a safe default to satisfy interface and build.
    return {
      status: "NON_COMPLIANT",
      score: 0,
      reasoning: "Not implemented yet in GeminiGenkitService",
      sourceQuote: "",
    };
  }

  async compareBatch(
    requirements: { id: string; text: string }[],
    _proposalText: string,
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
    // Logic to call Gemini and analyze batch
    // Stub for build pass
    for (const req of requirements) {
      results.set(req.id, {
        status: "NON_COMPLIANT",
        score: 0,
        reasoning: "Not implemented yet in GeminiGenkitService",
        sourceQuote: "",
      });
    }
    return results;
  }
}
