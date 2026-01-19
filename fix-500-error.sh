#!/bin/bash

# Quick fix for 500 Internal Server Error on registration

echo "🔧 Fixing 500 Internal Server Error..."
echo ""

# Step 1: Check if Docker PostgreSQL is running
if command -v docker &> /dev/null; then
    if docker ps | grep -q auth-postgres; then
        echo "✓ Docker PostgreSQL container is running"
        
        # Step 2: Check if database tables exist
        echo ""
        echo "Checking if database tables exist..."
        TABLES=$(docker exec auth-postgres psql -U postgres -d authdb -tAc "SELECT count(*) FROM information_schema.tables WHERE table_schema='public'" 2>/dev/null)
        
        if [ -z "$TABLES" ] || [ "$TABLES" -eq 0 ]; then
            echo "⚠️  Database tables NOT found!"
            echo "Initializing database tables..."
            
            if [ -f "backend/sql/init.sql" ]; then
                docker exec -i auth-postgres psql -U postgres -d authdb < backend/sql/init.sql 2>&1
                
                if [ $? -eq 0 ]; then
                    echo "✓ Database tables created successfully"
                else
                    echo "✗ Failed to create tables"
                    exit 1
                fi
            else
                echo "✗ Cannot find backend/sql/init.sql"
                exit 1
            fi
        else
            echo "✓ Database tables exist ($TABLES tables found)"
        fi
        
        # Step 3: Verify users table specifically
        echo ""
        echo "Verifying users table..."
        USERS_TABLE=$(docker exec auth-postgres psql -U postgres -d authdb -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users');" 2>/dev/null)
        
        if [ "$USERS_TABLE" == "t" ]; then
            echo "✓ Users table exists and is ready"
        else
            echo "✗ Users table does NOT exist"
            echo "Reinitializing database..."
            docker exec -i auth-postgres psql -U postgres -d authdb < backend/sql/init.sql 2>&1
        fi
        
    else
        echo "⚠️  Docker PostgreSQL container is NOT running"
        echo ""
        echo "Starting database..."
        cd /Users/varshanagda/ProjectAuth
        docker-compose up postgres -d
        sleep 5
        
        echo "Initializing database..."
        docker exec -i auth-postgres psql -U postgres -d authdb < backend/sql/init.sql 2>&1
        
        if [ $? -eq 0 ]; then
            echo "✓ Database initialized successfully"
        else
            echo "✗ Failed to initialize database"
            exit 1
        fi
    fi
else
    echo "⚠️  Docker is not available or not in PATH"
    echo "Please ensure PostgreSQL is running and tables are initialized"
fi

echo ""
echo "✅ Fix complete!"
echo ""
echo "Next steps:"
echo "1. Restart your backend if it's running (Ctrl+C then 'npm run dev')"
echo "2. Try registering again at http://localhost:5173/register"
echo "3. If error persists, check backend logs for detailed error message"
echo ""
echo "To test the connection, run: ./test-backend-connection.sh"
