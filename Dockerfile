# Hugging Face Spaces Dockerfile with GPU support
# Base image with CUDA for GPU acceleration
FROM nvidia/cuda:12.1.0-base-ubuntu22.04

# Prevent interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    gnupg \
    zstd \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Install Ollama with GPU support
RUN curl -fsSL https://ollama.com/install.sh | sh

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
# Install dependencies calling npm ci (which installs devDeps for tsc)
RUN cd backend && npm ci
RUN cd frontend && npm ci

# Copy application code
COPY backend ./backend
COPY frontend ./frontend

# Build frontend and backend
RUN cd frontend && npm run build
RUN cd backend && npm run build
# Prune dev dependencies to save space (optional, but good practice)
RUN cd backend && npm prune --production

# Pre-pull AI models (this happens during Docker build, not runtime)
# This makes the first request much faster
RUN ollama serve & \
    sleep 10 && \
    ollama pull mistral && \
    ollama pull nomic-embed-text && \
    pkill ollama

# Expose port (HF Spaces defaults to 7860, but we map it or use environment)
EXPOSE 7860

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:7860/health || exit 1

# Start Ollama in background and then start the app
# Use PORT=7860 for Hugging Face
# Copy startup script
COPY start.sh .

# Start container using script
CMD ["./start.sh"]
