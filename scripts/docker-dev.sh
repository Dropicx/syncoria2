#!/bin/bash

echo "🚀 Starting Syncoria Development Environment"
echo "============================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create one based on .env.example"
    exit 1
fi

echo "✅ Docker is running"
echo "✅ .env file found"

# Build and start all services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Check service status
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "🎉 Development environment is ready!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:1285"
echo "🎥 LiveKit: ws://localhost:7880"
echo "🗄️  PostgreSQL: localhost:5434"
echo "📦 Redis: localhost:6379"
echo ""
echo "📋 Useful commands:"
echo "  View logs: docker-compose logs -f [service]"
echo "  Stop all: docker-compose down"
echo "  Restart: docker-compose restart [service]"
