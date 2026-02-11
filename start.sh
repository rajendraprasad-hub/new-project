#!/bin/bash
# Infosys Portal - Quick Start Guide

echo "================================"
echo "🚀 Infosys Portal - Quick Start"
echo "================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ .env created. Please update it with your settings."
    echo ""
    cat .env
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
    echo ""
fi

# Load environment
set -a
source .env
set +a

echo "================================"
echo "📋 Configuration"
echo "================================"
echo "Environment: $NODE_ENV"
echo "Port: $PORT"
echo "HTTPS: $HTTPS_ENABLED"
echo ""

# Start application
echo "🔄 Starting Infosys Portal..."
echo ""

if [ "$NODE_ENV" = "production" ]; then
    echo "⚠️  Production mode detected"
    echo "For production, use PM2:"
    echo ""
    echo "  npm install -g pm2"
    echo "  pm2 start ecosystem.config.js --env production"
    echo ""
    echo "Or run directly:"
fi

node backend/server.js
