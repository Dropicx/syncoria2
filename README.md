# Syncoria2 🎥

A modern, real-time video/audio conferencing application built with Next.js, Hono, and LiveKit.

## 🚀 Features

- **Real-time Video/Audio Calls** - Powered by LiveKit for high-quality WebRTC communication
- **Modern Tech Stack** - Next.js 15, Hono, TypeScript, and Tailwind CSS
- **Docker Ready** - Complete containerization with Docker Compose
- **Authentication** - Secure user management with Clerk
- **Team Management** - Create teams, manage contacts, and schedule calls
- **Responsive Design** - Beautiful UI that works on all devices

## 🏗️ Architecture

```
syncoria2/
├── services/
│   ├── web/          # Next.js frontend
│   ├── backend/      # Hono API server
│   └── livekit/      # LiveKit server configuration
├── packages/         # Shared packages (auth, db, ui)
└── docker-compose.yml
```

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)
- pnpm (package manager)

### Environment Setup

1. **Copy environment variables:**

   ```bash
   cp .env.example .env
   ```

2. **Update your `.env` file with:**

   ```env
   # Database
   DATABASE_URL=postgresql://postgres:postgres@localhost:5434/call

   # LiveKit Configuration
   LIVEKIT_API_KEY=devkey
   LIVEKIT_API_SECRET=your-generated-secret-key
   LIVEKIT_URL=ws://localhost:7880
   NEXT_PUBLIC_LIVEKIT_URL=ws://localhost:7880
   NEXT_PUBLIC_USE_LIVEKIT=true

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-key
   CLERK_SECRET_KEY=your-clerk-secret
   CLERK_WEBHOOK_SECRET=your-clerk-webhook-secret

   # Redis
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

### Development

**Using Docker (Recommended):**

```bash
# Start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Local Development:**

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev
```

### Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:1285
- **LiveKit**: ws://localhost:7880
- **PostgreSQL**: localhost:5434
- **Redis**: localhost:6379

## 🛠️ Development

### Project Structure

- **Frontend** (`services/web/`): Next.js application with LiveKit integration
- **Backend** (`services/backend/`): Hono API server with authentication and call management
- **Packages** (`packages/`): Shared utilities, database schemas, and UI components

### Key Features

- **LiveKit Integration**: Modern WebRTC solution for video/audio calls
- **Dual Support**: Can run both Mediasoup and LiveKit (feature flag controlled)
- **Team Management**: Create teams, invite members, manage contacts
- **Call History**: Track and manage call sessions
- **Real-time Notifications**: WebSocket-based notifications
- **Responsive Design**: Mobile-first, accessible UI

### Scripts

```bash
# Development
pnpm dev                 # Start all services
pnpm dev:web            # Start only frontend
pnpm dev:backend        # Start only backend

# Docker
pnpm docker:up          # Start Docker services
pnpm docker:down        # Stop Docker services
pnpm docker:clean       # Clean Docker volumes

# Database
pnpm db:generate        # Generate database migrations
pnpm db:migrate         # Run database migrations
```

## 🔧 Configuration

### LiveKit Setup

1. **Generate API Secret:**

   ```bash
   openssl rand -base64 32
   ```

2. **Update environment variables** with your generated secret

3. **Configure LiveKit** in `services/livekit/livekit.yaml`

### Clerk Authentication

1. Create a Clerk account at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy your keys to the `.env` file

## 🚀 Deployment

### Docker Production

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables

Ensure all required environment variables are set in your production environment:

- Database connection string
- LiveKit API keys and URL
- Clerk authentication keys
- Redis connection details
- Email service configuration

## 📚 Documentation

- [LiveKit Migration Guide](LIVEKIT_MIGRATION_SETUP.md)
- [Testing Plan](TESTING_PLAN.md)
- [Migration Summary](MIGRATION_SUMMARY.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [LiveKit](https://livekit.io/) for WebRTC infrastructure
- [Next.js](https://nextjs.org/) for the React framework
- [Hono](https://hono.dev/) for the API framework
- [Clerk](https://clerk.com/) for authentication
- [Tailwind CSS](https://tailwindcss.com/) for styling
