import { ai } from "../../config/genkit.config.js";
import { z } from "zod";

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

const ComparisonSchema = z.object({
  status: z.enum(["COMPLIANT", "NON_COMPLIANT", "PARTIAL"]),
  reasoning: z.string(),
  score: z.number(),
  sourceQuote: z.string(),
});

/**
 * Flow: Legal Auditor - Extrae requisitos del pliego
 */
export const legalAuditorFlow = ai.defineFlow(
  {
    name: "legalAuditor",
    inputSchema: z.object({
      text: z.string().describe("Texto del pliego de licitação"),
    }),
    outputSchema: AnalysisSchema,
  },
  async ({ text }) => {
    const truncatedText = text.substring(0, 500000);

    const { output } = await ai.generate({
      prompt: `Actúa como un Auditor Legal y Técnico (Legal & Technical Auditor). Analiza el siguiente Pliego de Licitación.
Identifica todos los requisitos técnicos OBLIGATORIOS (RTOs) y obligaciones administrativas.

Texto del Pliego:
${truncatedText}

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

    return output;
  },
);

/**
 * Flow: Senior Evaluator - Valida propuesta contra requisito
 */
export const seniorEvaluatorFlow = ai.defineFlow(
  {
    name: "seniorEvaluator",
    inputSchema: z.object({
      requirementText: z.string().describe("Texto del requisito del pliego"),
      proposalText: z.string().describe("Texto de la propuesta del proveedor"),
    }),
    outputSchema: ComparisonSchema,
  },
  async ({ requirementText, proposalText }) => {
    const truncatedProposal = proposalText.substring(0, 500000);

    const { output } = await ai.generate({
      system: `You are a senior tender auditor specialized in IT public tenders. You must perform a deep semantic search within the provided context. Even if the text is a fragment, identify any mention of years, projects, or certifications. If you see 'Participado en al menos dos proyectos...', that IS the experience requirement. DO NOT say "not specified" if there is any numerical requirement present.`,
      prompt: `Context: ${truncatedProposal}\n\nQuestion: Evalúa si la propuesta cumple con el requisito: ${JSON.stringify(requirementText)}`,
      output: { schema: ComparisonSchema },
    });

    if (!output) {
      throw new Error("Empty AI response");
    }

    return output;
  },
);
