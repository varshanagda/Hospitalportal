#!/bin/bash

# Test and fix PostgreSQL password authentication

echo "🔍 Testing PostgreSQL Connection..."
echo ""

cd /Users/varshanagda/ProjectAuth

# Test different passwords
echo "Testing common passwords..."

# Test 1: Empty password
echo -n "Testing empty password... "
if PGPASSWORD="" psql -h localhost -U postgres -d postgres -c "SELECT 1;" &>/dev/null 2>&1; then
    echo "✓ SUCCESS (no password needed)"
    CORRECT_PASSWORD=""
    FOUND_PASSWORD=true
else
    echo "✗ Failed"
fi

# Test 2: "postgres" password
if [[ -z "$FOUND_PASSWORD" ]]; then
    echo -n "Testing 'postgres' password... "
    if PGPASSWORD=postgres psql -h localhost -U postgres -d postgres -c "SELECT 1;" &>/dev/null 2>&1; then
        echo "✓ SUCCESS"
        CORRECT_PASSWORD="postgres"
        FOUND_PASSWORD=true
    else
        echo "✗ Failed"
    fi
fi

# Test 3: "admin" password
if [[ -z "$FOUND_PASSWORD" ]]; then
    echo -n "Testing 'admin' password... "
    if PGPASSWORD=admin psql -h localhost -U postgres -d postgres -c "SELECT 1;" &>/dev/null 2>&1; then
        echo "✓ SUCCESS"
        CORRECT_PASSWORD="admin"
        FOUND_PASSWORD=true
    else
        echo "✗ Failed"
    fi
fi

echo ""

if [[ -z "$FOUND_PASSWORD" ]]; then
    echo "❌ Could not determine PostgreSQL password automatically" >&2
    echo ""
    echo "Please try one of these solutions:" >&2
    echo ""
    echo "Option 1: Reset PostgreSQL password to 'postgres'"
    echo "  For macOS with Homebrew:"
    echo "    brew services stop postgresql"
    echo "    # Edit /opt/homebrew/var/postgresql@*/pg_hba.conf"
    echo "    # Change 'md5' to 'trust' for local connections"
    echo "    brew services start postgresql"
    echo "    psql -U postgres -c \"ALTER USER postgres PASSWORD 'postgres';\""
    echo ""
    echo "Option 2: Update backend/.env with your actual password"
    echo "  Edit backend/.env and set:"
    echo "  DB_PASSWORD=your_actual_password"
    echo ""
    echo "Option 3: Use Docker PostgreSQL instead"
    echo "  docker-compose up postgres -d"
    echo "  # Then update backend/.env:"
    echo "  DB_HOST=localhost"
    echo "  DB_PASSWORD=postgres"
    exit 1
fi

echo "✓ Found working password!"
echo ""
echo "Updating backend/.env file..."

# Update .env file
cat > backend/.env << EOF
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=${CORRECT_PASSWORD}
DB_NAME=authdb
DB_PORT=5432
JWT_SECRET=supersecretkey
PORT=5001
NODE_ENV=development
EOF

echo "✓ Updated backend/.env with correct password"
echo ""

# Check if database exists
echo "Checking if 'authdb' database exists..."
if PGPASSWORD="$CORRECT_PASSWORD" psql -h localhost -U postgres -lqt | cut -d \| -f 1 | grep -qw authdb; then
    echo "✓ Database 'authdb' exists"
else
    echo "⚠️  Database 'authdb' does NOT exist" >&2
    echo "Creating database..."
    if PGPASSWORD="$CORRECT_PASSWORD" createdb -h localhost -U postgres authdb 2>&1; then
        echo "✓ Database 'authdb' created"
    else
        echo "✗ Failed to create database" >&2
    fi
fi

echo ""

# Check if tables exist
echo "Checking if tables exist..."
TABLE_COUNT=$(PGPASSWORD="$CORRECT_PASSWORD" psql -h localhost -U postgres -d authdb -tAc "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null)

if [[ -z "$TABLE_COUNT" ]] || [[ "$TABLE_COUNT" -eq 0 ]]; then
    echo "⚠️  No tables found. Initializing database..." >&2
    if [[ -f "backend/sql/init.sql" ]]; then
        PGPASSWORD="$CORRECT_PASSWORD" psql -h localhost -U postgres -d authdb -f backend/sql/init.sql 2>&1
        if [[ $? -eq 0 ]]; then
            echo "✓ Database tables initialized"
        else
            echo "✗ Failed to initialize tables" >&2
        fi
    else
        echo "✗ Cannot find backend/sql/init.sql" >&2
    fi
else
    echo "✓ Tables exist ($TABLE_COUNT tables found)"
fi

echo ""
echo "✅ Configuration fixed!"
echo ""
echo "⚠️  IMPORTANT: Restart your backend server now!" >&2
echo "   1. Stop backend (Ctrl+C in terminal where it's running)"
echo "   2. Restart: cd backend && npm run dev"
echo ""
echo "Then try registering again at http://localhost:5173/register"
