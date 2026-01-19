import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout, getCurrentUser } from "../services/authService";
import { getAllAppointments, updateAppointmentStatus, type Appointment } from "../services/appointmentService";
import { getAllDoctors, createDoctor, type Doctor } from "../services/doctorService";
import Popup from "../components/Popup";

const AdminDashboard = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [activeTab, setActiveTab] = useState<"appointments" | "doctors">("appointments");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [popup, setPopup] = useState<{
    isOpen: boolean;
    type: "alert" | "confirm" | "prompt";
    title: string;
    message?: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    type: "alert",
    title: ""
  });
  
  // New doctor form
  const [newDoctor, setNewDoctor] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    specialization: "",
    qualification: "",
    experience_years: 0,
    consultation_fee: 0
  });

  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    loadAppointments();
    loadDoctors();
  }, []);

  const loadAppointments = async () => {
    try {
      const res = await getAllAppointments();
      setAppointments(res.appointments);
    } catch (_err: any) {
      setError("Failed to load appointments");
    }
  };

  const loadDoctors = async () => {
    try {
      const res = await getAllDoctors("", false);
      setDoctors(res.doctors);
    } catch (_err: any) {
      setError("Failed to load doctors");
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await updateAppointmentStatus(id, status);
      setMessage(`Appointment ${status}`);
      loadAppointments();
    } catch (_err: any) {
      setError("Failed to update status");
    }
  };

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDoctor(newDoctor);
      setMessage("Doctor created successfully!");
      setNewDoctor({
        email: "",
        password: "",
        full_name: "",
        phone: "",
        specialization: "",
        qualification: "",
        experience_years: 0,
        consultation_fee: 0
      });
      loadDoctors();
    } catch (_err: any) {
      setError("Failed to create doctor");
    }
  };

  const handleLogout = () => {
    setPopup({
      isOpen: true,
      type: "confirm",
      title: "Logout",
      message: "Are you sure you want to logout?",
      onConfirm: () => {
        logout();
        navigate("/login");
      }
    });
  };

  // Reusable mouse event handlers to reduce duplication
  const handleLogoutButtonHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = "rgba(0,0,0,0.15)";
    e.currentTarget.style.transform = "scale(1.1)";
    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
  };

  const handleLogoutButtonHoverOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = "rgba(0,0,0,0.1)";
    e.currentTarget.style.transform = "scale(1)";
    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <div>
          <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
          <p style={{ margin: "5px 0 0 0", color: "#666" }}>Welcome, {user?.full_name || user?.email}</p>
        </div>
        <button 
          onClick={handleLogout} 
          style={{
            background: "rgba(0,0,0,0.1)",
            color: "#333",
            border: "1px solid rgba(0,0,0,0.2)",
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}
          onMouseOver={handleLogoutButtonHover}
          onMouseOut={handleLogoutButtonHoverOut}
        >
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: "20px", borderBottom: "2px solid #ddd" }}>
        <button
          onClick={() => setActiveTab("appointments")}
          style={{
            padding: "10px 20px",
            border: "none",
            background: "none",
            cursor: "pointer",
            borderBottom: activeTab === "appointments" ? "3px solid #007bff" : "none",
            fontWeight: activeTab === "appointments" ? "bold" : "normal"
          }}
        >
          Appointments
        </button>
        <button
          onClick={() => setActiveTab("doctors")}
          style={{
            padding: "10px 20px",
            border: "none",
            background: "none",
            cursor: "pointer",
            borderBottom: activeTab === "doctors" ? "3px solid #007bff" : "none",
            fontWeight: activeTab === "doctors" ? "bold" : "normal"
          }}
        >
          Manage Doctors
        </button>
      </div>

      {/* Messages */}
      {message && <div style={{ padding: "10px", background: "#d4edda", color: "#155724", marginBottom: "15px", borderRadius: "5px" }}>{message}</div>}
      {error && <div style={{ padding: "10px", background: "#f8d7da", color: "#721c24", marginBottom: "15px", borderRadius: "5px" }}>{error}</div>}

      {/* Appointments Tab */}
      {activeTab === "appointments" && (
        <div>
          <h3>All Appointments</h3>
          {appointments.length === 0 ? (
            <p>No appointments found.</p>
          ) : (
            <div>
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  style={{
                    padding: "15px",
                    marginBottom: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "5px"
                  }}
                >
                  <div style={{ marginBottom: "10px" }}>
                    <h4 style={{ margin: "0 0 10px 0" }}>
                      {apt.patient_name} → Dr. {apt.doctor_name}
                    </h4>
                    <p style={{ margin: "5px 0" }}><strong>Specialization:</strong> {apt.specialization}</p>
                    <p style={{ margin: "5px 0" }}><strong>Date:</strong> {new Date(apt.appointment_date).toLocaleDateString()}</p>
                    <p style={{ margin: "5px 0" }}><strong>Time:</strong> {apt.start_time} - {apt.end_time}</p>
                    <p style={{ margin: "5px 0" }}><strong>Reason:</strong> {apt.reason}</p>
                    <p style={{ margin: "5px 0" }}>
                      <strong>Status:</strong>{" "}
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: "3px",
                          background:
                            apt.status === "approved" ? "#d4edda" :
                            apt.status === "pending" ? "#fff3cd" :
                            apt.status === "completed" ? "#d1ecf1" : "#f8d7da",
                          color:
                            apt.status === "approved" ? "#155724" :
                            apt.status === "pending" ? "#856404" :
                            apt.status === "completed" ? "#0c5460" : "#721c24"
                        }}
                      >
                        {apt.status}
                      </span>
                    </p>
                  </div>
                  {apt.status === "pending" && (
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => handleUpdateStatus(apt.id, "approved")}
                        style={{ padding: "8px 16px", background: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(apt.id, "cancelled")}
                        style={{ padding: "8px 16px", background: "#dc3545", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Doctors Tab */}
      {activeTab === "doctors" && (
        <div>
          <h3>Add New Doctor</h3>
          <form onSubmit={handleCreateDoctor} style={{ marginBottom: "30px" }}>
            <div style={{ display: "grid", gap: "10px", marginBottom: "10px" }}>
              <input
                type="email"
                placeholder="Email"
                value={newDoctor.email}
                onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                required
                style={{ padding: "10px", fontSize: "16px" }}
              />
              <input
                type="password"
                placeholder="Password"
                value={newDoctor.password}
                onChange={(e) => setNewDoctor({ ...newDoctor, password: e.target.value })}
                required
                style={{ padding: "10px", fontSize: "16px" }}
              />
              <input
                type="text"
                placeholder="Full Name"
                value={newDoctor.full_name}
                onChange={(e) => setNewDoctor({ ...newDoctor, full_name: e.target.value })}
                required
                style={{ padding: "10px", fontSize: "16px" }}
              />
              <input
                type="tel"
                placeholder="Phone"
                value={newDoctor.phone}
                onChange={(e) => setNewDoctor({ ...newDoctor, phone: e.target.value })}
                style={{ padding: "10px", fontSize: "16px" }}
              />
              <input
                type="text"
                placeholder="Specialization"
                value={newDoctor.specialization}
                onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                required
                style={{ padding: "10px", fontSize: "16px" }}
              />
              <input
                type="text"
                placeholder="Qualification"
                value={newDoctor.qualification}
                onChange={(e) => setNewDoctor({ ...newDoctor, qualification: e.target.value })}
                style={{ padding: "10px", fontSize: "16px" }}
              />
              <input
                type="number"
                placeholder="Experience (years)"
                value={newDoctor.experience_years || ""}
                onChange={(e) => setNewDoctor({ ...newDoctor, experience_years: parseInt(e.target.value) || 0 })}
                style={{ padding: "10px", fontSize: "16px" }}
              />
              <input
                type="number"
                placeholder="Consultation Fee"
                value={newDoctor.consultation_fee || ""}
                onChange={(e) => setNewDoctor({ ...newDoctor, consultation_fee: parseFloat(e.target.value) || 0 })}
                style={{ padding: "10px", fontSize: "16px" }}
              />
            </div>
            <button type="submit" style={{ padding: "10px 20px", cursor: "pointer", background: "#007bff", color: "white", border: "none", borderRadius: "5px" }}>
              Add Doctor
            </button>
          </form>

          <h3>All Doctors</h3>
          {doctors.length === 0 ? (
            <p>No doctors found.</p>
          ) : (
            <div>
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  style={{
                    padding: "15px",
                    marginBottom: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "5px"
                  }}
                >
                  <h4 style={{ margin: "0 0 10px 0" }}>Dr. {doctor.full_name}</h4>
                  <p style={{ margin: "5px 0" }}><strong>Email:</strong> {doctor.email}</p>
                  <p style={{ margin: "5px 0" }}><strong>Specialization:</strong> {doctor.specialization}</p>
                  {doctor.qualification && <p style={{ margin: "5px 0" }}><strong>Qualification:</strong> {doctor.qualification}</p>}
                  {doctor.experience_years && <p style={{ margin: "5px 0" }}><strong>Experience:</strong> {doctor.experience_years} years</p>}
                  {doctor.consultation_fee && <p style={{ margin: "5px 0" }}><strong>Fee:</strong> ${doctor.consultation_fee}</p>}
                  <p style={{ margin: "5px 0" }}>
                    <strong>Available:</strong>{" "}
                    <span style={{ color: doctor.is_available ? "green" : "red" }}>
                      {doctor.is_available ? "Yes" : "No"}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    {/* Popup Component */}
    <Popup
      isOpen={popup.isOpen}
      onClose={() => setPopup({ ...popup, isOpen: false })}
      onConfirm={popup.onConfirm}
      title={popup.title}
      message={popup.message}
      type={popup.type}
      confirmText={popup.type === "confirm" ? "Yes" : "OK"}
      cancelText="Cancel"
    />
  </div>
  );
};

export default AdminDashboard;
