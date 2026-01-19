# 🔴 FIX: Registration Error - ERR_CONNECTION_REFUSED

## The Error:
```
POST http://localhost:5001/auth/register net::ERR_CONNECTION_REFUSED
```

## What This Means:
**The backend server is NOT running on port 5001.**

---

## ✅ SOLUTION (Do This Now):

### **EASIEST WAY - Copy and Paste This:**

Open a **NEW Terminal window** and run:

```bash
cd /Users/varshanagda/ProjectAuth
docker-compose up --build
```

**Wait until you see:**
```
Server is running on port 5001
```

**Keep this terminal open!** (Don't close it)

**Then go back to your browser and try registration - it will work! ✅**

---

## Alternative: Start Backend Manually

If Docker doesn't work, use this:

### Step 1: Start Database
```bash
cd /Users/varshanagda/ProjectAuth
docker-compose up postgres -d
```

### Step 2: Start Backend (in same or new terminal)
```bash
cd /Users/varshanagda/ProjectAuth/backend

# Create .env file
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

# Start server
npm run dev
```

**Wait for:** `Server is running on port 5001`

**Keep terminal open!**

---

## ✅ Verify It's Working:

1. **Open browser:** http://localhost:5001
   - Should show: **"backend is running"**

2. **Or test with:**
   ```bash
   curl http://localhost:5001
   ```

3. **Try registration again** - It will work! 🎉

---

## ⚠️ IMPORTANT NOTES:

- ✅ **Backend MUST keep running** while you use the app
- ✅ **Don't close the terminal** where backend is running  
- ✅ **If you close it, you'll get the error again**
- ✅ **You need 2 things running:**
  1. Database (PostgreSQL)
  2. Backend server (Node.js)

---

## 🎯 Quick Checklist:

- [ ] Backend server is running (check http://localhost:5001)
- [ ] Terminal shows "Server is running on port 5001"
- [ ] No errors in terminal
- [ ] Browser can access http://localhost:5001
- [ ] Try registration - should work now!

---

## 📝 What's Happening:

1. **Frontend** (your browser) tries to connect to `http://localhost:5001`
2. **Backend** should be listening on port 5001
3. **But backend is NOT running** → Connection refused error
4. **Solution:** Start the backend server
5. **Now frontend can connect** → Registration works! ✅

---

**The backend server is the missing piece. Start it and registration will work!**
