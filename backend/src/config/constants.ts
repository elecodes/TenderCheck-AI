/* eslint-disable @typescript-eslint/no-magic-numbers */
export const FILE_UPLOAD_LIMIT_MB = 50;
export const BYTES_PER_KB = 1024;
export const BYTES_PER_MB = 1024 * 1024;
export const MAX_FILE_SIZE_BYTES = FILE_UPLOAD_LIMIT_MB * BYTES_PER_MB;

export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_MAX_ATTEMPTS = 3;

export const PASSWORD_MIN_LENGTH = 8;
export const SALT_ROUNDS = 10;
export const DEFAULT_PORT = 3000;
export const JWT_SECRET_FALLBACK = "tendercheck_ai_super_secret_key_2026_tfm";

export const MIN_JUSTIFICATION_LENGTH = 10;
export const MIN_ITEMS_LENGTH = 5;

// AI / LLM Constants
export const OLLAMA_TIMEOUT = 600000; // 10 minutes (ms)
export const OLLAMA_MAX_TOKENS = 4000;
export const OPENAI_TIMEOUT = 50000;
export const OPENAI_MAX_RETRIES = 4;
export const OPENAI_MATCH_THRESHOLD = 50; //%
export const MIN_WORD_LENGTH = 4;
export const DEFAULT_CONFIDENCE_SCORE = 85;
export const PROPOSAL_TRUNCATE_SINGLE = 3000;
export const PROPOSAL_TRUNCATE_BATCH = 5000;
export const BATCH_CHUNK_SIZE = 5;
export const MAX_AI_CONCURRENCY = 2;

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
