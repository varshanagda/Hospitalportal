# Fix: Password Authentication Failed Error

## Error Message
```
❌ password authentication failed for user "postgres"
```

## Cause
The backend can't authenticate with PostgreSQL because:
1. Missing `.env` file in `backend/` directory
2. Wrong password in `.env` file
3. Database password doesn't match credentials

## Solution

### Option 1: If Using Docker PostgreSQL (Recommended)

**Step 1:** Make sure Docker PostgreSQL is running
```bash
docker-compose up postgres -d
```

**Step 2:** Create `backend/.env` file with these credentials:
```bash
cd backend
cat > .env << EOF
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=authdb
DB_PORT=5432
JWT_SECRET=supersecretkey
PORT=5001
NODE_ENV=development
EOF
```

**Step 3:** Restart your backend
```bash
# Stop backend (Ctrl+C if running)
# Then restart:
npm run dev
```

### Option 2: If Using Local PostgreSQL

**Step 1:** Check your local PostgreSQL password
```bash
# Try to connect to see what password is needed
psql -U postgres -h localhost
```

**Step 2:** Create `backend/.env` with your actual PostgreSQL password:
```bash
cd backend
cat > .env << EOF
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=YOUR_ACTUAL_POSTGRES_PASSWORD
DB_NAME=authdb
DB_PORT=5432
JWT_SECRET=supersecretkey
PORT=5001
NODE_ENV=development
EOF
```

**Step 3:** Create the database if it doesn't exist:
```bash
psql -U postgres -h localhost -c "CREATE DATABASE authdb;"
```

**Step 4:** Initialize database tables:
```bash
psql -U postgres -d authdb -h localhost -f backend/sql/init.sql
```

**Step 5:** Restart your backend

### Option 3: Quick Fix Script

Run the fix script:
```bash
cd /Users/varshanagda/ProjectAuth
./fix-password-error.sh
```

Then restart your backend:
```bash
cd backend
npm run dev
```

## Verify Fix

**Check if .env file exists:**
```bash
cat backend/.env
```

**Test database connection:**
```bash
curl http://localhost:5001/health
```
Should return: `{"status":"healthy","database":"connected"}`

**Try registering again:**
- Go to http://localhost:5173/register
- The password error should be fixed

## Common Password Issues

1. **Docker PostgreSQL:** Password is `postgres` (as set in docker-compose.yml)
2. **Local PostgreSQL:** 
   - Default might be empty (no password)
   - Or might be `postgres`
   - Or a custom password you set

3. **If you forgot your local PostgreSQL password:**
   ```bash
   # Reset PostgreSQL password (macOS with Homebrew)
   brew services stop postgresql
   # Edit pg_hba.conf to allow local connections without password
   # Then reconnect and set new password
   ```

## Still Having Issues?

1. **Check backend logs** when starting:
   ```
   DB_HOST: localhost
   DB_USER: postgres
   DB_PASSWORD: *** (should show the password)
   ```

2. **Test PostgreSQL connection manually:**
   ```bash
   # If using Docker
   docker exec -it auth-postgres psql -U postgres -d authdb
   
   # If using local
   psql -U postgres -h localhost -d authdb
   ```

3. **Verify database exists:**
   ```bash
   # List databases
   psql -U postgres -h localhost -l
   ```
