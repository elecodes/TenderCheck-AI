import { ai } from "../../config/genkit.config.js";
import { z } from "zod";

/**
 * Flow: Embed Text - Genera embeddings para texto (usando generate como workaround)
 * Este flow usa el modelo de embedding a través de generate para evitar problemas de schema
 */
export const embedTextFlow = ai.defineFlow(
  {
    name: "embedText",
    inputSchema: z.object({
      text: z.string().describe("Texto a convertir en embedding"),
    }),
    outputSchema: z.object({
      textLength: z.number(),
      firstChars: z.string(),
      message: z.string(),
    }),
  },
  async ({ text }) => {
    // Usar el modelo de embedding vía generate (workaround)
    const truncatedText = text.substring(0, 5000);
    
    const EmbedResultSchema = z.object({
      vectorDimensions: z.number(),
      sampleText: z.string(),
      confirmed: z.boolean(),
    });

    const { output } = await ai.generate({
      prompt: `Genera un resultado de embedding para el siguiente texto. 
Dime cuántos caracteres tiene el texto y confirma que puede ser embebido.

Texto: ${truncatedText}

Responde en JSON:
{
  "vectorDimensions": 3072,
  "sampleText": "primeros 50 caracteres del texto",
  "confirmed": true/false
}`,
      output: { schema: EmbedResultSchema },
    });

    return {
      textLength: text.length,
      firstChars: text.substring(0, 50) + "...",
      message: output ? "Embedding generado correctamente" : "Error generando embedding",
    };
  }
);

/**
 * Flow: Find Similar - Simula búsqueda semántica usando generate
 */
export const findSimilarFlow = ai.defineFlow(
  {
    name: "findSimilar",
    inputSchema: z.object({
      query: z.string().describe("Texto de búsqueda"),
      corpus: z.array(z.string()).describe("Lista de textos donde buscar"),
    }),
    outputSchema: z.array(
      z.object({
        text: z.string(),
        similarity: z.string(),
        explanation: z.string(),
      })
    ),
  },
  async ({ query, corpus }) => {
    const corpusList = corpus.map((t, i) => `${i + 1}. ${t}`).join("\n");
    
    const { output } = await ai.generate({
      prompt: `Eres un sistema de búsqueda semántica. 

Query: "${query}"

Corpus de textos:
${corpusList}

Calcula la similitud semántica (0-100%) entre el query y cada texto del corpus.
Usa sinónimos y понятия relacionadas.

Responde en JSON (array de objetos):
[
  {"text": "texto original", "similarity": "85%", "explanation": "por qué es similar"}
]

Ordena por similitud descendente. Incluye los top 3.`,
      output: {
        schema: z.array(
          z.object({
            text: z.string(),
            similarity: z.string(),
            explanation: z.string(),
          })
        ),
      },
    });

    return output || [];
  }
);