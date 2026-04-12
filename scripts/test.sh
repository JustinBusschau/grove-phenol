#!/bin/bash

# Phenol Test Script
# This script runs all tests for the Phenol project

set -e

echo "Running Phenol tests..."

# Build shared packages first
echo "Building shared packages..."
pnpm --filter @phenol/types build

# Run type checking
echo "Running type checking..."
pnpm typecheck

# Run linting
echo "Running linting..."
pnpm lint

# Run backend tests
echo "Running backend tests..."
pnpm --filter @phenol/api test

# Run frontend tests
echo "Running frontend tests..."
pnpm --filter @phenol/web test

# Run e2e tests
echo "Running e2e tests..."
pnpm --filter @phenol/api test:e2e

echo "All tests completed successfully!"
