import OpenAI from "openai";
import type { ILegalDataSource, LegalCitation } from "../../domain/interfaces/ILegalDataSource.js";

// MVP: In-memory store for a few key articles. 
// In a real app, this would be loaded from LanceDB or a JSON file at startup.
const LEGAL_KNOWLEDGE_BASE = [
  {
    id: "lcsp-art-1",
    text: "La presente Ley tiene por objeto regular la contratación del sector público, a fin de garantizar que la misma se ajuste a los principios de libertad de acceso a las licitaciones, publicidad y transparencia de los procedimientos, y no discriminación e igualdad de trato entre los candidatos.",
    article: "Artículo 1. Objeto y finalidad",
    source: "LCSP 9/2017"
  },
  {
    id: "lcsp-art-63",
    text: "El perfil de contratante agrupará la información y documentos relativos a la actividad contractual de los órganos de contratación, con el fin de asegurar la transparencia y el acceso público a los mismos.",
    article: "Artículo 63. Perfil de contratante",
    source: "LCSP 9/2017"
  },
  // Add more as needed or load dynamically
];

export class LocalRAGLegalService implements ILegalDataSource {
  private openai: OpenAI;
  // Cache for document embeddings to avoid re-calculating (would be pre-computed in production)
  private documentEmbeddings: Map<string, number[]> = new Map();

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  // Helper to calculate cosine similarity
  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  private async getEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: "text-embedding-3-small", // Cost-effective model
      input: text,
    });
    const item = response.data[0];
    const embedding = item?.embedding;
    if (!embedding) throw new Error("No embedding returned using model text-embedding-3-small");
    return embedding;
  }

  async citationSearch(query: string): Promise<LegalCitation[]> {
    try {
      console.log(`[LocalRAG] Embeddings query: "${query}"`);
      const queryEmbedding = await this.getEmbedding(query);

      // Lazily compute document embeddings if not present (MVP Hack)
      // In prod, these are pre-computed in the vector DB.
      for (const doc of LEGAL_KNOWLEDGE_BASE) {
        if (!this.documentEmbeddings.has(doc.id)) {
            const emb = await this.getEmbedding(doc.text); // Warning: API calls loop!
            this.documentEmbeddings.set(doc.id, emb);
        }
      }

      // Rank documents
      const results = LEGAL_KNOWLEDGE_BASE.map(doc => {
        const docEmb = this.documentEmbeddings.get(doc.id);
        if(!docEmb) return { ...doc, relevance: 0 };
        const score = this.cosineSimilarity(queryEmbedding, docEmb);
        return {
            ...doc,
            relevance: score
        };
      })
      .sort((a, b) => b.relevance - a.relevance)
      .filter(doc => doc.relevance > 0.4); // Threshold

      return results.slice(0, 3).map(r => ({
          id: r.id,
          article: r.article,
          text: r.text,
          relevance: r.relevance,
          source: r.source
      }));

    } catch (error) {
      console.error("[LocalRAG] Error generating embeddings:", error);
      return []; // Fail gracefully
    }
  }
}
