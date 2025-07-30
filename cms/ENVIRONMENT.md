# Environment Configuration Guide

This document provides detailed information about configuring environment variables for the Homepage CMS system.

## Overview

The CMS system consists of three main components, each with its own environment configuration:

1. **Backend API** (`cms/backend/.env`)
2. **Frontend Application** (`cms/frontend/.env`)
3. **Portfolio Server** (`portfolio2/.env`)

## Backend Environment Configuration

### Required Variables

#### Database Configuration
```env
# SQLite (Development/Small Production)
DATABASE_URL="file:./prisma/dev.db"

# PostgreSQL (Production)
DATABASE_URL="postgresql://username:password@localhost:5432/cms_database"

# MySQL (Alternative)
DATABASE_URL="mysql://username:password@localhost:3306/cms_database"
```

#### Server Configuration
```env
# Environment
NODE_ENV=development|production

# Server Port
PORT=8000

# JWT Secret (REQUIRED - Generate a strong secret)
JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters

# Password Hashing Rounds
BCRYPT_ROUNDS=12
```

#### File Upload Configuration
```env
# Upload Directory (relative to backend root)
UPLOAD_DIR=uploads

# Maximum file size in bytes (10MB default)
MAX_FILE_SIZE=10485760

# Allowed file types (comma-separated MIME types)
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm

# Image optimization quality (1-100)
IMAGE_QUALITY=85

# Generate thumbnails for images
GENERATE_THUMBNAILS=true

# Thumbnail size in pixels
THUMBNAIL_SIZE=300
```

#### Redis Configuration (Optional)
```env
# Redis URL
REDIS_URL=redis://localhost:6379

# Redis Password (if required)
REDIS_PASSWORD=your-redis-password

# Redis Database Number
REDIS_DB=0

# Cache TTL in seconds (30 minutes default)
CACHE_TTL=1800

# Enable/disable caching
ENABLE_CACHE=true
```

#### CORS Configuration
```env
# Allowed origins (comma-separated)
CORS_ORIGIN=http://localhost:3000,http://localhost:5173,https://your-domain.com

# Allow credentials
CORS_CREDENTIALS=true
```

#### Performance Configuration
```env
# Enable gzip compression
ENABLE_COMPRESSION=true

# Request rate limiting (requests per minute)
RATE_LIMIT=100

# Enable request logging
ENABLE_LOGGING=true

# Log level (error, warn, info, debug)
LOG_LEVEL=info
```

### Optional Variables

#### Email Configuration (Future Feature)
```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@your-domain.com
```

#### Analytics Configuration (Future Feature)
```env
# Google Analytics
GA_TRACKING_ID=UA-XXXXXXXXX-X

# Custom Analytics Endpoint
ANALYTICS_ENDPOINT=https://analytics.your-domain.com/track
```

### Example Backend .env File

```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# Server
NODE_ENV=development
PORT=8000
JWT_SECRET=your-super-secure-jwt-secret-that-is-at-least-32-characters-long
BCRYPT_ROUNDS=12

# File Uploads
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm
IMAGE_QUALITY=85
GENERATE_THUMBNAILS=true
THUMBNAIL_SIZE=300

# Redis (Optional)
REDIS_URL=redis://localhost:6379
CACHE_TTL=1800
ENABLE_CACHE=true

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
CORS_CREDENTIALS=true

# Performance
ENABLE_COMPRESSION=true
RATE_LIMIT=100
ENABLE_LOGGING=true
LOG_LEVEL=info
```

## Frontend Environment Configuration

### Required Variables

```env
# API Base URL
VITE_API_URL=http://localhost:8000

# Portfolio Site URL
VITE_PORTFOLIO_URL=http://localhost:3001

# Environment
NODE_ENV=development|production
```

### Optional Variables

```env
# Enable development tools
VITE_ENABLE_DEVTOOLS=true

# API Request timeout in milliseconds
VITE_API_TIMEOUT=30000

# Enable debug mode
VITE_DEBUG=true

# Analytics
VITE_GA_TRACKING_ID=UA-XXXXXXXXX-X

# Feature flags
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_ADVANCED_EDITOR=true
```

### Example Frontend .env File

```env
# API Configuration
VITE_API_URL=http://localhost:8000
VITE_PORTFOLIO_URL=http://localhost:3001

# Environment
NODE_ENV=development

# Development
VITE_ENABLE_DEVTOOLS=true
VITE_API_TIMEOUT=30000
VITE_DEBUG=true

# Features
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_ADVANCED_EDITOR=true
```

## Portfolio Server Environment Configuration

### Required Variables

```env
# Environment
NODE_ENV=development|production

# Server Port
PORT=3001

# CMS API URL
CMS_API_URL=http://localhost:8000/api
```

### Optional Variables

```env
# Enable request logging
ENABLE_LOGGING=true

# Cache static files (in production)
ENABLE_STATIC_CACHE=true

# Request timeout for CMS API calls
CMS_API_TIMEOUT=10000

# Fallback to static content if CMS is unavailable
ENABLE_CMS_FALLBACK=true
```

### Example Portfolio .env File

```env
# Environment
NODE_ENV=development
PORT=3001

# CMS Integration
CMS_API_URL=http://localhost:8000/api
CMS_API_TIMEOUT=10000
ENABLE_CMS_FALLBACK=true

# Performance
ENABLE_LOGGING=true
ENABLE_STATIC_CACHE=true
```

## Production Environment Setup

### Security Considerations

1. **JWT Secret**: Generate a cryptographically secure secret
   ```bash
   # Generate a secure JWT secret
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Database Security**: Use strong passwords and limit access
   ```env
   DATABASE_URL="postgresql://cms_user:very_secure_password@localhost:5432/cms_prod"
   ```

3. **CORS Configuration**: Restrict to your domains only
   ```env
   CORS_ORIGIN=https://your-domain.com,https://cms.your-domain.com
   ```

### Performance Optimization

1. **Enable Caching**: Use Redis for better performance
   ```env
   REDIS_URL=redis://localhost:6379
   ENABLE_CACHE=true
   CACHE_TTL=3600
   ```

2. **File Optimization**: Configure image optimization
   ```env
   IMAGE_QUALITY=80
   GENERATE_THUMBNAILS=true
   THUMBNAIL_SIZE=300
   ```

3. **Compression**: Enable gzip compression
   ```env
   ENABLE_COMPRESSION=true
   ```

### Monitoring and Logging

```env
# Logging
ENABLE_LOGGING=true
LOG_LEVEL=warn

# Performance monitoring
ENABLE_PERFORMANCE_MONITORING=true

# Error tracking (if using external service)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

## Environment Validation

The system includes built-in environment validation. Missing required variables will cause the application to fail to start with descriptive error messages.

### Backend Validation

The backend validates:
- JWT_SECRET is present and sufficiently long
- DATABASE_URL is properly formatted
- File upload settings are valid
- Redis connection (if enabled)

### Frontend Validation

The frontend validates:
- API URL is accessible
- Required environment variables are present

## Environment Templates

### Development Template

Copy these templates to get started quickly:

```bash
# Copy backend template
cp cms/backend/.env.example cms/backend/.env

# Copy frontend template
cp cms/frontend/.env.example cms/frontend/.env

# Copy portfolio template
cp portfolio2/.env.example portfolio2/.env
```

### Production Checklist

Before deploying to production:

- [ ] All required environment variables are set
- [ ] JWT_SECRET is cryptographically secure
- [ ] Database credentials are secure
- [ ] CORS origins are restricted to your domains
- [ ] File upload limits are appropriate
- [ ] Redis is configured (recommended)
- [ ] Logging is configured appropriately
- [ ] SSL certificates are configured
- [ ] Backup strategy is in place

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify DATABASE_URL format
   - Check database server is running
   - Verify credentials and permissions

2. **CORS Errors**
   - Check CORS_ORIGIN includes your frontend URL
   - Verify protocol (http vs https) matches

3. **File Upload Issues**
   - Check UPLOAD_DIR permissions
   - Verify MAX_FILE_SIZE setting
   - Check available disk space

4. **Cache Issues**
   - Verify Redis server is running
   - Check REDIS_URL format
   - Test Redis connection

### Environment Debugging

Enable debug mode to troubleshoot environment issues:

```env
# Backend
LOG_LEVEL=debug
ENABLE_LOGGING=true

# Frontend
VITE_DEBUG=true
```

## Security Best Practices

1. **Never commit .env files** to version control
2. **Use different secrets** for each environment
3. **Regularly rotate** JWT secrets and database passwords
4. **Limit CORS origins** to necessary domains only
5. **Use HTTPS** in production
6. **Enable rate limiting** to prevent abuse
7. **Monitor logs** for suspicious activity

---

**Last Updated**: $(date)
**Version**: 1.0.0