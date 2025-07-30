#!/bin/bash

# Production Database Migration Script
# This script safely migrates the database in production environment

set -e  # Exit on any error

echo "🚀 Starting production database migration..."

# Configuration
BACKUP_DIR="/var/backups/cms/migrations"
DATE=$(date +%Y%m%d_%H%M%S)
DB_PATH="./prisma/prod.db"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to create backup
create_backup() {
    log "Creating database backup..."
    if [ -f "$DB_PATH" ]; then
        cp "$DB_PATH" "$BACKUP_DIR/prod_backup_$DATE.db"
        log "✅ Database backup created: $BACKUP_DIR/prod_backup_$DATE.db"
    else
        log "⚠️  Database file not found, skipping backup"
    fi
}

# Function to verify backup
verify_backup() {
    local backup_file="$BACKUP_DIR/prod_backup_$DATE.db"
    if [ -f "$backup_file" ]; then
        # Simple verification - check if file is not empty and is a valid SQLite file
        if [ -s "$backup_file" ]; then
            sqlite3 "$backup_file" "SELECT name FROM sqlite_master WHERE type='table';" > /dev/null 2>&1
            if [ $? -eq 0 ]; then
                log "✅ Backup verification successful"
                return 0
            fi
        fi
    fi
    log "❌ Backup verification failed"
    return 1
}

# Function to run migrations
run_migrations() {
    log "Running database migrations..."
    
    # Generate Prisma client
    log "Generating Prisma client..."
    npm run db:generate
    
    # Run migrations
    log "Applying database migrations..."
    npm run db:migrate
    
    log "✅ Database migrations completed successfully"
}

# Function to verify migration
verify_migration() {
    log "Verifying migration..."
    
    # Check if database is accessible
    node -e "
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        async function verify() {
            try {
                // Test basic database connectivity
                await prisma.\$connect();
                console.log('✅ Database connection successful');
                
                // Check if required tables exist
                const tables = await prisma.\$queryRaw\`
                    SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'
                \`;
                
                const requiredTables = ['HomepageContent', 'HomepageVersion', 'User', 'Project', 'MediaFile'];
                const existingTables = tables.map(t => t.name);
                
                for (const table of requiredTables) {
                    if (existingTables.includes(table)) {
                        console.log(\`✅ Table \${table} exists\`);
                    } else {
                        console.log(\`❌ Table \${table} missing\`);
                        process.exit(1);
                    }
                }
                
                console.log('✅ All required tables exist');
                await prisma.\$disconnect();
            } catch (error) {
                console.error('❌ Migration verification failed:', error.message);
                process.exit(1);
            }
        }
        
        verify();
    "
    
    if [ $? -eq 0 ]; then
        log "✅ Migration verification successful"
        return 0
    else
        log "❌ Migration verification failed"
        return 1
    fi
}

# Function to rollback migration
rollback_migration() {
    log "🔄 Rolling back migration..."
    local backup_file="$BACKUP_DIR/prod_backup_$DATE.db"
    
    if [ -f "$backup_file" ]; then
        cp "$backup_file" "$DB_PATH"
        log "✅ Database restored from backup"
    else
        log "❌ Backup file not found, cannot rollback"
        return 1
    fi
}

# Function to cleanup old backups
cleanup_old_backups() {
    log "Cleaning up old backups (keeping last 10)..."
    find "$BACKUP_DIR" -name "prod_backup_*.db" -type f | sort -r | tail -n +11 | xargs -r rm
    log "✅ Old backups cleaned up"
}

# Main execution
main() {
    log "Starting production migration process..."
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ] || [ ! -d "prisma" ]; then
        log "❌ Error: Must be run from the backend directory"
        exit 1
    fi
    
    # Check if NODE_ENV is set to production
    if [ "$NODE_ENV" != "production" ]; then
        log "⚠️  Warning: NODE_ENV is not set to 'production'"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "Migration cancelled"
            exit 1
        fi
    fi
    
    # Create backup
    create_backup
    
    # Verify backup
    if ! verify_backup; then
        log "❌ Backup verification failed, aborting migration"
        exit 1
    fi
    
    # Run migrations
    if run_migrations; then
        # Verify migration
        if verify_migration; then
            log "🎉 Migration completed successfully!"
            cleanup_old_backups
        else
            log "❌ Migration verification failed, rolling back..."
            rollback_migration
            exit 1
        fi
    else
        log "❌ Migration failed, rolling back..."
        rollback_migration
        exit 1
    fi
}

# Handle script interruption
trap 'log "Migration interrupted, rolling back..."; rollback_migration; exit 1' INT TERM

# Run main function
main "$@"

log "✅ Production migration completed successfully!"