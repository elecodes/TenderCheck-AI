import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { AppError } from "../../domain/errors/AppError.js";
import type { ITenderAnalyzer } from "../../domain/interfaces/ITenderAnalyzer.js";
import type { TenderAnalysis } from "../../domain/entities/TenderAnalysis.js";
import { TenderAnalysisLLMSchema, type TenderAnalysisLLM } from "../schemas/LLMSchemas.js";
import { randomUUID } from "crypto";

export class OpenAIModelService implements ITenderAnalyzer {
  private client: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analyze(text: string): Promise<TenderAnalysis> {
    try {
      if (!text || text.length < 50) {
        throw AppError.badRequest("Text is too short for analysis");
      }

      console.log("Analyzing text with OpenAI (Model: gpt-4o-2024-08-06)...");

      const completion = await this.client.chat.completions.create({
        model: "gpt-4o-2024-08-06", 
        messages: [
          {
            role: "system",
            content: `You are an expert Tender Analyst AI. Extract technical requirements.`
          },
          {
            role: "user",
            content: `Analyze the following tender text:\n\n${text.slice(0, 50000)}` 
          }
        ],
        response_format: zodResponseFormat(TenderAnalysisLLMSchema, "tender_analysis"),
      });

      const result = completion.choices[0].message.parsed as TenderAnalysisLLM;
      
      if (!result) {
        throw new Error("OpenAI returned null response");
      }

      const analysis: TenderAnalysis = {
        id: randomUUID(),
        tenderTitle: result.tenderTitle,
        status: "COMPLETED",
        createdAt: new Date(),
        updatedAt: new Date(), // Added missing field
        documentUrl: "",       // Added default missing field
        requirements: result.requirements.map(req => ({
          id: req.id,
          text: req.text,
          type: req.type as "MANDATORY" | "OPTIONAL" | "UNKNOWN", // Cast enum
          keywords: req.keywords,
          source: {
            pageNumber: req.pageNumber,
            snippet: req.text.slice(0, 100)
          },
          confidence: 0.95
        })),
        results: []
      };

      return analysis;

      return analysis;

    } catch (error: any) {
      console.error("OpenAI Analysis Failed:", error);
      
      // Fallback to Mock if Quota Exceeded or Auth Error or Network Error
      if (error?.status === 429 || error?.status === 401 || error?.code === 'insufficient_quota') {
        console.warn("⚠️ OpenAI Quota/Auth Error. Falling back to MOCK mode.");
        return this.getMockAnalysis(text);
      }

      throw AppError.internal("Failed to analyze tender with AI");
    }
  }

  private getMockAnalysis(text: string): TenderAnalysis {
    return {
      id: randomUUID(),
      tenderTitle: "MOCK ANALYSIS: Cloud Services Tender (Fallback)",
      status: "COMPLETED",
      createdAt: new Date(),
      updatedAt: new Date(),
      documentUrl: "",
      requirements: [
        {
          id: "REQ-MOCK-001",
          text: "The system MUST support auto-scaling (Simulated Requirement).",
          type: "MANDATORY",
          keywords: ["auto-scaling", "scalability"],
          source: { pageNumber: 1, snippet: "The system MUST support auto-scaling..." },
          confidence: 0.99
        },
        {
          id: "REQ-MOCK-002",
          text: "99.9% availability is mandatory (Simulated Requirement).",
          type: "MANDATORY",
          keywords: ["availability", "uptime"],
          source: { pageNumber: 2, snippet: "99.9% availability is mandatory..." },
          confidence: 0.95
        },
        {
          id: "REQ-MOCK-003",
          text: "Provider should have ISO 27001 certification.",
          type: "OPTIONAL",
          keywords: ["ISO 27001", "security"],
          source: { pageNumber: 5, snippet: "Provider should have ISO 27001..." },
          confidence: 0.80
        }
      ],
      results: []
    };
  }
}
