# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (incorporating security best practices)
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build \
    && npm prune --production

# Production Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user (alpine already has 'node' user)
# We use the default 'node' user for security

COPY --from=builder --chown=node:node /app/package*.json ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist

USER node

# Expose the port (matches server.ts default if we set one, usually 3000)
EXPOSE 3000

CMD ["node", "dist/index.js"]
