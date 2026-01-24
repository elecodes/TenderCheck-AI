// backend/scripts/query_test.ts
import 'dotenv/config'; // Load .env from backend root
import { ChromaClient } from 'chromadb';
import { LocalEmbeddingService } from '../src/infrastructure/services/LocalEmbeddingService.js';

// Configuration
const COLLECTION_NAME = "legal-knowledge-base";

// Local Embedder Adapter
class LocalEmbeddingFunction {
     private service: LocalEmbeddingService;
    constructor() {
        this.service = LocalEmbeddingService.getInstance();
    }

    public async generate(texts: string[]): Promise<number[][]> {
        return await this.service.generateEmbeddings(texts);
    }
}

async function main() {
    const client = new ChromaClient();
    const embedder = new LocalEmbeddingFunction();

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
