// backend/scripts/index_knowledge.ts
import 'dotenv/config'; // Load .env from backend root
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { ChromaClient } from 'chromadb';

// Mock Embedder for when quota is exceeded or offline
class MockEmbeddingFunction {
    public async generate(texts: string[]): Promise<number[][]> {
        console.log("⚠️ Using Mock Embeddings (Quota Exceeded/Testing)");
        // Generate deterministic pseudo-random vectors solely based on string length/char codes
        // This won't provide semantic search, but allows pipeline verification.
        return texts.map(text => {
            const vec = new Array(1536).fill(0);
            for (let i = 0; i < 100; i++) {
                vec[i] = (text.charCodeAt(i % text.length) || 0) / 255;
            }
            return vec;
        });
    }
}

// Fix for import error: Implement simple embedding wrapper
class CustomOpenAIEmbeddingFunction {
    private openai: OpenAI;
    constructor(private apiKey: string) {
        this.openai = new OpenAI({ apiKey });
    }

    public async generate(texts: string[]): Promise<number[][]> {
        try {
            const response = await this.openai.embeddings.create({
                model: "text-embedding-3-small",
                input: texts,
            });
            return response.data.sort((a,b) => a.index - b.index).map(d => d.embedding);
        } catch (error: any) {
            if (error?.status === 429) {
                 console.error("❌ OpenAI Quota Exceeded. Switching to Mock Embeddings for demo.");
                 const mock = new MockEmbeddingFunction();
                 return mock.generate(texts);
            }
            throw error;
        }
    }
}

// Configuration
const KNOWLEDGE_BASE_DIR = path.resolve('../knowledge_base/processed'); // Relative to backend/
const COLLECTION_NAME = "legal-knowledge-base";

async function main() {
  console.log("🚀 Starting Knowledge Indexing...");

  // 1. Initialize Clients
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
      console.error("❌ Error: OPENAI_API_KEY is missing in .env");
      process.exit(1);
  }

  const client = new ChromaClient(); // Defaults to http://localhost:8000
  // Use custom embedding function
  const embedder = new CustomOpenAIEmbeddingFunction(apiKey);

  console.log(`Connecting to ChromaDB...`);
  
  // 2. Create or Get Collection
  // Note: We delete and recreate to ensure fresh index during dev
  try {
    await client.deleteCollection({ name: COLLECTION_NAME });
    console.log(`🗑️  Deleted existing collection: ${COLLECTION_NAME}`);
  } catch (e) {
      // Ignore if doesn't exist
  }

  const collection = await client.createCollection({
      name: COLLECTION_NAME,
      embeddingFunction: embedder
  });

  // 3. Read Files
  if (!fs.existsSync(KNOWLEDGE_BASE_DIR)) {
      console.error(`❌ Error: Directory not found: ${KNOWLEDGE_BASE_DIR}`);
      process.exit(1);
  }

  const files = fs.readdirSync(KNOWLEDGE_BASE_DIR).filter(f => f.endsWith('.md'));
  console.log(`found ${files.length} documents to index.`);

  // 4. Index Loop
  let totalChunks = 0;

  for (const file of files) {
      const filePath = path.join(KNOWLEDGE_BASE_DIR, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Simple Chunking Strategy: Split by "## " (H2 headers)
      // This preserves context better than arbitrary character splitting for legal docs.
      const rawChunks = content.split(/^## /gm);
      
      const ids: string[] = [];
      const metadatas: any[] = [];
      const documents: string[] = [];

      rawChunks.forEach((chunk, index) => {
          const trimmed = chunk.trim();
          if (trimmed.length < 20) return; // Skip empty/titles
          
          // Re-add header marker for clarity in retrieval
          const text = index === 0 ? trimmed : `## ${trimmed}`;
          
          ids.push(`${file}_chunk_${index}`);
          metadatas.push({
              source: file,
              chunk_index: index,
              type: "standard"
          });
          documents.push(text);
      });

      if (documents.length > 0) {
          await collection.add({
              ids,
              metadatas,
              documents
          });
          console.log(`✅ Indexed: ${file} (${documents.length} chunks)`);
          totalChunks += documents.length;
      }
  }

  console.log(`\n🎉 Indexing Complete! Total Chunks: ${totalChunks}`);
  console.log(`Run 'docker run -p 8000:8000 chromadb/chroma' to ensure DB is up.`);
}

main().catch(console.error);
