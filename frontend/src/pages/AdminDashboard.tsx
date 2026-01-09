import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout, getCurrentUser } from "../services/authService";
import { getAllDoctors, approveDoctor, type Doctor } from "../services/doctorService";
import { getAllAppointments, approveAppointment, cancelAppointment, type Appointment } from "../services/appointmentService";

const AdminDashboard = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<"doctors" | "appointments">("appointments");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      if (activeTab === "doctors") {
        const res = await getAllDoctors(undefined, false);
        setDoctors(res.doctors);
      } else {
        const res = await getAllAppointments();
        setAppointments(res.appointments);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load data");
    }
  };

  const handleApproveDoctor = async (id: number, isApproved: boolean) => {
    try {
      await approveDoctor(id, isApproved);
      setMessage(`Doctor ${isApproved ? "approved" : "disapproved"} successfully!`);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update doctor status");
    }
  };

  const handleApproveAppointment = async (id: number) => {
    const adminNotes = prompt("Enter admin notes (optional):");
    
    try {
      await approveAppointment(id, adminNotes || undefined);
      setMessage("Appointment approved successfully!");
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to approve appointment");
    }
  };

  const handleCancelAppointment = async (id: number) => {
    const reason = prompt("Enter cancellation reason:");
    if (!reason) return;

    try {
      await cancelAppointment(id, reason);
      setMessage("Appointment cancelled successfully!");
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to cancel appointment");
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/login");
    }
  };

  const getPendingDoctorsCount = () => doctors.filter(d => !d.is_approved).length;
  const getPendingAppointmentsCount = () => appointments.filter(a => a.status === "pending").length;

  return (
    <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "20px",
        background: "white",
        padding: "20px",
        borderRadius: "15px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}>
        <div>
          <h1 style={{ margin: "0 0 5px 0", color: "#333", fontSize: "28px" }}>👑 Admin Dashboard</h1>
          <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>Welcome, Admin {user?.full_name || user?.email}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div style={{
            padding: "10px 20px",
            background: "linear-gradient(135deg, #ffc107 0%, #ff9800 100%)",
            borderRadius: "25px",
            boxShadow: "0 2px 10px rgba(255,193,7,0.3)"
          }}>
            <span style={{ color: "white", fontSize: "14px", fontWeight: "600" }}>
              👑 {user?.full_name || user?.email?.split('@')[0]}
            </span>
          </div>
          <button 
            onClick={handleLogout} 
            style={{ 
              padding: "12px 24px", 
              background: "#dc3545", 
              color: "white", 
              border: "none", 
              borderRadius: "25px", 
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: "700",
              boxShadow: "0 4px 15px rgba(220,53,69,0.4)",
              transition: "all 0.3s",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(220,53,69,0.5)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(220,53,69,0.4)";
            }}
            title="Click to logout"
          >
            <span style={{ fontSize: "16px" }}>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "15px", marginBottom: "20px" }}>
        <div style={{ padding: "20px", background: "#fff3cd", borderRadius: "5px" }}>
          <h3>{getPendingDoctorsCount()}</h3>
          <p>Pending Doctor Approvals</p>
        </div>
        <div style={{ padding: "20px", background: "#f8d7da", borderRadius: "5px" }}>
          <h3>{getPendingAppointmentsCount()}</h3>
          <p>Pending Appointment Approvals</p>
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setActiveTab("appointments")}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            background: activeTab === "appointments" ? "#007bff" : "#ccc",
            color: activeTab === "appointments" ? "white" : "black",
            border: "none",
            cursor: "pointer"
          }}
        >
          Appointments {getPendingAppointmentsCount() > 0 && `(${getPendingAppointmentsCount()})`}
        </button>
        <button
          onClick={() => setActiveTab("doctors")}
          style={{
            padding: "10px 20px",
            background: activeTab === "doctors" ? "#007bff" : "#ccc",
            color: activeTab === "doctors" ? "white" : "black",
            border: "none",
            cursor: "pointer"
          }}
        >
          Doctors {getPendingDoctorsCount() > 0 && `(${getPendingDoctorsCount()})`}
        </button>
      </div>

      {message && <div style={{ padding: "10px", background: "#d4edda", color: "#155724", marginBottom: "15px", borderRadius: "5px" }}>{message}</div>}
      {error && <div style={{ padding: "10px", background: "#f8d7da", color: "#721c24", marginBottom: "15px", borderRadius: "5px" }}>{error}</div>}

      {activeTab === "doctors" && (
        <div>
          <h2>Doctor Management</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f0f0f0" }}>
                  <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Name</th>
                  <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Email</th>
                  <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Specialization</th>
                  <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Qualification</th>
                  <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Experience</th>
                  <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Fee</th>
                  <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Status</th>
                  <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doctor) => (
                  <tr key={doctor.id} style={{ background: doctor.is_approved ? "inherit" : "#fff3cd" }}>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>{doctor.full_name || "-"}</td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>{doctor.email}</td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>{doctor.specialization}</td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>{doctor.qualification || "-"}</td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>{doctor.experience_years || "-"} yrs</td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>${doctor.consultation_fee || "-"}</td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: "3px",
                          background: doctor.is_approved ? "#d4edda" : "#f8d7da",
                          color: doctor.is_approved ? "#155724" : "#721c24"
                        }}
                      >
                        {doctor.is_approved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      {!doctor.is_approved ? (
                        <button
                          onClick={() => handleApproveDoctor(doctor.id, true)}
                          style={{
                            padding: "5px 10px",
                            background: "#28a745",
                            color: "white",
                            border: "none",
                            borderRadius: "3px",
                            cursor: "pointer",
                            marginRight: "5px"
                          }}
                        >
                          Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApproveDoctor(doctor.id, false)}
                          style={{
                            padding: "5px 10px",
                            background: "#dc3545",
                            color: "white",
                            border: "none",
                            borderRadius: "3px",
                            cursor: "pointer"
                          }}
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "appointments" && (
        <div>
          <h2>Appointment Management</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f0f0f0" }}>
                  <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>ID</th>
                  <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Patient</th>
                  <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Doctor</th>
                  <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Specialization</th>
                  <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Date</th>
                  <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Time</th>
                  <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Status</th>
                  <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt.id} style={{ background: apt.status === "pending" ? "#fff3cd" : "inherit" }}>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>{apt.id}</td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>{apt.patient_name || apt.patient_email}</td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>Dr. {apt.doctor_name}</td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>{apt.specialization}</td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>{apt.appointment_date}</td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>{apt.start_time} - {apt.end_time}</td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: "3px",
                          background:
                            apt.status === "approved"
                              ? "#d4edda"
                              : apt.status === "pending"
                              ? "#fff3cd"
                              : apt.status === "completed"
                              ? "#d1ecf1"
                              : "#f8d7da",
                          color:
                            apt.status === "approved"
                              ? "#155724"
                              : apt.status === "pending"
                              ? "#856404"
                              : apt.status === "completed"
                              ? "#0c5460"
                              : "#721c24"
                        }}
                      >
                        {apt.status}
                      </span>
                    </td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      {apt.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApproveAppointment(apt.id)}
                            style={{
                              padding: "5px 10px",
                              background: "#28a745",
                              color: "white",
                              border: "none",
                              borderRadius: "3px",
                              cursor: "pointer",
                              marginRight: "5px"
                            }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleCancelAppointment(apt.id)}
                            style={{
                              padding: "5px 10px",
                              background: "#dc3545",
                              color: "white",
                              border: "none",
                              borderRadius: "3px",
                              cursor: "pointer"
                            }}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
