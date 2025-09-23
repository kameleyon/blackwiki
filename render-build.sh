#!/bin/bash
# render-build.sh - Build script for Render deployment

echo "==> Starting build process..."

# Install dependencies
echo "==> Installing dependencies..."
npm install

# Generate Prisma Client
echo "==> Generating Prisma Client..."
npx prisma generate

# Push database schema (create tables if they don't exist)
echo "==> Setting up database schema..."
npx prisma db push --skip-generate

# Optional: Run database seed (uncomment if you have seed data)
# echo "==> Seeding database..."
# npx prisma db seed

# Build the Next.js application
echo "==> Building Next.js application..."
npm run build

echo "==> Build complete!"