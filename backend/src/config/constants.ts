export const FILE_UPLOAD_LIMIT_MB = 50;
export const BYTES_PER_KB = 1024;
export const BYTES_PER_MB = 1024 * 1024;
export const MAX_FILE_SIZE_BYTES = FILE_UPLOAD_LIMIT_MB * BYTES_PER_MB;

export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_MAX_ATTEMPTS = 3;

export const PASSWORD_MIN_LENGTH = 8;
export const SALT_ROUNDS = 10;
export const DEFAULT_PORT = 3000;
// ⚠️ SECURITY: In production, this fallback MUST NOT be used.
export const JWT_SECRET_FALLBACK =
  process.env.NODE_ENV === "production"
    ? (() => {
        throw new Error("FATAL: JWT_SECRET is missing in production!");
      })()
    : "dev_secret_key_only_for_local_testing";

export const MIN_JUSTIFICATION_LENGTH = 10;
export const MIN_ITEMS_LENGTH = 5;

// AI / LLM Constants
export const OLLAMA_TIMEOUT = 60000; // 60 seconds (ms) - Updated from 30 minutes
export const OLLAMA_MAX_TOKENS = 4000;
export const OPENAI_TIMEOUT = 50000;
export const OPENAI_MAX_RETRIES = 4;
export const OPENAI_MATCH_THRESHOLD = 50; //%
export const MIN_WORD_LENGTH = 4;
export const DEFAULT_CONFIDENCE_SCORE = 75; // Updated from 85
export const PROPOSAL_TRUNCATE_SINGLE = 500000; // Increased to 500k for Gemini 2.5 Flash (1M token window)
export const PROPOSAL_TRUNCATE_BATCH = 500000; // Increased to 500k
export const BATCH_CHUNK_SIZE = 3; // Process 3 requirements per batch (was 1)
export const MAX_AI_CONCURRENCY = 3; // Process 3 batches in parallel (was 1)

// Genkit Configuration Constants
export const GENKIT_TIMEOUT = 60000; // 60 seconds
export const GENKIT_MAX_RETRIES = 3;
export const GENKIT_RETRY_DELAY = 1000; // 1 second

// Vector Search Constants
export const VECTOR_DIMENSIONS = 768; // nomic-embed-text dimension (updated from 1536)
export const SIMILARITY_THRESHOLD = 0.3; // Very low threshold - process almost all (was 0.6)
export const TOP_K_SIMILAR = 5; // Number of similar results to return
export const EMBEDDING_BATCH_SIZE = 10; // Batch size for embedding generation
export const MAX_RELEVANT_REQUIREMENTS = 999; // Process all requirements (accuracy over speed)

// Mistral Model Constants
export const MISTRAL_MODEL = "mistral"; // Model name in Ollama
export const MISTRAL_TEMPERATURE = 0.0; // Zero for fully deterministic outputs
export const MISTRAL_MAX_TOKENS = 4096; // Context window

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  TOO_MANY_REQUESTS: 429,
};
