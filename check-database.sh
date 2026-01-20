#!/bin/bash

# Script to check database connection and tables

echo "=== Database Connection Check ===" >&2
echo ""

# Check if using Docker
if docker ps | grep -q auth-postgres; then
    echo "✓ Docker PostgreSQL container is running" >&2
    echo ""
    echo "Testing database connection..." >&2
    docker exec -it auth-postgres psql -U postgres -d authdb -c "SELECT NOW();" 2>&1
    echo ""
    echo "Checking if tables exist..."
    docker exec -it auth-postgres psql -U postgres -d authdb -c "\dt" 2>&1
    echo ""
    echo "Checking users table structure..." >&2
    docker exec -it auth-postgres psql -U postgres -d authdb -c "\d users" 2>&1
else
    echo "✗ Docker PostgreSQL container is not running" >&2
    echo ""
    echo "Attempting to connect to local PostgreSQL..." >&2
    psql -U postgres -d authdb -c "SELECT NOW();" 2>&1 || echo "Failed to connect to local PostgreSQL" >&2
fi

echo ""
echo "=== Backend Environment Variables Check ===" >&2
echo ""

if [[ -f "backend/.env" ]]; then
    echo "✓ .env file exists"
    echo ""
    echo "Environment variables:" >&2
    grep -E "DB_|JWT_|PORT" backend/.env | sed 's/\(PASSWORD=\).*/\1***/' || echo "No DB variables found" >&2
else
    echo "✗ .env file NOT found in backend directory" >&2
    echo ""
    echo "Creating .env file template..." >&2
    cat > backend/.env << 'EOF'
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=authdb
DB_PORT=5432
JWT_SECRET=supersecretkey
PORT=5001
EOF
    echo "✓ Created backend/.env file with default values" >&2
    echo ""
    echo "⚠️  Please update the values if your database configuration is different" >&2
fi
