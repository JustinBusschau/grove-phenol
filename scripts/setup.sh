#!/bin/bash

# Phenol Setup Script
# This script sets up the development environment for Phenol

set -e

echo "Setting up Phenol development environment..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "pnpm is not installed. Installing pnpm..."
    npm install -g pnpm
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Build shared packages
echo "Building shared packages..."
pnpm --filter @phenol/types build

# Copy environment file
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "Please update .env with your configuration."
fi

# Start Docker services
echo "Starting Docker services..."
cd infra/docker
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 10

# Run database migrations
echo "Running database migrations..."
cd ../../
pnpm --filter @phenol/api prisma:migrate

# Seed database with initial data
echo "Seeding database..."
cd apps/api
npx prisma db seed || echo "Seed script not found, skipping..."

echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your configuration"
echo "2. Start the development environment: cd infra/docker && docker-compose up"
echo "3. Visit http://localhost:3000 for the frontend"
echo "4. Visit http://localhost:3001/api/docs for the API documentation"
echo "5. Visit http://localhost:9000 for SonarQube (admin/admin)"
