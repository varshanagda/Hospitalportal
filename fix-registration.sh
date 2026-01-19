#!/bin/bash

# Quick fix script for registration server error

echo "🔧 Fixing Registration Server Error..."
echo ""

# Step 1: Check if using Docker
if command -v docker &> /dev/null; then
    if docker ps | grep -q auth-postgres; then
        echo "✓ Docker PostgreSQL is running"
        
        # Check if tables exist
        TABLES=$(docker exec auth-postgres psql -U postgres -d authdb -tAc "SELECT count(*) FROM information_schema.tables WHERE table_schema='public'" 2>/dev/null)
        
        if [ -z "$TABLES" ] || [ "$TABLES" -eq 0 ]; then
            echo "⚠️  Database tables not found. Initializing..."
            docker exec -i auth-postgres psql -U postgres -d authdb < backend/sql/init.sql 2>&1
            if [ $? -eq 0 ]; then
                echo "✓ Database tables created successfully"
            else
                echo "✗ Failed to create tables"
            fi
        else
            echo "✓ Database tables exist ($TABLES tables)"
        fi
    else
        echo "⚠️  Docker PostgreSQL is not running"
        echo "Starting database..."
        docker-compose up postgres -d
        sleep 3
        
        # Initialize database
        echo "Initializing database..."
        docker exec -i auth-postgres psql -U postgres -d authdb < backend/sql/init.sql 2>&1
        echo "✓ Database initialized"
    fi
fi

# Step 2: Check for .env file (for local development)
if [ ! -f "backend/.env" ]; then
    echo ""
    echo "⚠️  No .env file found. Creating one..."
    
    # Determine DB_HOST based on Docker setup
    if docker ps | grep -q auth-postgres; then
        DB_HOST="localhost"
    else
        DB_HOST="localhost"
    fi
    
    cat > backend/.env << EOF
DB_HOST=${DB_HOST}
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=authdb
DB_PORT=5432
JWT_SECRET=supersecretkey
PORT=5001
NODE_ENV=development
EOF
    echo "✓ Created backend/.env file"
    echo ""
    echo "⚠️  If you're using Docker, the environment variables in docker-compose.yml will override these"
fi

echo ""
echo "✅ Fix complete! Try registering again."
echo ""
echo "If the error persists, check:"
echo "1. Backend logs for detailed error messages"
echo "2. Database connection: ./check-database.sh"
echo "3. Restart backend: cd backend && npm run dev"
