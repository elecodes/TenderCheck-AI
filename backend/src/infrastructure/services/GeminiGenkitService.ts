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
    requirementText: string,
    proposalText: string,
  ): Promise<{
    status: "COMPLIANT" | "NON_COMPLIANT" | "PARTIAL";
    reasoning: string;
    score: number;
    sourceQuote: string;
  }> {
    const ComparisonSchema = z.object({
      status: z.enum(["COMPLIANT", "NON_COMPLIANT", "PARTIAL"]),
      reasoning: z.string(),
      score: z.number(),
      sourceQuote: z.string(),
    });

    try {
      const { output } = await ai.generate({
        prompt: `Evaluate if the proposal meets the requirement.
        
        Requirement:
        "${requirementText}"

        Proposal Excerpt:
        "${proposalText.substring(0, 15000)}"

        Task:
        1. Determine if the requirement is met (COMPLIANT, NON_COMPLIANT, PARTIAL).
        2. Provide reasoning.
        3. Assign a confidence score (0-100).
        4. Extract a relevant quote from the proposal as evidence.
        `,
        output: { schema: ComparisonSchema },
      });

      if (!output) throw new Error("Empty AI response");

      return output;
    } catch (error) {
      console.error("Gemini Comparison Failed:", error);
      return {
        status: "NON_COMPLIANT",
        score: 0,
        reasoning: "AI Analysis Failed",
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
    const BatchSchema = z.object({
      results: z.array(
        z.object({
          id: z.string(),
          status: z.enum(["COMPLIANT", "NON_COMPLIANT", "PARTIAL"]),
          reasoning: z.string(),
          score: z.number(),
          sourceQuote: z.string(),
        }),
      ),
    });

    try {
      // Simplified prompt for batch processing
      const reqList = requirements
        .map((r) => `ID: ${r.id}\nRequirement: ${r.text}`)
        .join("\n---\n");

      const { output } = await ai.generate({
        prompt: `You are an expert tender evaluator. Compare the following requirements against the provided proposal text.
        
        Proposal Text:
        "${proposalText.substring(0, 25000)}"

        Requirements:
        ${reqList}

        For EACH requirement, output a JSON object with:
        - id (matching the input ID)
        - status (COMPLIANT, NON_COMPLIANT, PARTIAL)
        - reasoning (brief explanation)
        - score (0-100 confidence)
        - sourceQuote (exact quote from proposal, or empty string if none)
        `,
        output: { schema: BatchSchema },
      });

      const results = new Map();
      if (output && output.results) {
        for (const res of output.results) {
          results.set(res.id, res);
        }
      }
      return results;
    } catch (error) {
      console.error("Gemini Batch Comparison Failed:", error);
      return new Map();
    }
  }
}
