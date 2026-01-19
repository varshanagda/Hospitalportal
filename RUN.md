# 🚀 How to Run the Project

## Method 1: Docker Compose (Easiest - Recommended)

### Start the Project:
```bash
# Navigate to project root
cd /Users/varshanagda/ProjectAuth

# Start all services (database, backend, frontend)
docker-compose up --build

# OR run in background
docker-compose up --build -d
```

### Access the Application:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5001
- **PostgreSQL:** localhost:5432

### Useful Commands:
```bash
# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop all services
docker-compose down

# Stop and remove volumes (clean reset)
docker-compose down -v

# Restart a specific service
docker-compose restart backend
docker-compose restart frontend
```

---

## Method 2: Run Locally (Without Docker)

### Step 1: Start PostgreSQL Database
```bash
# Using Docker for database only
docker-compose up postgres -d

# OR use local PostgreSQL
# Make sure PostgreSQL is installed and running
```

### Step 2: Initialize Database
```bash
# Connect to database and run init script
docker exec -i auth-postgres psql -U postgres -d authdb < backend/sql/init.sql

# OR if using local PostgreSQL
psql -U postgres -d authdb -f backend/sql/init.sql
```

### Step 3: Start Backend
```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev
```

### Step 4: Start Frontend
```bash
# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

### Access:
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5001

---

## 🔑 Login Credentials

### Test Accounts (if already created):
- **Admin:** 
  - Email: `admin@test.com`
  - Password: `admin123`

- **Doctor:**
  - Email: `doctor@test.com` or `varsha@test.com`
  - Password: `123456` or `doctor123`

- **Patient:**
  - Email: `varsha@test.com`
  - Password: `123456`

### Create New Account:
1. Go to http://localhost:5173/register
2. Fill in the registration form
3. Select your role (User/Patient or Doctor)
4. Click Register

---

## 🛠️ Troubleshooting

### Port Already in Use:
```bash
# Check what's using the port
lsof -i :5001  # Backend
lsof -i :5173  # Frontend
lsof -i :5432  # PostgreSQL

# Kill the process
kill -9 <PID>
```

### Database Connection Error:
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check database connection
docker exec -it auth-postgres psql -U postgres -d authdb
```

### Reset Everything:
```bash
# Stop and remove all containers and volumes
docker-compose down -v

# Rebuild and start
docker-compose up --build
```

### View Database:
```bash
# Connect to PostgreSQL
docker exec -it auth-postgres psql -U postgres -d authdb

# Useful SQL commands:
# \dt          - List all tables
# \d users     - View users table structure
# SELECT * FROM users;  - View all users
# \q           - Quit
```

### Check Service Status:
```bash
# Check all running containers
docker ps

# Check logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
```

---

## 📝 Quick Commands Summary

```bash
# Start project
docker-compose up --build

# Start in background
docker-compose up --build -d

# Stop project
docker-compose down

# View logs
docker-compose logs -f

# Restart backend only
docker-compose restart backend

# Restart frontend only
docker-compose restart frontend

# Clean reset (removes all data)
docker-compose down -v && docker-compose up --build
```

---

## 🎯 First Time Setup

If this is your first time running the project:

1. **Start the project:**
   ```bash
   docker-compose up --build
   ```

2. **Wait for all services to start** (you'll see "Server is running on port 5001" in logs)

3. **Open browser:** http://localhost:5173

4. **Register a new account** or use existing test credentials

5. **For Doctor accounts:** Make sure doctor profile is created and approved

---

## ✅ Verify Everything is Working

1. **Check Backend:** http://localhost:5001
   - Should show: "backend is running"

2. **Check Frontend:** http://localhost:5173
   - Should show login page

3. **Check Database:**
   ```bash
   docker exec -it auth-postgres psql -U postgres -d authdb -c "SELECT COUNT(*) FROM users;"
   ```

---

**Need Help?** Check the main README.md or SETUP.md for more details.
