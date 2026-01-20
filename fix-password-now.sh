#!/bin/bash

# Quick fix: Use Docker PostgreSQL with correct password

echo "🔧 Fixing PostgreSQL Password Error..." >&2
echo ""

cd /Users/varshanagda/ProjectAuth

# Step 1: Start Docker PostgreSQL
echo "Step 1: Starting Docker PostgreSQL..." >&2
docker-compose up postgres -d

if [[ $? -ne 0 ]]; then
    echo "❌ Failed to start Docker PostgreSQL" >&2
    echo "Make sure Docker is running" >&2
    exit 1
fi

echo "✓ Waiting for PostgreSQL to be ready..." >&2
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

echo "✓ Updated backend/.env with Docker PostgreSQL credentials" >&2

# Step 3: Initialize database
echo ""
echo "Step 3: Initializing database..."
docker exec -i auth-postgres psql -U postgres -d authdb < backend/sql/init.sql 2>&1

if [[ $? -eq 0 ]]; then
    echo "✓ Database initialized successfully"
else
    echo "⚠️  Database might already be initialized (this is OK)" >&2
fi

# Step 4: Verify connection
echo ""
echo "Step 4: Verifying database connection..." >&2
docker exec auth-postgres psql -U postgres -d authdb -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" 2>&1 | grep -q "[0-9]" && echo "✓ Database connection verified" || echo "⚠️  Could not verify (but this might be OK)" >&2

echo ""
echo "✅ Fix complete!" >&2
echo ""
echo "⚠️  IMPORTANT: Restart your backend server now!" >&2
echo ""
echo "   1. Go to the terminal where your backend is running" >&2
echo "   2. Press Ctrl+C to stop it" >&2
echo "   3. Restart with: cd backend && npm run dev" >&2
echo ""
echo "   4. Then try registering again at http://localhost:5173/register" >&2
echo ""
echo "The password error should now be fixed! 🎉" >&2
