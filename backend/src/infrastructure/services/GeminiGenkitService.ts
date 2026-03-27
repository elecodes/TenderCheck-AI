import { z } from "zod";
import { traceable } from "langsmith/traceable";
import type {
  ITenderAnalyzer,
  ChunkAnalysisResult,
} from "../../domain/interfaces/ITenderAnalyzer.js";
import type { TenderAnalysis } from "../../domain/entities/TenderAnalysis.js";
import { ai } from "../../config/genkit.config.js";
import type { PageChunk } from "../utils/chunking.js";

export class GeminiGenkitService implements ITenderAnalyzer {
  /**
   * Internal traceable implementation for analyze
   */
  private _analyze = traceable(
    async (text: string): Promise<TenderAnalysis> => {
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
        console.log("🤖 Generating analysis with Gemini 2.5 Flash...");

        const { output } = await ai.generate({
          prompt: `Actúa como un Auditor Legal y Técnico (Legal & Technical Auditor). Analiza el siguiente Pliego de Licitación.
        Identifica todos los requisitos técnicos OBLIGATORIOS (RTOs) y obligaciones administrativas.

        Texto del Pliego:
        ${text.substring(0, 500000)}

        INSTRUCCIONES DE EXTRACCIÓN:
        1. **Rol**: Eres un auditor estricto. Solo te importan las reglas que son motivo de exclusión o puntuación.
        2. **Foco**: Busca frases con IMPERATIVOS: "deberá", "será obligatorio", "se requiere", "es indispensable", "must", "shall".
        3. **Ignora**: Texto introductorio, paja, o descripciones generales que no son reglas.
        
        Para CADA requisito extraído:
        - **text**: La demanda técnica completa y exacta.
        - **type**: Clasifícalo en TECHNICAL, ADMINISTRATIVE, LEGAL, FINANCIAL.
        - **confidence**: 1.0 si es un mandato claro ("deberá"), 0.5 si es deseable.
        - **keywords**: 3-4 palabras clave para búsqueda vectorial.

        **Idioma**: La salida debe estar ESTRICTAMENTE en ESPAÑOL.`,
          output: { schema: AnalysisSchema },
        });

        if (!output) {
          throw new Error("Empty response from AI model");
        }

        const requirements = output.requirements.map((req: any) => ({
          id: crypto.randomUUID(),
          text: req.text,
          type: req.type as any,
          confidence: req.confidence,
          keywords: req.keywords,
          source: {
            pageNumber: 0,
            snippet: req.text.substring(0, 50) + "...",
          },
        }));

        return {
          id: crypto.randomUUID(),
          userId: "",
          tenderTitle: output.summary.substring(0, 500) || "Untitled Tender",
          documentUrl: "",
          status: "COMPLETED",
          createdAt: new Date(),
          updatedAt: new Date(),
          requirements: requirements,
          results: [],
        };
      } catch (error) {
        console.error("Gemini Analysis Failed:", error);
        throw new Error("Failed to analyze tender with Gemini AI");
      }
    },
    { name: "analyze_tender" },
  );

  /**
   * Internal traceable implementation for compareProposal
   */
  private _compareProposal = traceable(
    async (
      requirementText: string,
      proposalText: string,
    ): Promise<{
      status: "COMPLIANT" | "NON_COMPLIANT" | "PARTIAL";
      reasoning: string;
      score: number;
      sourceQuote: string;
    }> => {
      const ComparisonSchema = z.object({
        status: z.enum(["COMPLIANT", "NON_COMPLIANT", "PARTIAL"]),
        reasoning: z.string(),
        score: z.number(),
        sourceQuote: z.string(),
      });

      try {
        const { output } = await ai.generate({
          system: `You are a senior tender auditor specializind in IT public tenders. You must perform a deep semantic search within the provided context. Even if the text is a fragment, identify any mention of years, projects, or certifications. If you see 'Participado en al menos dos proyectos...', that IS the experience requirement. DO NOT say 'not specified' if there is any numerical requirement present.`,
          prompt: `Context: ${proposalText.substring(0, 500000)}\n\nQuestion: Evalúa si la propuesta cumple con el requisito: "${requirementText}"`,
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
    },
    { name: "compare_proposal" },
  );

  /**
   * Internal traceable implementation for compareBatch
   */
  private _compareBatch = traceable(
    async (
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
    > => {
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
        const reqList = requirements
          .map((r) => `ID: ${r.id}\nRequirement: ${r.text}`)
          .join("\n---\n");

        const { output } = await ai.generate({
          system: `You are a senior tender auditor specialized in IT public tenders. You must perform a deep semantic search within the provided context. Even if the text is a fragment, identify any mention of years, projects, or certifications. If you see 'Participado en al menos dos proyectos...', that IS the experience requirement. DO NOT say 'not specified' if there is any numerical requirement present. Respond strictly in SPANISH for reasoning.`,
          prompt: `Context: ${proposalText.substring(0, 500000)}\n\nQuestion: Compara los siguientes requisitos técnicos contra el texto de la propuesta:\n${reqList}`,
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
    },
    { name: "compare_batch" },
  );

  // Public Interface Methods

  async analyze(text: string): Promise<TenderAnalysis> {
    return this._analyze(text);
  }

  async analyzeChunk(chunk: PageChunk): Promise<ChunkAnalysisResult> {
    const AnalysisSchema = z.object({
      summary: z.string(),
      requirements: z.array(
        z.object({
          id: z.string(),
          text: z.string(),
          type: z.enum(["TECHNICAL", "ADMINISTRATIVE", "LEGAL", "FINANCIAL"]),
          confidence: z.number(),
          keywords: z.array(z.string()),
        }),
      ),
    });

    try {
      console.log(
        `🤖 Analyzing chunk ${chunk.chunkIndex + 1}: pages ${chunk.startPage}-${chunk.endPage} of ${chunk.totalPages}`,
      );

      const { output } = await ai.generate({
        prompt: `Actúa como un Auditor Legal y Técnico (Legal & Technical Auditor). Analiza las páginas ${chunk.startPage} a ${chunk.endPage} de un Pliego de Licitación (documento de ${chunk.totalPages} páginas).
        
        **CONTEXTO**: Estás analizando la PARTE ${chunk.chunkIndex + 1} del documento completo. El documento tiene ${chunk.totalPages} páginas en total.
        
        Texto de las páginas ${chunk.startPage}-${chunk.endPage}:
        ${chunk.text}

        INSTRUCCIONES DE EXTRACCIÓN:
        1. **Rol**: Eres un auditor estricto. Solo te importan las reglas que son motivo de exclusión o puntuación.
        2. **Foco**: Busca frases con IMPERATIVOS: "deberá", "será obligatorio", "se requiere", "es indispensable", "must", "shall".
        3. **Ignora**: Texto introductorio, paja, o descripciones generales que no son reglas.
        
        Para CADA requisito extraído:
        - **text**: La demanda técnica completa y exacta.
        - **type**: Clasifícalo en TECHNICAL, ADMINISTRATIVE, LEGAL, FINANCIAL.
        - **confidence**: 1.0 si es un mandato claro ("deberá"), 0.5 si es deseable.
        - **keywords**: 3-4 palabras clave para búsqueda vectorial.

        **Idioma**: La salida debe estar ESTRICTAMENTE en ESPAÑOL.`,
        output: { schema: AnalysisSchema },
      });

      if (!output) {
        throw new Error("Empty response from AI model");
      }

      const requirements = output.requirements.map((req: any) => ({
        id: crypto.randomUUID(),
        text: req.text,
        type: req.type,
        confidence: req.confidence,
        keywords: req.keywords,
        source: {
          pageNumber: chunk.startPage,
          snippet: req.text.substring(0, 50) + "...",
        },
      }));

      return {
        chunkIndex: chunk.chunkIndex,
        startPage: chunk.startPage,
        endPage: chunk.endPage,
        requirements,
      };
    } catch (error) {
      console.error(`❌ Chunk ${chunk.chunkIndex} analysis failed:`, error);
      return {
        chunkIndex: chunk.chunkIndex,
        startPage: chunk.startPage,
        endPage: chunk.endPage,
        requirements: [],
        error: (error as Error).message,
      };
    }
  }

  async analyzeChunks(chunks: PageChunk[]): Promise<ChunkAnalysisResult[]> {
    console.log(`🚀 Processing ${chunks.length} chunks in parallel...`);

    const results = await Promise.all(
      chunks.map((chunk) => this.analyzeChunk(chunk)),
    );

    const failedChunks = results.filter((r) => r.error);
    if (failedChunks.length > 0) {
      console.warn(
        `⚠️ ${failedChunks.length} chunk(s) failed:`,
        failedChunks.map((r) => r.chunkIndex),
      );
    }

    const successfulResults = results.filter((r) => !r.error);
    console.log(
      `✅ ${successfulResults.length}/${chunks.length} chunks processed successfully`,
    );

    return results;
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
    return this._compareProposal(requirementText, proposalText);
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
    return this._compareBatch(requirements, proposalText);
  }
}
