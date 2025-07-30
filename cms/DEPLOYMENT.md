# Homepage CMS Deployment Guide

This guide provides step-by-step instructions for deploying the Homepage CMS system in production.

## System Requirements

### Server Requirements
- **Node.js**: Version 18.x or higher
- **Database**: SQLite (included) or PostgreSQL for production
- **Memory**: Minimum 2GB RAM
- **Storage**: Minimum 10GB free space (for uploads and database)
- **Network**: HTTPS support recommended

### Dependencies
- **Redis**: For caching (optional but recommended)
- **PM2**: For process management (recommended)
- **Nginx**: For reverse proxy and static file serving

## Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Node.js 18+ installed
- [ ] Git repository cloned
- [ ] Environment variables configured
- [ ] Database initialized
- [ ] Redis server running (optional)

### 2. Security Configuration
- [ ] SSL certificates configured
- [ ] Firewall rules configured
- [ ] Admin user credentials secured
- [ ] API keys and secrets configured
- [ ] File upload permissions set

### 3. Performance Optimization
- [ ] Nginx configured for static file serving
- [ ] Redis caching enabled
- [ ] Image optimization enabled
- [ ] Gzip compression enabled

## Deployment Steps

### Step 1: Clone and Setup Repository

```bash
# Clone the repository
git clone <your-repository-url>
cd cms

# Install dependencies for backend
cd backend
npm install
npm run build

# Install dependencies for frontend
cd ../frontend
npm install
npm run build

# Install dependencies for portfolio server
cd ../../portfolio2
npm install
```

### Step 2: Environment Configuration

Create environment files for each component:

#### Backend Environment (cms/backend/.env)
```env
# Database
DATABASE_URL="file:./prisma/prod.db"
# For PostgreSQL: DATABASE_URL="postgresql://user:password@localhost:5432/cms_db"

# Server
NODE_ENV=production
PORT=8000
JWT_SECRET=your-super-secure-jwt-secret-here
BCRYPT_ROUNDS=12

# File Uploads
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm

# Redis (optional)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password

# CORS
CORS_ORIGIN=https://your-domain.com,https://cms.your-domain.com

# Performance
CACHE_TTL=1800
ENABLE_COMPRESSION=true
```

#### Frontend Environment (cms/frontend/.env)
```env
VITE_API_URL=https://api.your-domain.com
VITE_PORTFOLIO_URL=https://your-domain.com
NODE_ENV=production
```

#### Portfolio Environment (portfolio2/.env)
```env
NODE_ENV=production
PORT=3001
CMS_API_URL=https://api.your-domain.com/api
```

### Step 3: Database Setup

```bash
cd cms/backend

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Create admin user
npm run init:admin
```

### Step 4: Build Applications

```bash
# Build backend
cd cms/backend
npm run build

# Build frontend
cd ../frontend
npm run build

# Copy frontend build to serve directory
cp -r dist/* /var/www/cms/
```

### Step 5: Configure Nginx

Create Nginx configuration file `/etc/nginx/sites-available/cms`:

```nginx
# CMS Frontend
server {
    listen 80;
    listen [::]:80;
    server_name cms.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name cms.your-domain.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;

    root /var/www/cms;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Cache uploaded files
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Portfolio Site
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve static assets directly
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3001;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Proxy uploads from CMS
    location /uploads {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# API Server (optional separate subdomain)
server {
    listen 80;
    listen [::]:80;
    server_name api.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.your-domain.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/cms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 6: Process Management with PM2

Create PM2 ecosystem file `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'cms-backend',
      script: 'dist/server.js',
      cwd: '/path/to/cms/backend',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 8000
      },
      error_file: '/var/log/pm2/cms-backend-error.log',
      out_file: '/var/log/pm2/cms-backend-out.log',
      log_file: '/var/log/pm2/cms-backend.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024'
    },
    {
      name: 'portfolio-server',
      script: 'server.js',
      cwd: '/path/to/portfolio2',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/var/log/pm2/portfolio-error.log',
      out_file: '/var/log/pm2/portfolio-out.log',
      log_file: '/var/log/pm2/portfolio.log',
      time: true,
      max_memory_restart: '512M'
    }
  ]
};
```

Start applications:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 7: SSL Certificate Setup

Using Let's Encrypt with Certbot:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificates
sudo certbot --nginx -d your-domain.com -d cms.your-domain.com -d api.your-domain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

### Step 8: Firewall Configuration

```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Block direct access to application ports
sudo ufw deny 8000
sudo ufw deny 3001
```

## Post-Deployment Verification

### 1. Health Checks

```bash
# Check CMS API
curl https://api.your-domain.com/api/health

# Check Portfolio
curl https://your-domain.com/

# Check CMS Frontend
curl https://cms.your-domain.com/
```

### 2. Performance Tests

```bash
# Install Apache Bench
sudo apt install apache2-utils

# Test homepage performance
ab -n 100 -c 10 https://your-domain.com/

# Test API performance
ab -n 100 -c 10 https://api.your-domain.com/api/homepage
```

### 3. Security Scan

```bash
# SSL Test
curl -I https://your-domain.com/

# Security headers check
curl -I https://cms.your-domain.com/
```

## Monitoring and Maintenance

### 1. Log Monitoring

```bash
# PM2 logs
pm2 logs

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u nginx -f
```

### 2. Database Backup

Create backup script `/usr/local/bin/backup-cms.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/cms"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
cp /path/to/cms/backend/prisma/prod.db $BACKUP_DIR/database_$DATE.db

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /path/to/cms/backend/uploads/

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.db" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

Make executable and add to cron:
```bash
sudo chmod +x /usr/local/bin/backup-cms.sh
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-cms.sh
```

### 3. Update Process

Create update script `/usr/local/bin/update-cms.sh`:

```bash
#!/bin/bash
set -e

echo "Starting CMS update..."

# Backup before update
/usr/local/bin/backup-cms.sh

# Pull latest changes
cd /path/to/cms
git pull origin main

# Update backend
cd backend
npm install
npm run build
npm run db:migrate

# Update frontend
cd ../frontend
npm install
npm run build
cp -r dist/* /var/www/cms/

# Update portfolio
cd ../../portfolio2
npm install

# Restart services
pm2 restart all

echo "CMS update completed successfully!"
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check DATABASE_URL in .env
   - Verify database file permissions
   - Run `npm run db:generate`

2. **File Upload Issues**
   - Check UPLOAD_DIR permissions
   - Verify MAX_FILE_SIZE setting
   - Check disk space

3. **Performance Issues**
   - Enable Redis caching
   - Check PM2 memory usage
   - Optimize Nginx configuration

4. **SSL Certificate Issues**
   - Renew certificates: `sudo certbot renew`
   - Check certificate expiry: `sudo certbot certificates`

### Emergency Recovery

1. **Restore from Backup**
   ```bash
   # Stop services
   pm2 stop all
   
   # Restore database
   cp /var/backups/cms/database_YYYYMMDD_HHMMSS.db /path/to/cms/backend/prisma/prod.db
   
   # Restore uploads
   tar -xzf /var/backups/cms/uploads_YYYYMMDD_HHMMSS.tar.gz -C /
   
   # Restart services
   pm2 start all
   ```

2. **Rollback Deployment**
   ```bash
   # Revert to previous commit
   git reset --hard HEAD~1
   
   # Rebuild and restart
   /usr/local/bin/update-cms.sh
   ```

## Security Best Practices

1. **Regular Updates**
   - Keep Node.js and dependencies updated
   - Monitor security advisories
   - Apply security patches promptly

2. **Access Control**
   - Use strong admin passwords
   - Enable 2FA if available
   - Limit admin access by IP

3. **File Security**
   - Validate all uploaded files
   - Scan uploads for malware
   - Set proper file permissions

4. **Network Security**
   - Use HTTPS everywhere
   - Configure proper CORS headers
   - Implement rate limiting

## Support and Maintenance

For ongoing support and maintenance:

1. **Documentation**: Keep this guide updated
2. **Monitoring**: Set up alerts for critical issues
3. **Backups**: Verify backup integrity regularly
4. **Performance**: Monitor and optimize regularly
5. **Security**: Regular security audits

---

**Last Updated**: $(date)
**Version**: 1.0.0