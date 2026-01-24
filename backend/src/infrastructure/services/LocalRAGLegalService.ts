import type { ILegalDataSource, LegalCitation } from "../../domain/interfaces/ILegalDataSource.js";
import { LocalEmbeddingService } from "./LocalEmbeddingService.js";
import fs from 'fs';
import path from 'path';

// Load from JSON file if exists, else empty
const STORAGE_FILE = path.resolve('src/data/legal_knowledge.json');

export class LocalRAGLegalService implements ILegalDataSource {
  private embeddingService: LocalEmbeddingService;
  private knowledgeBase: any[] = [];
  
  constructor(apiKey?: string) {
    this.embeddingService = LocalEmbeddingService.getInstance();
    this.loadKnowledgeBase();
  }

  private loadKnowledgeBase() {
    try {
        if (fs.existsSync(STORAGE_FILE)) {
            const data = fs.readFileSync(STORAGE_FILE, 'utf-8');
            this.knowledgeBase = JSON.parse(data);
            console.log(`[LocalRAG] Loaded ${this.knowledgeBase.length} articles from local storage.`);
        } else {
            console.warn(`[LocalRAG] No knowledge base found at ${STORAGE_FILE}. Run 'npm run index-knowledge' to create it.`);
        }
    } catch (err) {
        console.error("[LocalRAG] Failed to load knowledge base:", err);
    }
  }

  // Helper to calculate cosine similarity
  private cosineSimilarity(a: number[], b: number[]): number {
    if (!a || !b) return 0;
    const dotProduct = a.reduce((sum, val, i) => sum + val * (b[i] || 0), 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return (magnitudeA && magnitudeB) ? dotProduct / (magnitudeA * magnitudeB) : 0;
  }

  async citationSearch(query: string): Promise<LegalCitation[]> {
    try {
      if (this.knowledgeBase.length === 0) {
          console.warn("[LocalRAG] Knowledge base is empty. Returning no results.");
          return [];
      }

      console.log(`[LocalRAG] Local Embeddings query: "${query}"`);
      const [queryEmbedding] = await this.embeddingService.generateEmbeddings([query]);
      
      if (!queryEmbedding) return []; 

      // Scan all documents in memory (acceptable for < 1000 items)
      const results = this.knowledgeBase.map(doc => {
        const docEmb = doc.embedding;
        if (!docEmb) return { ...doc, relevance: 0 };

        const score = this.cosineSimilarity(queryEmbedding, docEmb);
        // console.log(`[LocalRAG] Doc: ${doc.id}, Score: ${score.toFixed(4)}`); // Verbose debug
        return {
            ...doc,
            relevance: score
        };
      })
      .sort((a, b) => b.relevance - a.relevance)
      .filter(doc => doc.relevance > 0.05);

      return results.slice(0, 3).map(r => ({
          id: r.id,
          article: r.article,
          text: r.text,
          relevance: r.relevance,
          source: r.source
      }));

    } catch (error) {
      console.error("[LocalRAG] Error generating local embeddings:", error);
      return []; 
    }
  }
}
