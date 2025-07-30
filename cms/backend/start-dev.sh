#!/bin/bash
echo "🚀 Starting CMS Backend Server..."
echo "📍 Working directory: $(pwd)"
echo "🔧 Node version: $(node --version)"
echo "📦 NPM version: $(npm --version)"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found, creating one from .env.example..."
    cp .env.example .env
fi

# Start the development server
npm run dev