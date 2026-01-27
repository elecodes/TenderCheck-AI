import { genkit } from "genkit";
import { ollama } from "genkitx-ollama";

/**
 * Genkit Configuration for TenderCheck AI
 *
 * This configuration sets up Genkit with Ollama provider for local-first AI inference.
 * Uses Mistral 7B model for faster performance while maintaining privacy.
 *
 * @see https://firebase.google.com/docs/genkit
 * @see https://github.com/TheFireCo/genkit-plugins/tree/main/plugins/ollama
 */

export const ai = genkit({
  plugins: [
    ollama({
      models: [
        {
          name: "mistral",
          type: "generate",
        },
      ],
      serverAddress:
        process.env.OLLAMA_SERVER_ADDRESS || "http://127.0.0.1:11434",
    }),
  ],
});

/**
 * Genkit Model Constants
 * These are used throughout the application for consistency
 */
export const GENKIT_MODELS = {
  MISTRAL: "ollama/mistral",
  // Future: Add more models as needed
  // MISTRAL_LARGE: 'ollama/mistral-large',
  // GPT4: 'openai/gpt-4',
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
