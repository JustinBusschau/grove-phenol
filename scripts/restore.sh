#!/bin/bash

# Phenol Restore Script
# This script restores Phenol application from a backup

set -e

# Configuration
APP_NAME="phenol"
DEPLOY_DIR="/opt/$APP_NAME"
BACKUP_DIR="/opt/$APP_NAME-backups"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   error "This script must be run as root (use sudo)"
fi

# Check if backup file provided
if [ -z "$1" ]; then
    error "Usage: $0 <backup-file.tar.gz>"
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    error "Backup file not found: $BACKUP_FILE"
fi

# Extract backup filename
BACKUP_BASENAME=$(basename "$BACKUP_FILE" .tar.gz)
TEMP_DIR="/tmp/$APP_NAME-restore-$RANDOM"

log "Starting Phenol restore from: $BACKUP_FILE"

# Create temporary directory
mkdir -p "$TEMP_DIR"

# Extract backup
log "Extracting backup..."
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"

if [ ! -d "$TEMP_DIR/backup-$BACKUP_BASENAME" ]; then
    error "Invalid backup file structure"
fi

RESTORE_DIR="$TEMP_DIR/backup-$BACKUP_BASENAME"

# Display backup info
if [ -f "$RESTORE_DIR/backup-info.txt" ]; then
    log "Backup information:"
    cat "$RESTORE_DIR/backup-info.txt"
    echo ""
fi

# Confirm restore
read -p "Are you sure you want to restore this backup? This will replace current data. (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log "Restore cancelled"
    rm -rf "$TEMP_DIR"
    exit 0
fi

# Stop current services
cd "$DEPLOY_DIR/source"
log "Stopping current services..."
docker-compose down

# Restore database
if [ -f "$RESTORE_DIR/database.sql" ]; then
    log "Restoring database..."
    
    # Start database only
    docker-compose up -d postgres
    
    # Wait for database to be ready
    log "Waiting for database to be ready..."
    sleep 30
    
    # Drop existing database and recreate
    docker-compose exec -T postgres psql -U phenol -c "DROP DATABASE IF EXISTS phenol;"
    docker-compose exec -T postgres psql -U phenol -c "CREATE DATABASE phenol;"
    
    # Restore database
    docker-compose exec -T postgres psql -U phenol phenol < "$RESTORE_DIR/database.sql"
    
    log "Database restored successfully"
else
    error "Database backup not found"
fi

# Restore configuration files
if [ -f "$RESTORE_DIR/.env" ]; then
    log "Restoring configuration files..."
    cp "$RESTORE_DIR/.env" .
    cp "$RESTORE_DIR/docker-compose.yml" .
    cp -r "$RESTORE_DIR/docker" infra/
fi

# Start all services
log "Starting services..."
docker-compose up -d

# Wait for services to be healthy
log "Waiting for services to be healthy..."
sleep 30

# Check service health
check_health() {
    local service=$1
    local url=$2
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url" > /dev/null; then
            log "$service is healthy"
            return 0
        fi
        
        warning "$service health check failed (attempt $attempt/$max_attempts)"
        sleep 10
        ((attempt++))
    done
    
    error "$service failed to become healthy after $max_attempts attempts"
}

# Check API health
check_health "API" "http://localhost:23001/health"

# Check Web health
check_health "Web" "http://localhost:23000"

# Clean up
rm -rf "$TEMP_DIR"

log "Restore completed successfully!"
log "Services are running at:"
log "  - API: http://localhost:23001"
log "  - Web: http://localhost:23000"
log "  - API Documentation: http://localhost:23001/api"
