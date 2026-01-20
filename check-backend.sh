#!/bin/bash

echo "🔍 Checking Backend Server Status..."
echo "===================================="
echo ""

# Check if backend is running on port 5001
if curl -s http://localhost:5001 > /dev/null 2>&1; then
    echo "✅ Backend is RUNNING on http://localhost:5001"
    echo ""
    echo "Testing endpoints:"
    curl -s http://localhost:5001
    echo ""
    echo ""
    curl -s http://localhost:5001/health
    echo ""
else
    echo "❌ Backend is NOT RUNNING on http://localhost:5001"
    echo ""
    echo "Please start the backend server:"
    echo ""
    echo "Option 1: Using Docker Compose"
    echo "  docker-compose up --build"
    echo ""
    echo "Option 2: Manual Start"
    echo "  cd backend"
    echo "  npm run dev"
    echo ""
fi

echo ""
echo "Checking if port 5001 is in use:"
lsof -i :5001 2>/dev/null || echo "Port 5001 is not in use"
