import { OpenAIEmbeddings } from "@langchain/openai";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment from root backend .env for API Key if available
dotenv.config({ path: path.resolve(__dirname, '../../../backend/.env') });

export async function getEmbeddingsModel() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (apiKey && !apiKey.startsWith('mock')) {
    try {
      console.error("🔌 Testing OpenAI connection...");
      const model = new OpenAIEmbeddings({
        openAIApiKey: apiKey,
        modelName: "text-embedding-3-small",
        maxRetries: 0 // Fail fast to fallback
      });
      // Test the key with a single cheap embedding
      await model.embedQuery("test connectivity");
      console.error("✅ OpenAI Embeddings Active (Paid Tier)");
      return model;
    } catch (error) {
      console.warn("⚠️ OpenAI Error (Quota/Auth):", (error as Error).message);
      console.error("🔄 Switching to Local HuggingFace Fallback...");
    }
  } else {
     // console.error("ℹ️ No OpenAI Key found. Defaulting to Local Fallback.");
  }

  // Fallback
  console.error("💻 Initializing Local CPU Embeddings (Xenova/all-MiniLM-L6-v2)...");
  return new HuggingFaceTransformersEmbeddings({
    modelName: "Xenova/all-MiniLM-L6-v2",
  });
}
