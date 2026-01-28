# ==========================================
# Stage 1: Builder (Node.js 20 Slim)
# Used to compile TypeScript and build React Frontend
# ==========================================
FROM node:20-slim AS builder

WORKDIR /app

# Install build dependencies for native modules (if needed)
# python3 make g++ might be needed for some dev deps
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copy configuration files
COPY backend/package*.json ./backend/
COPY backend/tsconfig.json ./backend/
COPY frontend/package*.json ./frontend/
COPY frontend/tsconfig*.json ./frontend/
COPY frontend/vite.config.ts ./frontend/
COPY frontend/index.html ./frontend/
COPY frontend/postcss.config.js ./frontend/
COPY frontend/tailwind.config.js ./frontend/

# Install dependencies
RUN cd backend && npm ci
RUN cd frontend && npm ci

# Copy source code
COPY backend/src ./backend/src
COPY frontend/src ./frontend/src
COPY frontend/public ./frontend/public

# Build artifacts
RUN cd frontend && npm run build
RUN cd backend && npm run build

# ==========================================
# Stage 2: Runtime (NVIDIA CUDA + Node.js)
# Used to run the app with GPU acceleration
# ==========================================
FROM nvidia/cuda:12.1.0-base-ubuntu22.04 AS runtime

# Prevent interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
# zstd is required for Ollama
# python3, make, g++ are required for rebuilding native modules (better-sqlite3)
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    gnupg \
    zstd \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20 (Runtime)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Install Ollama
RUN curl -fsSL https://ollama.com/install.sh | sh

WORKDIR /app

# Copy built artifacts from builder stage
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/backend/package*.json ./backend/
# Copy schema for runtime usage
COPY backend/src/infrastructure/database/schema.sql ./backend/src/infrastructure/database/schema.sql

# Install production dependencies only (rebuilds native modules like sqlite)
RUN cd backend && npm ci --production

# Pre-pull AI models
# We do this in the runtime image so they persist
RUN ollama serve & \
    sleep 10 && \
    ollama pull mistral && \
    ollama pull nomic-embed-text && \
    pkill ollama

# Expose port
EXPOSE 7860

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
    CMD curl -f http://localhost:7860/health || exit 1

# Copy startup script
COPY start.sh .
RUN chmod +x start.sh

# Start container
CMD ["./start.sh"]
