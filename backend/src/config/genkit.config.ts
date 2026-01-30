import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";

/**
 * Genkit Configuration for TenderCheck AI
 *
 * This configuration sets up Genkit with Google AI provider for Cloud-Native inference.
 * Uses Gemini 2.5 Flash for fast, cost-effective performance.
 */
export const ai = genkit({
  plugins: [googleAI()],
  model: "googleai/gemini-2.5-flash",
});

/**
 * Genkit Model Constants
 */
export const GENKIT_MODELS = {
  GEMINI_FLASH: "googleai/gemini-2.5-flash",
} as const;

/**
 * Genkit Configuration Constants
 */
export const GENKIT_CONFIG = {
  // Model settings
  TEMPERATURE: 0.1, // Low temperature for deterministic outputs
  MAX_TOKENS: 4096, // Context window
  TOP_P: 0.9,

  // Timeout settings
  TIMEOUT_MS: 60000, // 60 seconds

  // Retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,

  // Vector search settings
  EMBEDDING_DIMENSIONS: 1536, // Standard for most embedding models
  SIMILARITY_THRESHOLD: 0.75, // Cosine similarity threshold
  TOP_K_RESULTS: 5, // Number of similar results to return
} as const;
