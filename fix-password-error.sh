#!/bin/bash

# Fix password authentication error for PostgreSQL

echo "🔧 Fixing PostgreSQL Password Authentication Error..."
echo ""

# Determine if using Docker or local PostgreSQL
if docker ps | grep -q auth-postgres; then
    echo "✓ Docker PostgreSQL container is running"
    
    # Check what password is set in Docker
    POSTGRES_PASSWORD=$(docker exec auth-postgres printenv POSTGRES_PASSWORD 2>/dev/null || echo "postgres")
    
    echo ""
    echo "Docker PostgreSQL credentials:"
    echo "  User: postgres"
    echo "  Password: $POSTGRES_PASSWORD"
    echo "  Database: authdb"
    echo ""
    
    # Create/update .env file with correct credentials
    echo "Creating/updating backend/.env file..."
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
    
    echo "✓ Created backend/.env file with credentials:"
    echo "  DB_HOST=localhost"
    echo "  DB_USER=postgres"
    echo "  DB_PASSWORD=${POSTGRES_PASSWORD}"
    echo "  DB_NAME=authdb"
    echo "  DB_PORT=5432"
    
else
    echo "⚠️  Docker PostgreSQL container is NOT running"
    echo ""
    echo "Checking for local PostgreSQL..."
    
    # Try to detect local PostgreSQL password
    if command -v psql &> /dev/null; then
        echo "Attempting to connect to local PostgreSQL..."
        
        # Try common passwords
        for PASSWORD in "postgres" "" "password" "admin"; do
            if PGPASSWORD="$PASSWORD" psql -h localhost -U postgres -d postgres -c "SELECT 1;" &>/dev/null; then
                echo "✓ Found working password: ${PASSWORD:-'(empty)'}"
                
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
                
                echo "✓ Created backend/.env file"
                exit 0
            fi
        done
        
        echo "✗ Could not determine PostgreSQL password"
        echo ""
        echo "Please create backend/.env manually with your PostgreSQL credentials:"
        echo ""
        echo "DB_HOST=localhost"
        echo "DB_USER=postgres"
        echo "DB_PASSWORD=your_password_here"
        echo "DB_NAME=authdb"
        echo "DB_PORT=5432"
        echo "JWT_SECRET=supersecretkey"
        echo "PORT=5001"
        echo "NODE_ENV=development"
        
    else
        echo "⚠️  PostgreSQL client not found"
        echo ""
        echo "Starting Docker PostgreSQL..."
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
        
        echo "✓ Created backend/.env file with default Docker credentials"
        echo "✓ Started Docker PostgreSQL"
    fi
fi

echo ""
echo "✅ Configuration updated!"
echo ""
echo "⚠️  IMPORTANT: Restart your backend server for changes to take effect!"
echo "   If backend is running, press Ctrl+C and restart with:"
echo "   cd backend && npm run dev"
echo ""
echo "If you're still getting password errors:"
echo "1. Make sure PostgreSQL password matches in backend/.env"
echo "2. For Docker: Check docker-compose.yml POSTGRES_PASSWORD"
echo "3. For local: Check your PostgreSQL password"
