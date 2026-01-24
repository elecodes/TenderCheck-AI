import 'dotenv/config';
import { LocalRAGLegalService } from '../src/infrastructure/services/LocalRAGLegalService.js';
import { MockLegalService } from '../src/infrastructure/services/MockLegalService.js';

async function main() {
  console.log("🔍 Verifying Legal RAG Service...");

  const apiKey = process.env.OPENAI_API_KEY;
  let service;

  if (apiKey) {
    console.log("✅ API Key found. Using LocalRAGLegalService (OpenAI).");
    service = new LocalRAGLegalService(apiKey);
  } else {
    console.log("⚠️ No API Key. Using MockLegalService.");
    service = new MockLegalService();
  }

  const query = "que es el presupuesto base?";
  console.log(`\nQuerying: "${query}"`);

  try {
    const results = await service.citationSearch(query);
    console.log(`\nFound ${results.length} citations:`);
    results.forEach((r, i) => {
      console.log(`\n[${i+1}] ${r.article} (Score: ${r.relevance.toFixed(2)})`);
      console.log(`    "${r.text.slice(0, 100)}..."`);
    });

    if (results.length > 0) {
        console.log("\n✅ Verification SUCCESS: Citations returned.");
        process.exit(0);
    } else {
        console.error("\n❌ Verification FAILED: No citations found for obvious query.");
        process.exit(1);
    }

  } catch (error) {
    console.error("\n❌ Verification CRASHED:", error);
    process.exit(1);
  }
}

main();
