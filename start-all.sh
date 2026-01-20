#!/bin/bash

echo "🚀 Starting Medical Appointment System"
echo "======================================"
echo ""

# Check if Docker is available
if command -v docker &> /dev/null; then
    echo "📦 Starting with Docker Compose..."
    echo ""
    
    # Check if containers are already running
    if docker ps | grep -q "auth-postgres\|backend\|frontend"; then
        echo "⚠️  Some containers are already running"
        echo "   Stopping existing containers..."
        docker-compose down
        echo ""
    fi
    
    echo "🔨 Building and starting all services..."
    docker-compose up --build -d
    
    echo ""
    echo "⏳ Waiting for services to start..."
    sleep 5
    
    echo ""
    echo "📊 Service Status:"
    docker-compose ps
    
    echo ""
    echo "✅ Services should be starting!"
    echo ""
    echo "🌐 Access points:"
    echo "   Frontend: http://localhost:5173"
    echo "   Backend:  http://localhost:5001"
    echo ""
    echo "📋 View logs:"
    echo "   docker-compose logs -f"
    echo ""
    
else
    echo "❌ Docker not found. Starting manually..."
    echo ""
    echo "Step 1: Start PostgreSQL (if using Docker for DB)"
    echo "   docker-compose up postgres -d"
    echo ""
    echo "Step 2: Start Backend (in a new terminal)"
    echo "   cd backend"
    echo "   npm install"
    echo "   npm run dev"
    echo ""
    echo "Step 3: Start Frontend (in another terminal)"
    echo "   cd frontend"
    echo "   npm install"
    echo "   npm run dev"
    echo ""
fi
