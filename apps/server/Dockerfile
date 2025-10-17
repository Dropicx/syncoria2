FROM node:20-alpine

# Install dependencies
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY apps/server/package.json ./apps/server/
COPY packages/ ./packages/

# Install dependencies
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# Copy source code
COPY . .

# Expose port
EXPOSE 1285

# Development command with hot reload
CMD ["pnpm", "--filter", "@call/server", "dev"]
