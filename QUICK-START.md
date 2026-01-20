# ⚡ Quick Start Guide

## 🚨 Registration Not Working? Backend Not Running!

### ✅ FASTEST SOLUTION (3 Steps):

1. **Open Terminal**
2. **Run this command:**
   ```bash
   cd /Users/varshanagda/ProjectAuth && docker-compose up --build
   ```
3. **Wait for:** `Server is running on port 5001`
4. **Try registration again** - It will work now! ✅

---

## 📋 What You Need Running:

1. ✅ **PostgreSQL Database** (port 5433)
2. ✅ **Backend Server** (port 5001) ← **THIS IS MISSING!**
3. ✅ **Frontend** (port 5173)

---

## 🔍 How to Check:

### Is Backend Running?
Open browser: http://localhost:5001
- ✅ Shows "backend is running" = GOOD
- ❌ Connection refused = BACKEND NOT RUNNING

### Quick Test:
```bash
curl http://localhost:5001
```

---

## 🎯 Start Backend (Choose One):

### Option A: Docker (Recommended)
```bash
docker-compose up --build
```

### Option B: Manual
```bash
cd backend
npm install
npm run dev
```

---

**The backend MUST be running for registration to work!**
