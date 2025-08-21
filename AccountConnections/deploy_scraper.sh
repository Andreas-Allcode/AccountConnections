#!/bin/bash

echo "🐍 Deploying Python scraper to Railway..."

# Install Railway CLI if not installed
if ! command -v railway &> /dev/null; then
    echo "Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Login and deploy
railway login
railway init
railway up

echo "✅ Python scraper deployed!"