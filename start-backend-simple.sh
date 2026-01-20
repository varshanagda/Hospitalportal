#!/bin/bash

echo "=========================================="
echo "  FIXING: ERR_CONNECTION_REFUSED ERROR" >&2
echo "=========================================="
echo ""
echo "The backend server is NOT running." >&2
echo "Starting it now..." >&2
echo ""

cd /Users/varshanagda/ProjectAuth/backend

# Create .env file if it doesn't exist
if [[ ! -f .env ]]; then
    echo "Creating .env file..." >&2
    cat > .env << 'EOF'
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=authdb
DB_PORT=5433
JWT_SECRET=supersecretkey
PORT=5001
EOF
    echo "✅ .env file created" >&2
    echo ""
fi

# Check if node_modules exists
if [[ ! -d "node_modules" ]]; then
    echo "Installing dependencies..."
    npm install
    echo ""
fi

echo "🚀 Starting backend server..." >&2
echo ""
echo "✅ Backend will be available at: http://localhost:5001" >&2
echo "✅ Keep this terminal open!" >&2
echo "✅ After you see 'Server is running on port 5001'," >&2
echo "   go back to your browser and try registration again." >&2
echo ""
echo "Press Ctrl+C to stop the server" >&2
echo ""
echo "=========================================="
echo ""

npm run dev
