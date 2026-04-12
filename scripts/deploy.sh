#!/bin/bash

# Phenol Deployment Script for EC2
# This script deploys the Phenol application to a single EC2 instance

set -e

# Configuration
APP_NAME="phenol"
DEPLOY_DIR="/opt/$APP_NAME"
BACKUP_DIR="/opt/$APP_NAME-backups"
LOG_FILE="/var/log/$APP_NAME-deploy.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a "$LOG_FILE"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   error "This script must be run as root (use sudo)"
fi

# Create directories
mkdir -p "$DEPLOY_DIR"
mkdir -p "$BACKUP_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

log "Starting Phenol deployment..."

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    log "Installing Docker..."
    apt-get update
    apt-get install -y ca-certificates curl gnupg lsb-release
    
    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Set up the repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker Engine
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Start and enable Docker
    systemctl start docker
    systemctl enable docker
    
    log "Docker installed successfully"
else
    log "Docker already installed"
fi

# Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
    log "Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    log "Docker Compose installed successfully"
else
    log "Docker Compose already installed"
fi

# Check if source code exists
if [ ! -d "$DEPLOY_DIR/source" ]; then
    error "Source code not found in $DEPLOY_DIR/source"
    log "Please clone the repository first:"
    log "git clone https://github.com/your-org/phenol.git $DEPLOY_DIR/source"
fi

cd "$DEPLOY_DIR/source"

# Pull latest changes
log "Pulling latest changes..."
git pull origin main

# Create backup of current running containers
if docker-compose ps -q | grep -q .; then
    log "Creating backup of current deployment..."
    BACKUP_NAME="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_NAME"
    
    # Backup database
    if docker-compose ps postgres | grep -q "Up"; then
        docker-compose exec -T postgres pg_dump -U phenol phenol > "$BACKUP_NAME/database.sql"
        log "Database backed up to $BACKUP_NAME/database.sql"
    fi
    
    # Stop current services
    log "Stopping current services..."
    docker-compose down
fi

# Build and start new containers
log "Building and starting new containers..."
docker-compose build --no-cache
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

# Run database migrations
log "Running database migrations..."
docker-compose exec -T api pnpm prisma:migrate

# Seed database if needed
log "Seeding database..."
docker-compose exec -T api pnpm prisma:seed

# Clean up old Docker images and containers
log "Cleaning up old Docker resources..."
docker image prune -f
docker container prune -f

# Set up log rotation
cat > /etc/logrotate.d/$APP_NAME << EOF
/var/log/$APP_NAME-deploy.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
}
EOF

log "Deployment completed successfully!"
log "Services are running at:"
log "  - API: http://localhost:23001"
log "  - Web: http://localhost:23000"
log "  - API Documentation: http://localhost:23001/api"
log "  - SonarQube: http://localhost:29000 (if enabled)"

# Display running containers
log "Running containers:"
docker-compose ps
