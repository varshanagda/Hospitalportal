# 🏥 Medical Appointment Booking System

A full-stack appointment booking system with JWT authentication, role-based access control, and comprehensive appointment management features.

## 📋 Features

### Authentication & Authorization
- **JWT-based Authentication** with role-based access control
- **Three User Roles**:
  - **User (Patient)**: Book, view, and manage appointments
  - **Doctor**: Create time slots, manage appointments, view statistics
  - **Admin**: Approve doctors, approve/reject appointments, system oversight

### Patient Features
- Search doctors by specialization
- View doctor profiles with qualifications and fees
- Book appointments from available time slots
- View appointment history
- Cancel appointments (with 24-hour policy)
- Reschedule appointments (48-hour policy)

### Doctor Features
- Create and manage doctor profile
- Create time slots with customizable capacity
- View and manage appointments
- Cancel appointments
- Dashboard with statistics
- Requires admin approval before accepting bookings

### Admin Features
- Approve/revoke doctor registrations
- Approve/reject appointment requests
- View all appointments and doctors
- System-wide statistics
- Add administrative notes

### Backend Concepts Implemented
- ✅ **Database Transactions** - Ensures data consistency
- ✅ **Optimistic Locking** - Prevents double-booking using version numbers
- ✅ **Time-slot Conflict Handling** - Prevents overlapping slots
- ✅ **Email Notification Queue** - Async email processing
- ✅ **Appointment History Tracking** - Audit trail for all changes
- ✅ **Business Rules Enforcement**:
  - 24-hour cancellation policy for users
  - 48-hour rescheduling policy
  - Slot capacity management

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express
- **PostgreSQL** - Relational database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **pg** - PostgreSQL client

### Frontend
- **React** with TypeScript
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Vite** - Build tool

## 📁 Project Structure

```
ProjectAuth/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── appointment.controller.js
│   │   │   ├── doctor.controller.js
│   │   │   └── slot.controller.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   └── role.middleware.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── appointment.routes.js
│   │   │   ├── doctor.routes.js
│   │   │   └── slot.routes.js
│   │   ├── services/
│   │   │   └── email.service.js
│   │   ├── db.js
│   │   └── server.js
│   ├── sql/
│   │   └── init.sql
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── UserDashboard.tsx
│   │   │   ├── DoctorDashboard.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   └── Profile.tsx
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── appointmentService.ts
│   │   │   ├── doctorService.ts
│   │   │   └── slotService.ts
│   │   ├── utils/
│   │   │   └── auth.tsx
│   │   ├── app.tsx
│   │   └── main.tsx
│   └── package.json
│
└── docker-compose.yml
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v20.19+ or v22.12+)
- PostgreSQL (v15+)
- Docker & Docker Compose (optional)

### Option 1: Docker Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ProjectAuth
   ```

2. **Start all services**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001
   - PostgreSQL: localhost:5433

### Option 2: Manual Setup

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env file**
   ```bash
   DB_HOST=localhost
   DB_USER=myuser
   DB_PASSWORD=mypassword
   DB_NAME=mydb
   DB_PORT=5432
   JWT_SECRET=your-secret-key-change-this
   PORT=5001
   ```

4. **Initialize database**
   ```bash
   psql -U myuser -d mydb -f sql/init.sql
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Open http://localhost:5174 in your browser

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "role": "user|doctor|admin",
  "full_name": "John Doe",
  "phone": "1234567890"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "token": "jwt-token",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "user",
    "full_name": "John Doe"
  }
}
```

#### Get Profile
```http
GET /auth/profile
Authorization: Bearer <token>
```

### Doctor Endpoints

#### Create/Update Doctor Profile
```http
POST /doctors/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "specialization": "Cardiology",
  "qualification": "MD, MBBS",
  "experience_years": 10,
  "consultation_fee": 100.00,
  "bio": "Experienced cardiologist..."
}
```

#### Get All Doctors
```http
GET /doctors?specialization=Cardiology&approved_only=true
Authorization: Bearer <token>
```

#### Approve Doctor (Admin)
```http
PUT /doctors/:id/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "is_approved": true
}
```

### Slot Endpoints

#### Create Slot (Doctor)
```http
POST /slots
Authorization: Bearer <token>
Content-Type: application/json

{
  "slot_date": "2024-01-20",
  "start_time": "09:00",
  "end_time": "09:30",
  "max_bookings": 1
}
```

#### Get Available Slots
```http
GET /slots/available?doctor_id=1&date=2024-01-20
Authorization: Bearer <token>
```

#### Get Doctor's Slots
```http
GET /slots/my-slots?date=2024-01-20&status=available
Authorization: Bearer <token>
```

### Appointment Endpoints

#### Book Appointment (User)
```http
POST /appointments/book
Authorization: Bearer <token>
Content-Type: application/json

{
  "slot_id": 1,
  "reason": "Regular checkup"
}
```

#### Get User Appointments
```http
GET /appointments/my-appointments?status=pending
Authorization: Bearer <token>
```

#### Approve Appointment (Admin)
```http
PUT /appointments/:id/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "admin_notes": "Approved"
}
```

#### Cancel Appointment
```http
PUT /appointments/:id/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "cancellation_reason": "Schedule conflict"
}
```

#### Reschedule Appointment
```http
PUT /appointments/:id/reschedule
Authorization: Bearer <token>
Content-Type: application/json

{
  "new_slot_id": 2
}
```

## 🗄️ Database Schema

### Users Table
- Stores user credentials and basic info
- Roles: user, doctor, admin

### Doctors Table
- Extended profile for doctors
- Requires admin approval

### Slots Table
- Time slots created by doctors
- Implements optimistic locking (version field)
- Tracks current bookings vs max capacity

### Appointments Table
- Links users, doctors, and slots
- Status: pending, approved, cancelled, completed, rescheduled
- Tracks approval and cancellation details

### Appointment History Table
- Audit trail for all appointment changes

### Email Notifications Table
- Queue for email notifications
- Retry mechanism for failed sends

## 🔐 Security Features

- Passwords hashed with bcrypt
- JWT tokens with expiration
- Role-based access control
- SQL injection prevention (parameterized queries)
- Input validation
- CORS enabled

## 📧 Email Notifications

The system queues email notifications for:
- Appointment confirmations
- Appointment approvals
- Appointment cancellations
- Appointment reminders
- Doctor notifications

Emails are processed asynchronously every 5 minutes. In production, integrate with:
- SendGrid
- AWS SES
- Nodemailer with SMTP

## 🎯 Business Rules

### Cancellation Policy
- Users: Cannot cancel within 24 hours of appointment
- Doctors/Admins: Can cancel anytime

### Rescheduling Policy
- Must reschedule at least 48 hours before appointment
- Moves appointment to "pending" status for re-approval

### Slot Conflict Prevention
- Doctors cannot create overlapping time slots
- System prevents double-booking using optimistic locking

## 🧪 Testing

### Test User Accounts

Create test accounts with:
```bash
# Admin user
email: admin@test.com
password: admin123
role: admin

# Doctor user
email: doctor@test.com
password: doctor123
role: doctor

# Patient user
email: user@test.com
password: user123
role: user
```

### Test Flow

1. **Register as Doctor**
   - Create doctor account
   - Fill doctor profile
   - Wait for admin approval

2. **Admin Approval**
   - Login as admin
   - Approve doctor profile

3. **Create Slots (Doctor)**
   - Login as doctor
   - Create time slots

4. **Book Appointment (User)**
   - Login as user
   - Search doctors
   - Select slot and book

5. **Approve Appointment (Admin)**
   - Login as admin
   - Approve pending appointment

## 🚀 Production Deployment

### Environment Variables
```bash
# Backend
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
DB_PORT=5432
JWT_SECRET=strong-random-secret
PORT=5001
NODE_ENV=production

# Frontend
VITE_API_URL=https://your-api-domain.com
```

### Docker Deployment
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📝 Future Enhancements

- [ ] Video consultation integration
- [ ] Payment gateway integration
- [ ] SMS notifications
- [ ] Calendar sync (Google Calendar, iCal)
- [ ] Patient medical records
- [ ] Prescription management
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Real-time notifications (WebSocket)
- [ ] Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For support, email support@example.com or open an issue on GitHub.

---

**Built with ❤️ using Node.js, React, and PostgreSQL**
