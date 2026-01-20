# 🔴 FIX: ERR_CONNECTION_REFUSED Error

## The Problem:
```
POST http://localhost:5001/auth/register net::ERR_CONNECTION_REFUSED
```

**This means: The backend server is NOT running!**

---

## ✅ SOLUTION (Do This Now):

### Option 1: Start with Docker (Easiest)

**Open a NEW Terminal window and run:**

```bash
cd /Users/varshanagda/ProjectAuth
docker-compose up --build
```

**Wait until you see:**
```
Server is running on port 5001
```

**Keep this terminal open!** (Don't close it)

**Then try registration again - it will work! ✅**

---

### Option 2: Start Backend Manually

**Step 1: Start Database (Terminal 1)**
```bash
cd /Users/varshanagda/ProjectAuth
docker-compose up postgres -d
```

**Step 2: Start Backend (Terminal 2)**
```bash
cd /Users/varshanagda/ProjectAuth/backend

# Create .env file if it doesn't exist
cat > .env << 'EOF'
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=authdb
DB_PORT=5433
JWT_SECRET=supersecretkey
PORT=5001
EOF

# Install dependencies (if needed)
npm install

# Start the server
npm run dev
```

**Wait for:** `Server is running on port 5001`

**Keep this terminal open!**

---

## ✅ Verify It's Working:

1. **Open browser:** http://localhost:5001
   - Should show: "backend is running"

2. **Or test with curl:**
   ```bash
   curl http://localhost:5001
   ```

3. **Try registration again** - It will work now! 🎉

---

## ⚠️ IMPORTANT:

- **The backend MUST keep running** while you use the app
- **Don't close the terminal** where backend is running
- **If you close it, you'll get the error again**

---

## 🎯 Quick Checklist:

- [ ] Backend server is running (check http://localhost:5001)
- [ ] Terminal shows "Server is running on port 5001"
- [ ] No errors in the terminal
- [ ] Try registration - it should work now!

---

**The backend server is the missing piece. Start it and registration will work!**
