#!/bin/bash

# Script to check database connection and tables

echo "=== Database Connection Check ==="
echo ""

# Check if using Docker
if docker ps | grep -q auth-postgres; then
    echo "✓ Docker PostgreSQL container is running"
    echo ""
    echo "Testing database connection..."
    docker exec -it auth-postgres psql -U postgres -d authdb -c "SELECT NOW();" 2>&1
    echo ""
    echo "Checking if tables exist..."
    docker exec -it auth-postgres psql -U postgres -d authdb -c "\dt" 2>&1
    echo ""
    echo "Checking users table structure..."
    docker exec -it auth-postgres psql -U postgres -d authdb -c "\d users" 2>&1
else
    echo "✗ Docker PostgreSQL container is not running"
    echo ""
    echo "Attempting to connect to local PostgreSQL..."
    psql -U postgres -d authdb -c "SELECT NOW();" 2>&1 || echo "Failed to connect to local PostgreSQL"
fi

echo ""
echo "=== Backend Environment Variables Check ==="
echo ""

if [ -f "backend/.env" ]; then
    echo "✓ .env file exists"
    echo ""
    echo "Environment variables:"
    grep -E "DB_|JWT_|PORT" backend/.env | sed 's/\(PASSWORD=\).*/\1***/' || echo "No DB variables found"
else
    echo "✗ .env file NOT found in backend directory"
    echo ""
    echo "Creating .env file template..."
    cat > backend/.env << 'EOF'
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=authdb
DB_PORT=5432
JWT_SECRET=supersecretkey
PORT=5001
EOF
    echo "✓ Created backend/.env file with default values"
    echo ""
    echo "⚠️  Please update the values if your database configuration is different"
fi
