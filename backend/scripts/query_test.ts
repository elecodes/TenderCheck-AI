// backend/scripts/query_test.ts
import 'dotenv/config'; // Load .env from backend root
import OpenAI from 'openai';
import { ChromaClient } from 'chromadb';

// Configuration
const COLLECTION_NAME = "legal-knowledge-base";

// Mock Embedder (Must match index script logic for dimensions)
class MockEmbeddingFunction {
    public async generate(texts: string[]): Promise<number[][]> {
         return texts.map(text => {
            const vec = new Array(1536).fill(0);
            for (let i = 0; i < 100; i++) {
                vec[i] = (text.charCodeAt(i % text.length) || 0) / 255;
            }
            return vec;
        });
    }
}

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
                 console.log("⚠️ OpenAI Quota Exceeded. Using Mock Query Embeddings.");
                 const mock = new MockEmbeddingFunction();
                 return mock.generate(texts);
            }
            throw error;
        }
    }
}

async function main() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.error("❌ Error: OPENAI_API_KEY is missing in .env");
        process.exit(1);
    }

    const client = new ChromaClient();
    const embedder = new CustomOpenAIEmbeddingFunction(apiKey);

    console.log("🔍 Checking ChromaDB Connection...");
    
    try {
        // Try to get the collection
        const collection = await client.getCollection({
            name: COLLECTION_NAME,
            embeddingFunction: embedder
        });
        
        const count = await collection.count();
        console.log(`✅ Collection '${COLLECTION_NAME}' found with ${count} items.`);

        if (count === 0) {
            console.log("⚠️ Collection is empty. Run 'npx tsx scripts/index_knowledge.ts' first.");
            return;
        }

        // Run a test query
        const queryText = "criterios de adjudicación mediante fórmulas"; // Something related to Art 145
        console.log(`\n❓ Test Query: "${queryText}"`);
        
        const results = await collection.query({
            queryTexts: [queryText],
            nResults: 2
        });

        console.log("\n📊 Results:");
        results.ids[0].forEach((id, index) => {
            console.log(`\n--- Result ${index + 1} (Distance: ${results.distances?.[0][index]?.toFixed(4)}) ---`);
            console.log(`ID: ${id}`);
            console.log(`Metadata:`, results.metadatas?.[0][index]);
            console.log(`Snippet: ${results.documents?.[0][index].substring(0, 150)}...`);
        });

    } catch (e: any) {
        console.error("\n❌ Error Querying ChromaDB:");
        if (e.code === 'ECONNREFUSED' || e.message?.includes('fetch failed')) {
            console.error("   -> Is the ChromaDB server running? (Docker container 'tendercheck-chroma')");
            console.error("   -> Try: docker start tendercheck-chroma");
        } else {
            console.error(e);
        }
    }
}

main().catch(console.error);
