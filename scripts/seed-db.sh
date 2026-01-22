#!/bin/bash
set -e

echo "🌱 Seeding ShadowStream database..."

cd packages/database

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL environment variable is not set"
  echo "   Please set it in .env.local or export it:"
  echo "   export DATABASE_URL='postgresql://user:password@localhost:5432/shadowstream?schema=public'"
  exit 1
fi

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
pnpm db:generate

# Check if migrations exist
if [ ! -d "prisma/migrations" ] || [ -z "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  echo "📝 Creating initial migration..."
  pnpm db:migrate --name init
else
  echo "📝 Applying migrations..."
  pnpm db:migrate:deploy || pnpm db:migrate
fi

# Seed database
echo "🌱 Seeding database..."
pnpm db:seed

echo ""
echo "✅ Database seeded successfully!"
echo ""
echo "You can now:"
echo "  - View data: pnpm db:studio"
echo "  - Query via API: pnpm dev"
echo ""
