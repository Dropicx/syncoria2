#!/bin/bash
# Build and start all containers for development

echo "🐳 Building and starting Docker containers..."

# Build and start all services
docker-compose up --build

# Alternative for detached mode:
# docker-compose up -d --build
