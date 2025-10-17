#!/bin/bash

# Load environment variables from .env file
set -a
source .env
set +a

# Start the API server in the background
echo "Starting API server..."
cd apps/server
CLERK_SECRET_KEY=$CLERK_SECRET_KEY CLERK_WEBHOOK_SECRET=$CLERK_WEBHOOK_SECRET npx tsx src/index.ts &
API_PID=$!

# Wait a moment for API server to start
sleep 2

# Start the WebSocket server in the background
echo "Starting WebSocket server..."
CLERK_SECRET_KEY=$CLERK_SECRET_KEY CLERK_WEBHOOK_SECRET=$CLERK_WEBHOOK_SECRET npx tsx src/mediasoup-server.ts &
WS_PID=$!

# Wait a moment for WebSocket server to start
sleep 2

# Start the web app
echo "Starting web app..."
cd ../web
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY pnpm dev &
WEB_PID=$!

echo "All services started!"
echo "API Server PID: $API_PID (port 1285)"
echo "WebSocket Server PID: $WS_PID (port 4001)"
echo "Web App PID: $WEB_PID (port 3000)"
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
wait
