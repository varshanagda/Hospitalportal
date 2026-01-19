#!/bin/bash

# Test backend connection and database

echo "🔍 Testing Backend Connection..."
echo ""

# Test if backend is running
echo "1. Testing if backend is running..."
if curl -s http://localhost:5001/ > /dev/null; then
    echo "   ✓ Backend is running"
else
    echo "   ✗ Backend is NOT running on port 5001"
    echo "   Please start the backend: cd backend && npm run dev"
    exit 1
fi

echo ""
echo "2. Testing database connection..."
HEALTH_RESPONSE=$(curl -s http://localhost:5001/health)
echo "   Response: $HEALTH_RESPONSE"

if echo "$HEALTH_RESPONSE" | grep -q "connected"; then
    echo "   ✓ Database is connected"
else
    echo "   ✗ Database is NOT connected"
    echo "   Common fixes:"
    echo "   - Make sure PostgreSQL is running"
    echo "   - Check database environment variables"
    echo "   - Initialize database tables: docker exec -i auth-postgres psql -U postgres -d authdb < backend/sql/init.sql"
fi

echo ""
echo "3. Testing if users table exists..."
if command -v docker &> /dev/null && docker ps | grep -q auth-postgres; then
    TABLE_EXISTS=$(docker exec auth-postgres psql -U postgres -d authdb -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users');" 2>/dev/null)
    
    if [ "$TABLE_EXISTS" == "t" ]; then
        echo "   ✓ Users table exists"
    else
        echo "   ✗ Users table does NOT exist"
        echo "   Initializing database..."
        docker exec -i auth-postgres psql -U postgres -d authdb < backend/sql/init.sql 2>&1
        if [ $? -eq 0 ]; then
            echo "   ✓ Database initialized successfully"
        else
            echo "   ✗ Failed to initialize database"
        fi
    fi
else
    echo "   ⚠️  Cannot check (Docker not accessible or PostgreSQL not in Docker)"
fi

echo ""
echo "4. Testing registration endpoint..."
REGISTER_TEST=$(curl -s -X POST http://localhost:5001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "test123",
    "role": "user",
    "full_name": "Test User"
  }' 2>&1)

echo "   Response: $REGISTER_TEST"

if echo "$REGISTER_TEST" | grep -q "already exists\|successfully"; then
    echo "   ✓ Registration endpoint is working"
else
    if echo "$REGISTER_TEST" | grep -q "error\|Error"; then
        echo "   ✗ Registration endpoint has an error"
        echo "   Check backend logs for details"
    fi
fi

echo ""
echo "✅ Test complete!"
echo ""
echo "If errors persist, check:"
echo "1. Backend logs (where you ran 'npm run dev')"
echo "2. Database is running: docker ps | grep postgres"
echo "3. Database tables exist: docker exec -it auth-postgres psql -U postgres -d authdb -c '\\dt'"
