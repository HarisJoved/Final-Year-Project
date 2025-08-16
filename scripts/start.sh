#!/bin/bash

# Handwriting OCR Application Startup Script

set -e

echo "🚀 Starting Handwriting OCR Application..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose > /dev/null 2>&1; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please review and update the .env file with your preferred settings."
    echo "   Default credentials are set for development use only."
fi

# Build and start the application
echo "🔨 Building and starting containers..."
docker-compose up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."

# Function to check if a URL is responding
check_url() {
    local url=$1
    local name=$2
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url" > /dev/null 2>&1; then
            echo "✅ $name is ready!"
            return 0
        fi
        echo "   Attempt $attempt/$max_attempts: Waiting for $name..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ $name failed to start within expected time"
    return 1
}

# Check backend health
if check_url "http://localhost:8000/health" "Backend API"; then
    echo "📊 Backend API is running at http://localhost:8000"
    echo "📚 API Documentation available at http://localhost:8000/docs"
else
    echo "❌ Backend failed to start. Check logs with: docker-compose logs backend"
    exit 1
fi

# Check frontend
if check_url "http://localhost:3000" "Frontend"; then
    echo "🎨 Frontend is running at http://localhost:3000"
else
    echo "❌ Frontend failed to start. Check logs with: docker-compose logs frontend"
    exit 1
fi

echo ""
echo "🎉 Application is ready!"
echo ""
echo "📱 Frontend:     http://localhost:3000"
echo "🔧 Backend API:  http://localhost:8000"
echo "📖 API Docs:     http://localhost:8000/docs"
echo "🗄️  MongoDB:     localhost:27017"
echo ""
echo "🛠️  Useful commands:"
echo "   View logs:      docker-compose logs"
echo "   Stop app:       docker-compose down"
echo "   Restart:        docker-compose restart"
echo "   Update:         docker-compose up --build"
echo ""
echo "📝 To get started:"
echo "   1. Open http://localhost:3000 in your browser"
echo "   2. Create an account or sign in"
echo "   3. Upload a handwriting image to extract text"
echo ""
