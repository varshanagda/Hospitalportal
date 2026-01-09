# Quick Setup Guide

## 🚀 Quick Start (3 Steps)

### Step 1: Setup Backend Environment

Create `backend/.env` file:
```bash
cd backend
cat > .env << EOF
DB_HOST=localhost
DB_USER=myuser
DB_PASSWORD=mypassword
DB_NAME=mydb
DB_PORT=5432
JWT_SECRET=your-super-secret-jwt-key-change-this
PORT=5001
EOF
```

### Step 2: Start PostgreSQL

**Option A: Using Docker (Easiest)**
```bash
cd ..  # back to project root
docker-compose up postgres -d
```

**Option B: Local PostgreSQL**
```bash
# Create database
psql -U postgres
CREATE DATABASE mydb;
CREATE USER myuser WITH PASSWORD 'mypassword';
GRANT ALL PRIVILEGES ON DATABASE mydb TO myuser;
\q

# Initialize schema
psql -U myuser -d mydb -f backend/sql/init.sql
```

### Step 3: Start Services

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Access Application:**
- Frontend: http://localhost:5174
- Backend API: http://localhost:5001

## 📝 Create Test Accounts

### 1. Register Admin (First User)
```bash
curl -X POST http://localhost:5001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123",
    "role": "admin",
    "full_name": "Admin User"
  }'
```

**Important:** Manually update the first user to admin role in database:
```sql
psql -U myuser -d mydb
UPDATE users SET role = 'admin' WHERE email = 'admin@test.com';
```

### 2. Register Doctor
```bash
curl -X POST http://localhost:5001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@test.com",
    "password": "doctor123",
    "role": "doctor",
    "full_name": "Dr. John Smith",
    "phone": "1234567890"
  }'
```

### 3. Register Patient
```bash
curl -X POST http://localhost:5001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@test.com",
    "password": "patient123",
    "role": "user",
    "full_name": "Jane Doe",
    "phone": "0987654321"
  }'
```

## 🧪 Test the Complete Flow

### Step 1: Doctor Setup
1. Login as doctor (doctor@test.com / doctor123)
2. Go to "Profile" tab
3. Fill in doctor details:
   - Specialization: Cardiology
   - Qualification: MD, MBBS
   - Experience: 10 years
   - Fee: $100
4. Save profile (will be pending approval)

### Step 2: Admin Approval
1. Login as admin (admin@test.com / admin123)
2. Go to "Doctors" tab
3. Approve the doctor profile

### Step 3: Create Slots
1. Login back as doctor
2. Go to "Slots" tab
3. Create time slots:
   - Date: Tomorrow
   - Time: 09:00 - 09:30
   - Click "Create Slot"
4. Create more slots for testing

### Step 4: Book Appointment
1. Login as patient (patient@test.com / patient123)
2. Go to "Book Appointment" tab
3. Search doctors (or leave blank to see all)
4. Click on doctor card to select
5. Choose date and click "Search Slots"
6. Click "Book" on available slot
7. Enter reason for visit

### Step 5: Admin Approval of Appointment
1. Login as admin
2. Go to "Appointments" tab
3. See pending appointment
4. Click "Approve"

### Step 6: View Approved Appointment
1. Login as patient
2. Go to "My Appointments" tab
3. See approved appointment

## 🐳 Docker Setup (Alternative)

If you prefer to use Docker for everything:

```bash
# Start all services
docker-compose up --build

# Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:5001
# PostgreSQL: localhost:5433
```

## 🔧 Troubleshooting

### Database Connection Error
```bash
# Check if PostgreSQL is running
docker ps
# or
ps aux | grep postgres

# Check connection
psql -U myuser -d mydb -h localhost -p 5432
```

### Port Already in Use
```bash
# Check what's using the port
lsof -i :5001  # Backend
lsof -i :5174  # Frontend

# Kill the process
kill -9 <PID>
```

### Frontend Can't Connect to Backend
- Check backend is running on port 5001
- Check CORS is enabled in backend
- Verify API_URL in frontend service files

### Database Schema Issues
```bash
# Reset database
psql -U myuser -d mydb
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
\q

# Re-initialize
psql -U myuser -d mydb -f backend/sql/init.sql
```

## 📊 Database Tools

### View Tables
```sql
psql -U myuser -d mydb

-- List all tables
\dt

-- View table structure
\d users
\d doctors
\d slots
\d appointments

-- View data
SELECT * FROM users;
SELECT * FROM doctors;
SELECT * FROM appointments;
```

### Useful Queries
```sql
-- See all users with roles
SELECT id, email, role, full_name FROM users;

-- See approved doctors
SELECT d.*, u.full_name, u.email 
FROM doctors d 
JOIN users u ON d.user_id = u.id 
WHERE d.is_approved = true;

-- See all appointments with details
SELECT 
  a.id,
  u1.full_name as patient_name,
  u2.full_name as doctor_name,
  d.specialization,
  a.appointment_date,
  a.start_time,
  a.status
FROM appointments a
JOIN users u1 ON a.user_id = u1.id
JOIN doctors d ON a.doctor_id = d.id
JOIN users u2 ON d.user_id = u2.id
ORDER BY a.appointment_date DESC;
```

## 🎯 Next Steps

1. **Customize Email Templates** - Edit `backend/src/services/email.service.js`
2. **Add Real Email Service** - Integrate SendGrid or AWS SES
3. **Enhance UI** - Add styling with Tailwind CSS or Material-UI
4. **Add Tests** - Write unit and integration tests
5. **Deploy** - Deploy to AWS, Heroku, or Vercel

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [JWT.io](https://jwt.io/)

---

**Need help?** Open an issue or check the main README.md for more details.
