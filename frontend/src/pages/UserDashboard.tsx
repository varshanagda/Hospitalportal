import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout, getCurrentUser } from "../services/authService";
import { getAllDoctors, type Doctor } from "../services/doctorService";
import { getAvailableSlots, type Slot } from "../services/slotService";
import { getUserAppointments, bookAppointment, cancelAppointment, type Appointment } from "../services/appointmentService";

const UserDashboard = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [searchSpecialization, setSearchSpecialization] = useState("");
  const [activeTab, setActiveTab] = useState<"book" | "appointments">("book");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    loadDoctors();
    loadAppointments();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getAllDoctors(searchSpecialization.trim(), true);
      setDoctors(res.doctors || []);
    } catch (_err: any) {
      setError("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  const loadSlots = async () => {
    if (!selectedDoctorId) return;
    try {
      const res = await getAvailableSlots(selectedDoctorId, selectedDate);
      setAvailableSlots(res.slots);
    } catch (_err: any) {
      setError("Failed to load slots");
    }
  };

  const loadAppointments = async () => {
    try {
      const res = await getUserAppointments();
      setAppointments(res.appointments);
    } catch (_err: any) {
      setError("Failed to load appointments");
    }
  };

  const handleSearchDoctors = () => {
    loadDoctors();
  };

  const handleBookSlot = async (slotId: number) => {
    const reason = prompt("Enter reason for appointment:");
    if (!reason) return;

    try {
      await bookAppointment({ slot_id: slotId, reason });
      setMessage("Appointment booked successfully!");
      setAvailableSlots([]);
      setSelectedDoctorId(null);
      loadAppointments();
    } catch (_err: any) {
      setError("Failed to book appointment");
    }
  };

  const handleCancelAppointment = async (id: number) => {
    if (!confirm("Cancel this appointment?")) return;
    const reason = prompt("Enter cancellation reason:");
    if (!reason) return;

    try {
      await cancelAppointment(id, reason);
      setMessage("Appointment cancelled");
      loadAppointments();
    } catch (_err: any) {
      setError("Failed to cancel appointment");
    }
  };

  const handleLogout = () => {
    if (confirm("Logout?")) {
      logout();
      navigate("/login");
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <div>
          <h1 style={{ margin: 0 }}>Patient Dashboard</h1>
          <p style={{ margin: "5px 0 0 0", color: "#666" }}>Welcome, {user?.full_name || user?.email}</p>
        </div>
        <button onClick={handleLogout} style={{ padding: "10px 20px", cursor: "pointer" }}>
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: "20px", borderBottom: "2px solid #ddd" }}>
        <button
          onClick={() => setActiveTab("book")}
          style={{
            padding: "10px 20px",
            border: "none",
            background: "none",
            cursor: "pointer",
            borderBottom: activeTab === "book" ? "3px solid #007bff" : "none",
            fontWeight: activeTab === "book" ? "bold" : "normal"
          }}
        >
          Book Appointment
        </button>
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
          My Appointments
        </button>
      </div>

      {/* Messages */}
      {message && <div style={{ padding: "10px", background: "#d4edda", color: "#155724", marginBottom: "15px", borderRadius: "5px" }}>{message}</div>}
      {error && <div style={{ padding: "10px", background: "#f8d7da", color: "#721c24", marginBottom: "15px", borderRadius: "5px" }}>{error}</div>}

      {/* Book Appointment Tab */}
      {activeTab === "book" && (
        <div>
          {/* Search Section */}
          <div style={{ marginBottom: "30px" }}>
            <h3>Search for Doctors</h3>
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              <input
                placeholder="Enter specialization (e.g., Cardiology)"
                value={searchSpecialization}
                onChange={(e) => setSearchSpecialization(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchDoctors()}
                style={{ flex: 1, padding: "10px", fontSize: "16px" }}
              />
              <button onClick={handleSearchDoctors} disabled={loading} style={{ padding: "10px 20px", cursor: "pointer" }}>
                {loading ? "Searching..." : "Search"}
              </button>
              {searchSpecialization && (
                <button onClick={() => { setSearchSpecialization(""); loadDoctors(); }} style={{ padding: "10px 20px", cursor: "pointer" }}>
                  Clear
                </button>
              )}
            </div>

            {/* Doctors List */}
            {loading ? (
              <p>Loading doctors...</p>
            ) : doctors.length === 0 ? (
              <p>No doctors found. Try a different search.</p>
            ) : (
              <div>
                <p><strong>{doctors.length} doctor(s) found</strong></p>
                {doctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    onClick={() => setSelectedDoctorId(doctor.id)}
                    style={{
                      padding: "15px",
                      marginBottom: "10px",
                      border: selectedDoctorId === doctor.id ? "2px solid #007bff" : "1px solid #ddd",
                      borderRadius: "5px",
                      cursor: "pointer",
                      background: selectedDoctorId === doctor.id ? "#e7f3ff" : "white"
                    }}
                  >
                    <h4 style={{ margin: "0 0 10px 0" }}>Dr. {doctor.full_name}</h4>
                    <p style={{ margin: "5px 0" }}><strong>Specialization:</strong> {doctor.specialization}</p>
                    {doctor.qualification && <p style={{ margin: "5px 0" }}><strong>Qualification:</strong> {doctor.qualification}</p>}
                    {doctor.experience_years && <p style={{ margin: "5px 0" }}><strong>Experience:</strong> {doctor.experience_years} years</p>}
                    {doctor.consultation_fee && <p style={{ margin: "5px 0" }}><strong>Fee:</strong> ${doctor.consultation_fee}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Slots Section */}
          {selectedDoctorId && (
            <div>
              <h3>Select Date & Time</h3>
              <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  style={{ padding: "10px", fontSize: "16px" }}
                />
                <button onClick={loadSlots} style={{ padding: "10px 20px", cursor: "pointer" }}>
                  Find Slots
                </button>
              </div>

              {availableSlots.length > 0 ? (
                <div>
                  <p><strong>{availableSlots.length} slot(s) available</strong></p>
                  {availableSlots.map((slot) => (
                    <div
                      key={slot.id}
                      style={{
                        padding: "15px",
                        marginBottom: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "5px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <div>
                        <p style={{ margin: "5px 0" }}><strong>{new Date(slot.slot_date).toLocaleDateString()}</strong></p>
                        <p style={{ margin: "5px 0" }}>{slot.start_time} - {slot.end_time}</p>
                        <p style={{ margin: "5px 0", fontSize: "14px", color: "#666" }}>
                          {slot.max_bookings - slot.current_bookings} spot(s) left
                        </p>
                      </div>
                      <button
                        onClick={() => handleBookSlot(slot.id)}
                        style={{ padding: "10px 20px", background: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
                      >
                        Book
                      </button>
                    </div>
                  ))}
                </div>
              ) : selectedDate ? (
                <p>No slots available for this date</p>
              ) : null}
            </div>
          )}
        </div>
      )}

      {/* Appointments Tab */}
      {activeTab === "appointments" && (
        <div>
          <h3>My Appointments</h3>
          {appointments.length === 0 ? (
            <p>No appointments yet. Book your first appointment!</p>
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
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <div>
                      <h4 style={{ margin: "0 0 10px 0" }}>Dr. {apt.doctor_name}</h4>
                      <p style={{ margin: "5px 0" }}><strong>Specialization:</strong> {apt.specialization}</p>
                      <p style={{ margin: "5px 0" }}><strong>Date:</strong> {new Date(apt.appointment_date).toLocaleDateString()}</p>
                      <p style={{ margin: "5px 0" }}><strong>Time:</strong> {apt.start_time} - {apt.end_time}</p>
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
                    {apt.status !== "cancelled" && apt.status !== "completed" && (
                      <button
                        onClick={() => handleCancelAppointment(apt.id)}
                        style={{ padding: "8px 16px", background: "#dc3545", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
