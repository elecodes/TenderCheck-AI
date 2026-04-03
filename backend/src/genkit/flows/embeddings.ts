import { z } from "zod";
import { ai } from "../../config/genkit.config.js";

/**
 * Flow: Generate Embedding - Usa directamente el modelo de embedding
 * Este flow llama al embedder real de Genkit
 */
export const generateEmbeddingFlow = ai.defineFlow(
  {
    name: "generateEmbedding",
    inputSchema: z.object({
      text: z.string().describe("Texto a convertir en embedding"),
    }),
    outputSchema: z.object({
      dimensions: z.number(),
      sample: z.string(),
      success: z.boolean(),
    }),
  },
  async ({ text }) => {
    try {
      // Usar ai.embed directamente con el modelo correcto
      const result = await ai.embed({
        model: "googleai/gemini-embedding-001",
        content: text.slice(0, 32000),
      });

      // El resultado puede venir como array o como objeto
      const embedding = Array.isArray(result) 
        ? result[0]?.embedding 
        : (result as any)?.embedding;

      if (!embedding) {
        throw new Error("No embedding returned");
      }

      return {
        dimensions: embedding.length || 3072,
        sample: text.slice(0, 100),
        success: true,
      };
    } catch (error) {
      return {
        dimensions: 0,
        sample: text.slice(0, 100),
        success: false,
      };
    }
  }
);

/**
 * Flow: Semantic Search - Busca textos similares en un corpus
 */
export const semanticSearchFlow = ai.defineFlow(
  {
    name: "semanticSearch",
    inputSchema: z.object({
      query: z.string().describe("Query de búsqueda"),
      documents: z.array(z.string()).describe("Documentos donde buscar"),
    }),
    outputSchema: z.array(
      z.object({
        index: z.number(),
        document: z.string(),
        relevance: z.number(),
      })
    ),
  },
  async ({ query, documents }) => {
    // Embed query
    const queryResult = await ai.embed({
      model: "googleai/gemini-embedding-001",
      content: query,
    });
    
    const queryEmbedding = Array.isArray(queryResult)
      ? queryResult[0]?.embedding
      : (queryResult as any)?.embedding;

    if (!queryEmbedding) {
      throw new Error("Failed to embed query");
    }

    // Embed todos los documentos y calcular similitud
    const results = await Promise.all(
      documents.map(async (doc, index) => {
        try {
          const docResult = await ai.embed({
            model: "googleai/gemini-embedding-001",
            content: doc.slice(0, 32000),
          });
          
          const docEmbedding = Array.isArray(docResult)
            ? docResult[0]?.embedding
            : (docResult as any)?.embedding;

          if (!docEmbedding) {
            return { index, document: doc.slice(0, 50), relevance: 0 };
          }

          const similarity = cosineSimilarity(queryEmbedding, docEmbedding);
          
          return {
            index,
            document: doc.slice(0, 50) + "...",
            relevance: Math.round(similarity * 100) / 100,
          };
        } catch {
          return { index, document: doc.slice(0, 50), relevance: 0 };
        }
      })
    );

    // Ordenar por relevancia
    results.sort((a, b) => b.relevance - a.relevance);
    
    return results;
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

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}