#!/bin/bash

# Script to start the backend server
echo "Starting backend server..."
echo "========================="
echo ""

cd backend

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=authdb
DB_PORT=5433
JWT_SECRET=supersecretkey
PORT=5001
EOF
    echo ".env file created!"
    echo ""
fi

echo "Starting backend on http://localhost:5001"
echo "Press Ctrl+C to stop"
echo ""

# Start the server
npm run dev
