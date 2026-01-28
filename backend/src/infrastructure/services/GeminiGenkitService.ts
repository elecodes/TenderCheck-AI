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
        prompt: `Analiza el siguiente texto de un pliego de licitación y extrae los requisitos clave.
        Identifica si cada requisito es TÉCNICO, ADMINISTRATIVO, LEGAL o FINANCIERO.
        Asigna un puntaje de confianza (0-1) para cada uno.

        INSTRUCCIONES CLAVE:
        1. **Traduce** todos los requisitos extraídos al ESPAÑOL si están en otro idioma.
        2. Los campos 'type' deben ser: TECHNICAL, ADMINISTRATIVE, LEGAL, FINANCIAL.
        3. El resumen (summary) debe estar en Español.
        
        Texto del Pliego:
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
        prompt: `Evalúa si la propuesta cumple con el requisito.

        Requisito:
        "${requirementText}"

        Extracto de la Propuesta:
        "${proposalText.substring(0, 15000)}"

        Tarea:
        1. Determinar si se cumple el requisito (COMPLIANT, NON_COMPLIANT, PARTIAL).
        2. Proporcionar razonamiento en ESPAÑOL.
           - ATENCIÓN: Si el requisito pide un valor MÍNIMO (ej. 15) y la oferta es MAYOR (ej. 18), entoces CUMPLE.
        3. Asignar puntaje de confianza (0-100).
        4. Extraer cita relevante.
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
        prompt: `Actúa como un experto evaluador de licitaciones públicas. Compara los siguientes requisitos técnicos contra el texto de la propuesta proporcionada.
        
        Texto de la Propuesta:
        "${proposalText.substring(0, 25000)}"

        Requisitos a evaluar:
        ${reqList}

        Instrucciones de Evaluación:
        1. **Idioma**: Output ESTRICTAMENTE en ESPAÑOL.
        2. **RAG Semántico**:
           - Busca **conceptos** y **sinónimos**, no solo palabras exactas.
           - Ejemplo: "Panel de Paz" EQUIVALE a "Rincón Alma & Zen" o "Zona de Mediación". ¡Esto es CUMPLE!
           - Ejemplo: "Anexo II" EQUIVALE a "Declaración Responsable".
        3. **Lógica Numérica**: 
           - Si Requisito pide MIN(X) y Oferta tiene Y >= X -> CUMPLE.
        4. **Reglas de Estado (CRÍTICO)**:
           - **COMPLIANT (Verde)**: Score > 85. Cumple totalmente.
           - **PARTIAL (Ámbar)**: Score 40-84. Cumple algo significativo pero falta otra parte. 
             (Ejemplo: Tienes Audios pero falta Panel -> PARTIAL).
           - **NON_COMPLIANT (Rojo)**: Score < 40. No hay nada relevante.
           - **IMPORTANTE**: Si el Score es > 40, EL ESTADO DEBE SER PARTIAL o COMPLIANT. NUNCA pongas NON_COMPLIANT si Score > 40.
        
        Para CADA requisito, genera un objeto JSON con:
        - id (coincidiendo con el ID de entrada)
        - status (COMPLIANT, NON_COMPLIANT, PARTIAL)
        - reasoning (Explicación breve en Español. Menciona explícitamente la evidencia encontrada.)
        - score (0-100 confianza)
        - sourceQuote (Cita textual exacta de la propuesta)
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
