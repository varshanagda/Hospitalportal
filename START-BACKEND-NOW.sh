#!/bin/bash

echo "🚀 Starting Backend Server..."
echo "=============================="
echo ""

# Check if backend is already running
if curl -s http://localhost:5001 > /dev/null 2>&1; then
    echo "✅ Backend is already running!"
    echo "   Test: http://localhost:5001"
    exit 0
fi

echo "❌ Backend is NOT running. Starting now..."
echo ""

# Check if we're in the right directory
if [[ ! -d "backend" ]]; then
    echo "Error: Please run this script from the project root directory"
    echo "   cd /Users/varshanagda/ProjectAuth"
    exit 1
fi

# Check if Docker is available
if command -v docker &> /dev/null && docker ps &> /dev/null; then
    echo "📦 Using Docker Compose..."
    echo ""
    echo "Starting all services (database + backend + frontend)..."
    docker-compose up --build
else
    echo "📝 Starting Backend Manually..."
    echo ""
    
    # Check if postgres is running
    if ! docker ps | grep -q "auth-postgres"; then
        echo "Starting PostgreSQL database..."
        docker-compose up postgres -d
        echo "Waiting for database to be ready..."
        sleep 3
    fi
    
    # Go to backend directory
    cd backend
    
    # Check if .env exists
    if [[ ! -f .env ]]; then
        echo "Creating .env file..."
        cat > .env << 'EOF'
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=authdb
DB_PORT=5433
JWT_SECRET=supersecretkey
PORT=5001
EOF
        echo "✅ .env file created"
    fi
    
    # Check if node_modules exists
    if [[ ! -d "node_modules" ]]; then
        echo "Installing dependencies..."
        npm install
    fi
    
    echo ""
    echo "🚀 Starting backend server..."
    echo "   Backend will be available at: http://localhost:5001"
    echo "   Press Ctrl+C to stop"
    echo ""
    
    npm run dev
fi
