FROM node:20-alpine

# Install dependencies
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy packages
COPY packages/ ./packages/

# Copy service files
COPY services/backend/ ./services/backend/

# Install dependencies at root level
RUN corepack enable pnpm && pnpm install

# Set working directory to service
WORKDIR /app/services/backend

# Expose port
EXPOSE 1285

# Development command with hot reload
CMD ["sh", "-c", "cd /app/services/backend && pnpm dev"]