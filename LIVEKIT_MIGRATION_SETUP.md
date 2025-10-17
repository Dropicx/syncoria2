# LiveKit Migration Setup Guide

This document provides instructions for setting up the LiveKit migration with Docker.

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/call
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=call

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Clerk Authentication
CLERK_SECRET_KEY=sk_test_your-clerk-secret-key-here
CLERK_WEBHOOK_SECRET=whsec_your-clerk-webhook-secret-here
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-clerk-publishable-key-here

# Email Configuration
EMAIL_FROM=noreply@yourdomain.com
RESEND_API_KEY=your-resend-api-key-here

# Application URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:1285

# Discord Integration
DISCORD_URL=your-discord-webhook-url-here

# Legacy Better Auth (optional - for migration compatibility)
BETTER_AUTH_SECRET=your-32-character-secret-here
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# Mediasoup Configuration (Legacy - to be removed after migration)
MEDIASOUP_ANNOUNCED_IP=127.0.0.1

# LiveKit Configuration
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=your-generated-secret-key-here
LIVEKIT_URL=ws://localhost:7880
NEXT_PUBLIC_LIVEKIT_URL=ws://localhost:7880
NEXT_PUBLIC_USE_LIVEKIT=false

# Server Configuration
PORT=1285
```

## Docker Setup

### Prerequisites
- Docker and Docker Compose installed
- Node.js 20+ (for local development)

### Quick Start

1. **Clone and setup environment:**
   ```bash
   git clone <repository-url>
   cd syncoria2
   cp .env.example .env  # Edit with your actual values
   ```

2. **Start all services with Docker:**
   ```bash
   chmod +x docker-dev.sh docker-stop.sh
   ./docker-dev.sh
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:1285
   - LiveKit: ws://localhost:7880
   - PostgreSQL: localhost:5434
   - Redis: localhost:6379

### Development Commands

```bash
# Start all services
./docker-dev.sh

# Stop all services
./docker-stop.sh

# View logs
docker-compose logs -f [service-name]

# Restart specific service
docker-compose restart [service-name]

# Rebuild after dependency changes
docker-compose up --build [service-name]

# Execute commands in container
docker-compose exec backend pnpm db:generate
docker-compose exec web pnpm typecheck
```

## Feature Flag

The migration includes a feature flag to switch between Mediasoup and LiveKit:

- `NEXT_PUBLIC_USE_LIVEKIT=false` - Use Mediasoup (default)
- `NEXT_PUBLIC_USE_LIVEKIT=true` - Use LiveKit

## Testing

### Test with Mediasoup (Flag OFF)
1. Ensure `NEXT_PUBLIC_USE_LIVEKIT=false` in .env
2. Start Docker services
3. Test video/audio calls, screen sharing, multi-participant calls

### Test with LiveKit (Flag ON)
1. Set `NEXT_PUBLIC_USE_LIVEKIT=true` in .env
2. Restart Docker services
3. Test all call features with LiveKit

## Architecture

**Before (Mediasoup):**
- Frontend → Custom WebSocket (port 4001) → Mediasoup Server
- Frontend → REST API (port 1285) → Hono Server → PostgreSQL

**After (LiveKit + Docker):**
- Frontend Container (port 3000) → LiveKit Container (port 7880)
- Frontend Container (port 3000) → Backend Container (port 1285) → PostgreSQL Container
- All services managed via Docker Compose

## Services

- **postgres**: PostgreSQL database (port 5434)
- **redis**: Redis cache (port 6379)
- **livekit**: LiveKit server (ports 7880, 7881, 7882, 50000-50200/udp)
- **backend**: Hono API server (port 1285)
- **web**: Next.js frontend (port 3000)

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000, 1285, 5434, 6379, 7880-7882 are available
2. **Permission issues**: Run `chmod +x docker-dev.sh docker-stop.sh`
3. **Build failures**: Try `docker-compose up --build --force-recreate`
4. **Environment variables**: Ensure all required variables are set in .env

### Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs livekit
docker-compose logs backend
docker-compose logs web

# Follow logs in real-time
docker-compose logs -f livekit
```

## Migration Completion

After successful testing:

1. Set `NEXT_PUBLIC_USE_LIVEKIT=true` permanently
2. Remove Mediasoup code and dependencies
3. Update documentation
4. Deploy to production

## Benefits

- **Consistent Environment**: Same setup for all developers
- **Easy Onboarding**: Clone and run `./docker-dev.sh`
- **Production Parity**: Dev environment matches production
- **Isolated Services**: No port conflicts or dependency issues
- **Service Discovery**: Containers communicate via service names
- **Resource Management**: Control CPU/memory per service
