#!/bin/bash
# Stop all containers

echo "🛑 Stopping Docker containers..."

# Stop all containers
docker-compose down

# With cleanup (uncomment to remove volumes):
# docker-compose down -v

echo "✅ Containers stopped"
