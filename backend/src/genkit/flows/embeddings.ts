import { ai } from "../../config/genkit.config.js";
import { z } from "zod";

/**
 * Flow: Embed Text - Genera embeddings para texto
 */
export const embedTextFlow = ai.defineFlow(
  {
    name: "embedText",
    inputSchema: z.object({
      text: z.string().describe("Texto a convertir en embedding"),
    }),
    outputSchema: z.object({
      dimensions: z.number(),
      truncatedText: z.string(),
    }),
  },
  async ({ text }) => {
    const truncatedText = text.substring(0, 1000);
    
    const { embedding } = await ai.embed({
      model: "googleai/gemini-embedding-001",
      content: truncatedText,
    });

    return {
      dimensions: embedding.length,
      truncatedText: truncatedText.substring(0, 100) + "...",
    };
  }
);

/**
 * Flow: Find Similar - Encuentra texto semánticamente similar
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
        score: z.number(),
      })
    ),
  },
  async ({ query, corpus }) => {
    // Embed query
    const { embedding: queryEmbedding } = await ai.embed({
      model: "googleai/gemini-embedding-001",
      content: query,
    });

    // Embed all corpus items
    const corpusEmbeddings = await Promise.all(
      corpus.map(async (text) => {
        const { embedding } = await ai.embed({
          model: "googleai/gemini-embedding-001",
          content: text.substring(0, 1000),
        });
        return { text, embedding };
      })
    );

    // Calculate cosine similarity
    const results = corpusEmbeddings.map(({ text, embedding }) => {
      const similarity = cosineSimilarity(queryEmbedding, embedding);
      return { text, score: similarity };
    });

    // Sort by similarity
    results.sort((a, b) => b.score - a.score);

    return results.slice(0, 3);
  }
);

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}