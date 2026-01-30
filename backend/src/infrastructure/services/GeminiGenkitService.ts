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
        tenderTitle: output.summary.substring(0, 500) || "Untitled Tender",
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
        "${proposalText.substring(0, 500000)}"

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
        "${proposalText.substring(0, 500000)}"

        Requisitos a evaluar:
        ${reqList}

        Instrucciones de Evaluación (Senior Proposal Evaluator):
        1. **Rol**: Actúa como un *Evaluador Senior de Licitaciones*.
        2. **Idioma**: La salida debe estar ESTRICTAMENTE en ESPAÑOL.
        
        3. **Reglas de Cumplimiento (EVALUATION RULES)**:
           - **COMPLIANT (CUMPLE)**: La evidencia satisface plenamente el requisito.
             * *Regla de Cumplimiento Positivo*: Si pide un mínimo (ej. 15 ítems) y la oferta da más (ej. 18), es CUMPLE.
             * *Equivalencia Semántica*: Reconoce sinónimos técnicos (ej. "Diario de Campo" = "Registro de Observación", "Panel de Paz" = "Rincón de Resolución de Conflictos").
             
           - **PARTIAL (PARCIAL / AMBIGUO)**: Úsalo si la oferta menciona el tema pero falta detalle técnico específico o estándar.
             * Ejemplo: Menciona "cifrado" pero no especifica "AES-256" cuando se pedía.
             * Ejemplo: Cumple una parte de un requisito compuesto pero falta otra.
             
           - **NON_COMPLIANT (NO CUMPLE)**: La información falta por completo o contradice el requisito.
        
        4. **Salida**:
           Para CADA requisito, genera un objeto JSON:
           - id: (ID de entrada)
           - status: "COMPLIANT" | "NON_COMPLIANT" | "PARTIAL"
           - reasoning: Explicación de 2 frases. Menciona valores específicos si aplican.
           - score: 0.0 a 1.0 (Confianza)
           - sourceQuote: El fragmento exacto de la evidencia (o cadena vacía).
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
