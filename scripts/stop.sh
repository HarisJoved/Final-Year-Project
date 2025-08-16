#!/bin/bash

# Handwriting OCR Application Stop Script

set -e

echo "🛑 Stopping Handwriting OCR Application..."

# Stop and remove containers
echo "📦 Stopping containers..."
docker-compose down

echo "🧹 Cleaning up..."

# Optional: Remove volumes (uncomment if you want to delete all data)
# echo "⚠️  Removing volumes (this will delete all data)..."
# docker-compose down -v

# Optional: Remove images (uncomment if you want to clean up images)
# echo "🗑️  Removing images..."
# docker-compose down --rmi all

echo "✅ Application stopped successfully!"
echo ""
echo "💡 To start again: ./scripts/start.sh"
echo "🗑️  To remove all data: docker-compose down -v"
echo "🧹 To clean up everything: docker-compose down -v --rmi all"
