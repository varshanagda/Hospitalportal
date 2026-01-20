#!/bin/bash

# Fix password authentication error for PostgreSQL

echo "🔧 Fixing PostgreSQL Password Authentication Error..." >&2
echo ""

# Determine if using Docker or local PostgreSQL
if docker ps | grep -q auth-postgres; then
    echo "✓ Docker PostgreSQL container is running" >&2
    
    # Check what password is set in Docker
    POSTGRES_PASSWORD=$(docker exec auth-postgres printenv POSTGRES_PASSWORD 2>/dev/null || echo "postgres") >&2
    
    echo ""
    echo "Docker PostgreSQL credentials:" >&2
    echo "  User: postgres" >&2
    echo "  Password: $POSTGRES_PASSWORD" >&2
    echo "  Database: authdb"
    echo ""
    
    # Create/update .env file with correct credentials
    echo "Creating/updating backend/.env file..." >&2
    cat > backend/.env << EOF
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=${POSTGRES_PASSWORD}
DB_NAME=authdb
DB_PORT=5432
JWT_SECRET=supersecretkey
PORT=5001
NODE_ENV=development
EOF
    
    echo "✓ Created backend/.env file with credentials:" >&2
    echo "  DB_HOST=localhost" >&2
    echo "  DB_USER=postgres" >&2
    echo "  DB_PASSWORD=${POSTGRES_PASSWORD}" >&2
    echo "  DB_NAME=authdb" >&2
    echo "  DB_PORT=5432"
    
else
    echo "⚠️  Docker PostgreSQL container is NOT running" >&2
    echo ""
    echo "Checking for local PostgreSQL..." >&2
    
    # Try to detect local PostgreSQL password
    if command -v psql &> /dev/null; then
        echo "Attempting to connect to local PostgreSQL..." >&2
        
        # Try common passwords
        for PASSWORD in "postgres" "" "password" "admin"; do
            if PGPASSWORD="$PASSWORD" psql -h localhost -U postgres -d postgres -c "SELECT 1;" &>/dev/null; then
                echo "✓ Found working password: ${PASSWORD:-'(empty)'}" >&2
                
                cat > backend/.env << EOF
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=${PASSWORD}
DB_NAME=authdb
DB_PORT=5432
JWT_SECRET=supersecretkey
PORT=5001
NODE_ENV=development
EOF
                
                echo "✓ Created backend/.env file" >&2
                exit 0
            fi
        done
        
        echo "✗ Could not determine PostgreSQL password" >&2
        echo ""
        echo "Please create backend/.env manually with your PostgreSQL credentials:" >&2
        echo ""
        echo "DB_HOST=localhost" >&2
        echo "DB_USER=postgres" >&2
        echo "DB_PASSWORD=your_password_here" >&2
        echo "DB_NAME=authdb" >&2
        echo "DB_PORT=5432"
        echo "JWT_SECRET=supersecretkey" >&2
        echo "PORT=5001"
        echo "NODE_ENV=development" >&2
        
    else
        echo "⚠️  PostgreSQL client not found" >&2
        echo ""
        echo "Starting Docker PostgreSQL..." >&2
        docker-compose up postgres -d
        sleep 3
        
        cat > backend/.env << EOF
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=authdb
DB_PORT=5432
JWT_SECRET=supersecretkey
PORT=5001
NODE_ENV=development
EOF
        
        echo "✓ Created backend/.env file with default Docker credentials" >&2
        echo "✓ Started Docker PostgreSQL" >&2
    fi
fi

echo ""
echo "✅ Configuration updated!" >&2
echo ""
echo "⚠️  IMPORTANT: Restart your backend server for changes to take effect!" >&2
echo "   If backend is running, press Ctrl+C and restart with:" >&2
echo "   cd backend && npm run dev" >&2
echo ""
echo "If you're still getting password errors:" >&2
echo "1. Make sure PostgreSQL password matches in backend/.env" >&2
echo "2. For Docker: Check docker-compose.yml POSTGRES_PASSWORD" >&2
echo "3. For local: Check your PostgreSQL password" >&2
