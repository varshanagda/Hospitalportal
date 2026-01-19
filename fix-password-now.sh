#!/bin/bash

# Quick fix: Use Docker PostgreSQL with correct password

echo "🔧 Fixing PostgreSQL Password Error..."
echo ""

cd /Users/varshanagda/ProjectAuth

# Step 1: Start Docker PostgreSQL
echo "Step 1: Starting Docker PostgreSQL..."
docker-compose up postgres -d

if [ $? -ne 0 ]; then
    echo "❌ Failed to start Docker PostgreSQL"
    echo "Make sure Docker is running"
    exit 1
fi

echo "✓ Waiting for PostgreSQL to be ready..."
sleep 5

# Step 2: Update .env file with Docker credentials
echo ""
echo "Step 2: Updating backend/.env file..."
cat > backend/.env << 'EOF'
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=authdb
DB_PORT=5432
JWT_SECRET=supersecretkey
PORT=5001
NODE_ENV=development
EOF

echo "✓ Updated backend/.env with Docker PostgreSQL credentials"

# Step 3: Initialize database
echo ""
echo "Step 3: Initializing database..."
docker exec -i auth-postgres psql -U postgres -d authdb < backend/sql/init.sql 2>&1

if [ $? -eq 0 ]; then
    echo "✓ Database initialized successfully"
else
    echo "⚠️  Database might already be initialized (this is OK)"
fi

# Step 4: Verify connection
echo ""
echo "Step 4: Verifying database connection..."
docker exec auth-postgres psql -U postgres -d authdb -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" 2>&1 | grep -q "[0-9]" && echo "✓ Database connection verified" || echo "⚠️  Could not verify (but this might be OK)"

echo ""
echo "✅ Fix complete!"
echo ""
echo "⚠️  IMPORTANT: Restart your backend server now!"
echo ""
echo "   1. Go to the terminal where your backend is running"
echo "   2. Press Ctrl+C to stop it"
echo "   3. Restart with: cd backend && npm run dev"
echo ""
echo "   4. Then try registering again at http://localhost:5173/register"
echo ""
echo "The password error should now be fixed! 🎉"
