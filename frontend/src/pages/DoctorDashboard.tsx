import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout, getCurrentUser } from "../services/authService";
import { getDoctorProfile, createDoctorProfile, getDoctorStats, type Doctor } from "../services/doctorService";
import { getDoctorSlots, createSlot, deleteSlot, type Slot } from "../services/slotService";
import { getDoctorAppointments, cancelAppointment, type Appointment } from "../services/appointmentService";

const DoctorDashboard = () => {
  const [doctorProfile, setDoctorProfile] = useState<Doctor | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<"profile" | "slots" | "appointments">("profile");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const user = getCurrentUser();

  // Profile form
  const [specialization, setSpecialization] = useState("");
  const [qualification, setQualification] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [consultationFee, setConsultationFee] = useState("");
  const [bio, setBio] = useState("");

  // Slot form
  const [slotDate, setSlotDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [maxBookings, setMaxBookings] = useState("1");

  useEffect(() => {
    loadDoctorData();
  }, []);

  const loadDoctorData = async () => {
    try {
      const profileRes = await getDoctorProfile();
      setDoctorProfile(profileRes.doctor);
      setSpecialization(profileRes.doctor.specialization);
      setQualification(profileRes.doctor.qualification || "");
      setExperienceYears(profileRes.doctor.experience_years?.toString() || "");
      setConsultationFee(profileRes.doctor.consultation_fee?.toString() || "");
      setBio(profileRes.doctor.bio || "");

      const statsRes = await getDoctorStats();
      setStats(statsRes);

      const slotsRes = await getDoctorSlots();
      setSlots(slotsRes.slots);

      const appointmentsRes = await getDoctorAppointments();
      setAppointments(appointmentsRes.appointments);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError("Please create your doctor profile first");
      }
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await createDoctorProfile({
        specialization,
        qualification,
        experience_years: experienceYears ? parseInt(experienceYears) : undefined,
        consultation_fee: consultationFee ? parseFloat(consultationFee) : undefined,
        bio,
      });
      setMessage("Profile saved successfully!");
      loadDoctorData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save profile");
    }
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await createSlot({
        slot_date: slotDate,
        start_time: startTime,
        end_time: endTime,
        max_bookings: parseInt(maxBookings),
      });
      setMessage("Slot created successfully!");
      setSlotDate("");
      setStartTime("");
      setEndTime("");
      setMaxBookings("1");
      loadDoctorData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create slot");
    }
  };

  const handleDeleteSlot = async (id: number) => {
    if (!confirm("Are you sure you want to delete this slot?")) return;

    try {
      await deleteSlot(id);
      setMessage("Slot deleted successfully!");
      loadDoctorData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete slot");
    }
  };

  const handleCancelAppointment = async (id: number) => {
    const reason = prompt("Enter cancellation reason:");
    if (!reason) return;

    try {
      await cancelAppointment(id, reason);
      setMessage("Appointment cancelled successfully!");
      loadDoctorData();
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

  if (!doctorProfile && !error) {
    return <div style={{ padding: "20px" }}>Loading...</div>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
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
          <h1 style={{ margin: "0 0 5px 0", color: "#333", fontSize: "28px" }}>👨‍⚕️ Doctor Dashboard</h1>
          <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>Welcome, Dr. {user?.full_name || user?.email}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div style={{
            padding: "10px 20px",
            background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
            borderRadius: "25px",
            boxShadow: "0 2px 10px rgba(40,167,69,0.3)"
          }}>
            <span style={{ color: "white", fontSize: "14px", fontWeight: "600" }}>
              👨‍⚕️ {user?.full_name || user?.email?.split('@')[0]}
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

      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px", marginBottom: "20px" }}>
          <div style={{ padding: "15px", background: "#f0f0f0", borderRadius: "5px" }}>
            <h3>{stats.appointments?.pending_appointments || 0}</h3>
            <p>Pending</p>
          </div>
          <div style={{ padding: "15px", background: "#e8f5e9", borderRadius: "5px" }}>
            <h3>{stats.appointments?.approved_appointments || 0}</h3>
            <p>Approved</p>
          </div>
          <div style={{ padding: "15px", background: "#e3f2fd", borderRadius: "5px" }}>
            <h3>{stats.appointments?.completed_appointments || 0}</h3>
            <p>Completed</p>
          </div>
          <div style={{ padding: "15px", background: "#fff3e0", borderRadius: "5px" }}>
            <h3>{stats.slots?.available_slots || 0}</h3>
            <p>Available Slots</p>
          </div>
        </div>
      )}

      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => setActiveTab("profile")} style={{ padding: "10px 20px", marginRight: "10px", background: activeTab === "profile" ? "#007bff" : "#ccc" }}>
          Profile
        </button>
        <button onClick={() => setActiveTab("slots")} style={{ padding: "10px 20px", marginRight: "10px", background: activeTab === "slots" ? "#007bff" : "#ccc" }}>
          Slots
        </button>
        <button onClick={() => setActiveTab("appointments")} style={{ padding: "10px 20px", background: activeTab === "appointments" ? "#007bff" : "#ccc" }}>
          Appointments
        </button>
      </div>

      {message && <div style={{ padding: "10px", background: "#d4edda", color: "#155724", marginBottom: "15px" }}>{message}</div>}
      {error && <div style={{ padding: "10px", background: "#f8d7da", color: "#721c24", marginBottom: "15px" }}>{error}</div>}

      {activeTab === "profile" && (
        <div>
          <h2>Doctor Profile</h2>
          {doctorProfile && !doctorProfile.is_approved && (
            <div style={{ padding: "10px", background: "#fff3cd", color: "#856404", marginBottom: "15px" }}>
              Your profile is pending admin approval
            </div>
          )}
          <form onSubmit={handleProfileSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px", maxWidth: "600px" }}>
            <input
              placeholder="Specialization *"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              required
              style={{ padding: "10px" }}
            />
            <input
              placeholder="Qualification"
              value={qualification}
              onChange={(e) => setQualification(e.target.value)}
              style={{ padding: "10px" }}
            />
            <input
              type="number"
              placeholder="Years of Experience"
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
              style={{ padding: "10px" }}
            />
            <input
              type="number"
              step="0.01"
              placeholder="Consultation Fee"
              value={consultationFee}
              onChange={(e) => setConsultationFee(e.target.value)}
              style={{ padding: "10px" }}
            />
            <textarea
              placeholder="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              style={{ padding: "10px" }}
            />
            <button type="submit" style={{ padding: "10px" }}>Save Profile</button>
          </form>
        </div>
      )}

      {activeTab === "slots" && (
        <div>
          <h2>Create Time Slot</h2>
          <form onSubmit={handleCreateSlot} style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
            <input type="date" value={slotDate} onChange={(e) => setSlotDate(e.target.value)} required style={{ padding: "10px" }} />
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required style={{ padding: "10px" }} />
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required style={{ padding: "10px" }} />
            <input type="number" value={maxBookings} onChange={(e) => setMaxBookings(e.target.value)} placeholder="Max bookings" style={{ padding: "10px", width: "120px" }} />
            <button type="submit" style={{ padding: "10px" }}>Create Slot</button>
          </form>

          <h3>My Slots</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f0f0f0" }}>
                  <th style={{ padding: "10px", border: "1px solid #ddd" }}>Date</th>
                  <th style={{ padding: "10px", border: "1px solid #ddd" }}>Time</th>
                  <th style={{ padding: "10px", border: "1px solid #ddd" }}>Bookings</th>
                  <th style={{ padding: "10px", border: "1px solid #ddd" }}>Available</th>
                  <th style={{ padding: "10px", border: "1px solid #ddd" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {slots.map((slot) => (
                  <tr key={slot.id}>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>{slot.slot_date}</td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>{slot.start_time} - {slot.end_time}</td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>{slot.current_bookings}/{slot.max_bookings}</td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>{slot.is_available ? "Yes" : "No"}</td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      <button onClick={() => handleDeleteSlot(slot.id)} style={{ padding: "5px 10px" }}>Delete</button>
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
          <h2>Appointments</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f0f0f0" }}>
                  <th style={{ padding: "10px", border: "1px solid #ddd" }}>Patient</th>
                  <th style={{ padding: "10px", border: "1px solid #ddd" }}>Date</th>
                  <th style={{ padding: "10px", border: "1px solid #ddd" }}>Time</th>
                  <th style={{ padding: "10px", border: "1px solid #ddd" }}>Reason</th>
                  <th style={{ padding: "10px", border: "1px solid #ddd" }}>Status</th>
                  <th style={{ padding: "10px", border: "1px solid #ddd" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt.id}>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>{apt.patient_name || apt.patient_email}</td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>{apt.appointment_date}</td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>{apt.start_time} - {apt.end_time}</td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>{apt.reason || "-"}</td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      <span style={{
                        padding: "3px 8px",
                        borderRadius: "3px",
                        background: apt.status === "approved" ? "#d4edda" : apt.status === "pending" ? "#fff3cd" : "#f8d7da"
                      }}>
                        {apt.status}
                      </span>
                    </td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      {apt.status !== "cancelled" && (
                        <button onClick={() => handleCancelAppointment(apt.id)} style={{ padding: "5px 10px" }}>Cancel</button>
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

export default DoctorDashboard;
