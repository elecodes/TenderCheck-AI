# ==========================================
# Stage 1: Builder (NVIDIA CUDA - Ubuntu 22.04)
# Used to compile TypeScript, build React Frontend, and build Native Modules
# Using the same base image ensures ABI compatibility for shared libraries (GLIBC)
# ==========================================
FROM nvidia/cuda:12.1.0-base-ubuntu22.04 AS builder

ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies (Build Tools)
# python-is-python3 and git are CRITICAL for npm ci
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    gnupg \
    build-essential \
    python3 \
    python-is-python3 \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy configuration files
COPY backend/package*.json ./backend/
COPY backend/tsconfig.json ./backend/
COPY frontend/package*.json ./frontend/
COPY frontend/tsconfig*.json ./frontend/
COPY frontend/vite.config.ts ./frontend/
COPY frontend/index.html ./frontend/
COPY frontend/postcss.config.js ./frontend/
COPY frontend/tailwind.config.js ./frontend/

# Install dependencies (including devDeps)
RUN cd backend && npm ci
RUN cd frontend && npm ci

# Copy source code
COPY backend/src ./backend/src
COPY frontend/src ./frontend/src
COPY frontend/public ./frontend/public

# Build artifacts
RUN cd frontend && npm run build
RUN cd backend && npm run build

# Prune backend dependencies to production only
# This removes devDeps but keeps built native modules
RUN cd backend && npm prune --production

# ==========================================
# Stage 2: Runtime (NVIDIA CUDA - Ubuntu 22.04)
# Used to run the app with GPU acceleration
# ==========================================
FROM nvidia/cuda:12.1.0-base-ubuntu22.04 AS runtime

ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies (Runtime)
# zstd for Ollama
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    gnupg \
    zstd \
    build-essential \
    python3 \
    python-is-python3 \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Install Ollama
RUN curl -fsSL https://ollama.com/install.sh | sh

WORKDIR /app

# Copy built artifacts and dependencies from builder
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/backend/package.json ./backend/
# CRITICAL: Copy node_modules from builder to avoid running npm ci in runtime (Exit 127 fix)
COPY --from=builder /app/backend/node_modules ./backend/node_modules

# Copy schema and ensure it's in dist for runtime access
COPY backend/src/infrastructure/database/schema.sql ./backend/src/infrastructure/database/schema.sql
COPY backend/src/infrastructure/database/schema.sql ./backend/dist/infrastructure/database/schema.sql

# Pre-pull AI models
RUN ollama serve & \
    sleep 10 && \
    ollama pull mistral && \
    ollama pull nomic-embed-text && \
    pkill ollama

# Expose port (Standard Node.js port)
EXPOSE 3000

# Runtime Environment Variables (Production)
ENV PORT=3000
ENV NODE_ENV=production
ENV ALLOWED_ORIGINS=*
ENV DATABASE_PATH=/app/data/tender.db

# Create data directory with permissions for SQLite
RUN mkdir -p /app/data && chmod 777 /app/data

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
    CMD curl -f http://localhost:7860/health || exit 1

# Copy startup script
COPY start.sh .
RUN chmod +x start.sh

# Start container
CMD ["./start.sh"]
