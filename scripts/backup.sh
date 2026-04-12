#!/bin/bash

# Phenol Backup Script
# This script creates backups of the Phenol application data

set -e

# Configuration
APP_NAME="phenol"
DEPLOY_DIR="/opt/$APP_NAME"
BACKUP_DIR="/opt/$APP_NAME-backups"
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_NAME="$BACKUP_DIR/backup-$DATE"

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

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   error "This script must be run as root (use sudo)"
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"
mkdir -p "$BACKUP_NAME"

log "Starting Phenol backup..."

# Change to deployment directory
cd "$DEPLOY_DIR/source"

# Backup database
if docker-compose ps postgres | grep -q "Up"; then
    log "Backing up database..."
    docker-compose exec -T postgres pg_dump -U phenol phenol > "$BACKUP_NAME/database.sql"
    log "Database backed up to $BACKUP_NAME/database.sql"
else
    error "Database container is not running"
fi

# Backup environment files
log "Backing up configuration files..."
cp .env "$BACKUP_NAME/" 2>/dev/null || warning "No .env file found"
cp docker-compose.yml "$BACKUP_NAME/"
cp -r infra/docker "$BACKUP_NAME/"

# Backup application logs
if [ -d "/var/log/$APP_NAME" ]; then
    log "Backing up application logs..."
    cp -r /var/log/$APP_NAME "$BACKUP_NAME/logs"
fi

# Create backup info file
cat > "$BACKUP_NAME/backup-info.txt" << EOF
Backup created: $(date)
Application: $APP_NAME
Git commit: $(git rev-parse HEAD)
Git branch: $(git branch --show-current)
Docker images:
$(docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.ID}}")
Docker containers:
$(docker-compose ps)
EOF

# Compress backup
log "Compressing backup..."
cd "$BACKUP_DIR"
tar -czf "backup-$DATE.tar.gz" "backup-$DATE"
rm -rf "backup-$DATE"

# Clean up old backups (keep last 7 days)
log "Cleaning up old backups..."
find "$BACKUP_DIR" -name "backup-*.tar.gz" -mtime +7 -delete

log "Backup completed: $BACKUP_DIR/backup-$DATE.tar.gz"

# Display backup size
BACKUP_SIZE=$(du -h "$BACKUP_DIR/backup-$DATE.tar.gz" | cut -f1)
log "Backup size: $BACKUP_SIZE"
