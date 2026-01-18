#!/bin/bash
set -e

echo "🚀 Setting up ShadowStream development environment..."

# Check prerequisites
echo "📋 Checking prerequisites..."
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "❌ pnpm is required but not installed. Aborting." >&2; exit 1; }
command -v anchor >/dev/null 2>&1 || { echo "⚠️  Anchor CLI not found. Smart contracts won't build." >&2; }
command -v psql >/dev/null 2>&1 || { echo "⚠️  PostgreSQL not found. Database setup will be skipped." >&2; }

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Setup environment
if [ ! -f .env.local ]; then
  echo "⚙️  Creating .env.local from .env.example..."
  cp .env.example .env.local
  echo "⚠️  Please update .env.local with your configuration"
fi

# Setup database
if command -v psql >/dev/null 2>&1; then
  echo "🗄️  Setting up database..."
  cd packages/database
  pnpm db:generate || echo "⚠️  Prisma generate failed. Make sure DATABASE_URL is set."
  cd ../..
else
  echo "⚠️  Skipping database setup (PostgreSQL not found)"
fi

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your configuration"
echo "2. Run 'pnpm dev' to start the development server"
echo "3. Visit http://localhost:3000"
