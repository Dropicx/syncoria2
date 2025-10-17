#!/bin/bash

echo "🐳 Testing Docker Setup for LiveKit Migration"
echo "=============================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "✅ Docker is running"

# Check if docker-compose is available
if ! command -v docker-compose > /dev/null 2>&1; then
    echo "❌ docker-compose is not installed. Please install docker-compose and try again."
    exit 1
fi

echo "✅ docker-compose is available"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Please create one based on LIVEKIT_MIGRATION_SETUP.md"
    echo "   You can copy from .env.example if it exists, or create manually."
    exit 1
fi

echo "✅ .env file found"

# Check if required environment variables are set
source .env

required_vars=(
    "LIVEKIT_API_KEY"
    "LIVEKIT_API_SECRET"
    "LIVEKIT_URL"
    "NEXT_PUBLIC_LIVEKIT_URL"
    "NEXT_PUBLIC_USE_LIVEKIT"
    "DATABASE_URL"
    "CLERK_SECRET_KEY"
    "CLERK_WEBHOOK_SECRET"
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
    "EMAIL_FROM"
    "RESEND_API_KEY"
    "FRONTEND_URL"
    "BACKEND_URL"
    "DISCORD_URL"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "❌ Missing required environment variables:"
    printf '   - %s\n' "${missing_vars[@]}"
    echo "   Please check your .env file and set all required variables."
    exit 1
fi

echo "✅ All required environment variables are set"

# Test Docker Compose configuration
echo "🔍 Testing Docker Compose configuration..."
if docker-compose config > /dev/null 2>&1; then
    echo "✅ Docker Compose configuration is valid"
else
    echo "❌ Docker Compose configuration is invalid"
    docker-compose config
    exit 1
fi

# Test if ports are available
ports=(3000 1285 5434 6379 7880 7881 7882)
for port in "${ports[@]}"; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  Port $port is already in use. This may cause conflicts."
    else
        echo "✅ Port $port is available"
    fi
done

echo ""
echo "🎉 Docker setup validation completed!"
echo ""
echo "Next steps:"
echo "1. Run './docker-dev.sh' to start all services"
echo "2. Open http://localhost:3000 in your browser"
echo "3. Test video calls with both Mediasoup and LiveKit"
echo ""
echo "To switch between Mediasoup and LiveKit:"
echo "- Set NEXT_PUBLIC_USE_LIVEKIT=false for Mediasoup"
echo "- Set NEXT_PUBLIC_USE_LIVEKIT=true for LiveKit"
echo "- Restart the web service: docker-compose restart web"
