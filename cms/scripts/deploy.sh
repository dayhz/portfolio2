#!/bin/bash

# Homepage CMS Deployment Script
# This script automates the deployment process for the CMS system

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
PORTFOLIO_DIR="$(dirname "$PROJECT_ROOT")/portfolio2"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to log messages with colors
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check Node.js
    if ! command_exists node; then
        error "Node.js is not installed"
        exit 1
    fi
    
    local node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 18 ]; then
        error "Node.js version 18 or higher is required (current: $(node --version))"
        exit 1
    fi
    success "Node.js $(node --version) is installed"
    
    # Check npm
    if ! command_exists npm; then
        error "npm is not installed"
        exit 1
    fi
    success "npm $(npm --version) is installed"
    
    # Check PM2 (optional)
    if command_exists pm2; then
        success "PM2 $(pm2 --version) is available"
    else
        warning "PM2 is not installed (recommended for production)"
    fi
    
    # Check directories
    if [ ! -d "$BACKEND_DIR" ]; then
        error "Backend directory not found: $BACKEND_DIR"
        exit 1
    fi
    
    if [ ! -d "$FRONTEND_DIR" ]; then
        error "Frontend directory not found: $FRONTEND_DIR"
        exit 1
    fi
    
    if [ ! -d "$PORTFOLIO_DIR" ]; then
        error "Portfolio directory not found: $PORTFOLIO_DIR"
        exit 1
    fi
    
    success "All directories found"
}

# Function to backup current deployment
backup_deployment() {
    log "Creating deployment backup..."
    
    local backup_dir="/tmp/cms-backup-$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Backup database
    if [ -f "$BACKEND_DIR/prisma/prod.db" ]; then
        cp "$BACKEND_DIR/prisma/prod.db" "$backup_dir/"
        success "Database backed up"
    fi
    
    # Backup uploads
    if [ -d "$BACKEND_DIR/uploads" ]; then
        cp -r "$BACKEND_DIR/uploads" "$backup_dir/"
        success "Uploads backed up"
    fi
    
    # Backup environment files
    for env_file in "$BACKEND_DIR/.env" "$FRONTEND_DIR/.env" "$PORTFOLIO_DIR/.env"; do
        if [ -f "$env_file" ]; then
            cp "$env_file" "$backup_dir/$(basename $(dirname $env_file))-env"
        fi
    done
    
    echo "$backup_dir" > /tmp/cms-last-backup
    success "Backup created at: $backup_dir"
}

# Function to install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    # Backend dependencies
    log "Installing backend dependencies..."
    cd "$BACKEND_DIR"
    npm ci --production
    success "Backend dependencies installed"
    
    # Frontend dependencies
    log "Installing frontend dependencies..."
    cd "$FRONTEND_DIR"
    npm ci
    success "Frontend dependencies installed"
    
    # Portfolio dependencies
    log "Installing portfolio dependencies..."
    cd "$PORTFOLIO_DIR"
    npm ci --production
    success "Portfolio dependencies installed"
}

# Function to build applications
build_applications() {
    log "Building applications..."
    
    # Build backend
    log "Building backend..."
    cd "$BACKEND_DIR"
    npm run build
    success "Backend built successfully"
    
    # Build frontend
    log "Building frontend..."
    cd "$FRONTEND_DIR"
    npm run build
    success "Frontend built successfully"
}

# Function to run database migrations
run_migrations() {
    log "Running database migrations..."
    
    cd "$BACKEND_DIR"
    
    # Generate Prisma client
    npm run db:generate
    
    # Run migrations
    if [ -f "scripts/migrate-production.sh" ]; then
        ./scripts/migrate-production.sh
    else
        npm run db:migrate
    fi
    
    success "Database migrations completed"
}

# Function to deploy frontend
deploy_frontend() {
    log "Deploying frontend..."
    
    local web_root="/var/www/cms"
    
    if [ -d "$web_root" ]; then
        # Backup current frontend
        if [ -d "$web_root.backup" ]; then
            rm -rf "$web_root.backup"
        fi
        mv "$web_root" "$web_root.backup"
    fi
    
    # Create web root directory
    sudo mkdir -p "$web_root"
    
    # Copy built frontend
    sudo cp -r "$FRONTEND_DIR/dist/"* "$web_root/"
    
    # Set proper permissions
    sudo chown -R www-data:www-data "$web_root"
    sudo chmod -R 755 "$web_root"
    
    success "Frontend deployed to $web_root"
}

# Function to restart services
restart_services() {
    log "Restarting services..."
    
    if command_exists pm2; then
        # Restart PM2 processes
        pm2 restart all || pm2 start ecosystem.config.js
        success "PM2 services restarted"
    else
        warning "PM2 not available, manual service restart required"
    fi
    
    # Restart Nginx if available
    if command_exists nginx; then
        sudo nginx -t && sudo systemctl reload nginx
        success "Nginx reloaded"
    fi
}

# Function to verify deployment
verify_deployment() {
    log "Verifying deployment..."
    
    # Wait for services to start
    sleep 5
    
    # Check backend health
    local backend_url="http://localhost:8000/api/health"
    if curl -f -s "$backend_url" > /dev/null; then
        success "Backend is responding"
    else
        error "Backend health check failed"
        return 1
    fi
    
    # Check portfolio server
    local portfolio_url="http://localhost:3001"
    if curl -f -s "$portfolio_url" > /dev/null; then
        success "Portfolio server is responding"
    else
        error "Portfolio server health check failed"
        return 1
    fi
    
    # Check frontend (if web server is configured)
    local frontend_url="http://localhost"
    if curl -f -s "$frontend_url" > /dev/null 2>&1; then
        success "Frontend is accessible"
    else
        warning "Frontend accessibility check skipped (web server may not be configured)"
    fi
    
    success "Deployment verification completed"
}

# Function to rollback deployment
rollback_deployment() {
    error "Deployment failed, initiating rollback..."
    
    if [ -f "/tmp/cms-last-backup" ]; then
        local backup_dir=$(cat /tmp/cms-last-backup)
        
        if [ -d "$backup_dir" ]; then
            log "Restoring from backup: $backup_dir"
            
            # Restore database
            if [ -f "$backup_dir/prod.db" ]; then
                cp "$backup_dir/prod.db" "$BACKEND_DIR/prisma/"
                success "Database restored"
            fi
            
            # Restore uploads
            if [ -d "$backup_dir/uploads" ]; then
                rm -rf "$BACKEND_DIR/uploads"
                cp -r "$backup_dir/uploads" "$BACKEND_DIR/"
                success "Uploads restored"
            fi
            
            # Restart services
            restart_services
            
            success "Rollback completed"
        else
            error "Backup directory not found: $backup_dir"
        fi
    else
        error "No backup information found"
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --skip-backup     Skip creating deployment backup"
    echo "  --skip-deps       Skip installing dependencies"
    echo "  --skip-build      Skip building applications"
    echo "  --skip-migrate    Skip database migrations"
    echo "  --skip-frontend   Skip frontend deployment"
    echo "  --skip-restart    Skip service restart"
    echo "  --skip-verify     Skip deployment verification"
    echo "  --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                    # Full deployment"
    echo "  $0 --skip-deps        # Deploy without installing dependencies"
    echo "  $0 --skip-frontend    # Deploy backend only"
}

# Main deployment function
main() {
    local skip_backup=false
    local skip_deps=false
    local skip_build=false
    local skip_migrate=false
    local skip_frontend=false
    local skip_restart=false
    local skip_verify=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-backup)
                skip_backup=true
                shift
                ;;
            --skip-deps)
                skip_deps=true
                shift
                ;;
            --skip-build)
                skip_build=true
                shift
                ;;
            --skip-migrate)
                skip_migrate=true
                shift
                ;;
            --skip-frontend)
                skip_frontend=true
                shift
                ;;
            --skip-restart)
                skip_restart=true
                shift
                ;;
            --skip-verify)
                skip_verify=true
                shift
                ;;
            --help)
                show_usage
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    log "Starting CMS deployment..."
    
    # Check prerequisites
    check_prerequisites
    
    # Create backup
    if [ "$skip_backup" = false ]; then
        backup_deployment
    else
        warning "Skipping backup creation"
    fi
    
    # Install dependencies
    if [ "$skip_deps" = false ]; then
        install_dependencies
    else
        warning "Skipping dependency installation"
    fi
    
    # Build applications
    if [ "$skip_build" = false ]; then
        build_applications
    else
        warning "Skipping application build"
    fi
    
    # Run database migrations
    if [ "$skip_migrate" = false ]; then
        run_migrations
    else
        warning "Skipping database migrations"
    fi
    
    # Deploy frontend
    if [ "$skip_frontend" = false ]; then
        deploy_frontend
    else
        warning "Skipping frontend deployment"
    fi
    
    # Restart services
    if [ "$skip_restart" = false ]; then
        restart_services
    else
        warning "Skipping service restart"
    fi
    
    # Verify deployment
    if [ "$skip_verify" = false ]; then
        if ! verify_deployment; then
            rollback_deployment
            exit 1
        fi
    else
        warning "Skipping deployment verification"
    fi
    
    success "🎉 Deployment completed successfully!"
    log "Your CMS is now running and ready to use."
}

# Handle script interruption
trap 'error "Deployment interrupted"; rollback_deployment; exit 1' INT TERM

# Run main function with all arguments
main "$@"