# Fix Registration Server Error

## Common Causes & Solutions

### 1. Database Not Running

**Check if database is running:**
```bash
# If using Docker
docker ps | grep postgres

# If using local PostgreSQL
ps aux | grep postgres
```

**Solution:** Start the database
```bash
# Using Docker
docker-compose up postgres -d

# Or start everything
docker-compose up --build
```

### 2. Database Tables Not Created

**Check if tables exist:**
```bash
# Using Docker
docker exec -it auth-postgres psql -U postgres -d authdb -c "\dt"

# If tables don't exist, initialize them:
docker exec -i auth-postgres psql -U postgres -d authdb < backend/sql/init.sql
```

### 3. Missing .env File

**Create backend/.env file:**
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
EOF
```

**If using Docker, the environment variables are set in docker-compose.yml**

### 4. Database Connection String Wrong

**For Docker setup:**
- DB_HOST should be `postgres` (service name in docker-compose)
- DB_USER: `postgres`
- DB_PASSWORD: `postgres`
- DB_NAME: `authdb`
- DB_PORT: `5432`

**For local setup:**
- DB_HOST: `localhost`
- Other values depend on your local PostgreSQL setup

### 5. Check Backend Logs

**View backend logs to see actual error:**
```bash
# If using Docker
docker-compose logs backend --tail=50

# If running locally
# Check the terminal where you ran `npm run dev`
```

### Quick Fix Script

Run this to check and fix common issues:
```bash
./check-database.sh
```
