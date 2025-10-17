#!/bin/bash

echo "🚀 Setting up Trading Platform..."

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed."; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose is required but not installed."; exit 1; }

# Create .env file
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update .env with your configuration values!"
fi

# Initialize git if not already
if [ ! -d .git ]; then
    echo "🔄 Initializing git repository..."
    git init
    git add .gitignore
    git commit -m "Initial commit: Add .gitignore" || true
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "IMPORTANT: Copy your existing C++ OrderBook code:"
echo "  cp /path/to/your/*.hpp core/include/"
echo "  cp /path/to/your/*.cpp core/src/"
echo ""
echo "Then run: ./start.sh"
