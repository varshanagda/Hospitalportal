import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout, getCurrentUser } from "../services/authService";
import { getDoctorSlots, createSlot, deleteSlot, type Slot } from "../services/slotService";
import { getDoctorAppointments, updateAppointmentStatus, type Appointment } from "../services/appointmentService";

const DoctorDashboard = () => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<"slots" | "appointments">("slots");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  
  // New slot form
  const [newSlot, setNewSlot] = useState({
    slot_date: "",
    start_time: "",
    end_time: "",
    max_bookings: 1
  });

  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    loadSlots();
    loadAppointments();
  }, []);

  const loadSlots = async () => {
    try {
      const res = await getDoctorSlots();
      setSlots(res.slots);
    } catch (err: any) {
      setError("Failed to load slots");
    }
  };

  const loadAppointments = async () => {
    try {
      const res = await getDoctorAppointments();
      setAppointments(res.appointments);
    } catch (err: any) {
      setError("Failed to load appointments");
    }
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSlot(newSlot);
      setMessage("Slot created successfully!");
      setNewSlot({ slot_date: "", start_time: "", end_time: "", max_bookings: 1 });
      loadSlots();
    } catch (err: any) {
      setError("Failed to create slot");
    }
  };

  const handleDeleteSlot = async (id: number) => {
    if (!confirm("Delete this slot?")) return;
    try {
      await deleteSlot(id);
      setMessage("Slot deleted");
      loadSlots();
    } catch (err: any) {
      setError("Failed to delete slot");
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await updateAppointmentStatus(id, status);
      setMessage(`Appointment ${status}`);
      loadAppointments();
    } catch (err: any) {
      setError("Failed to update status");
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
          <h1 style={{ margin: 0 }}>Doctor Dashboard</h1>
          <p style={{ margin: "5px 0 0 0", color: "#666" }}>Welcome, Dr. {user?.full_name || user?.email}</p>
        </div>
        <button onClick={handleLogout} style={{ padding: "10px 20px", cursor: "pointer" }}>
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: "20px", borderBottom: "2px solid #ddd" }}>
        <button
          onClick={() => setActiveTab("slots")}
          style={{
            padding: "10px 20px",
            border: "none",
            background: "none",
            cursor: "pointer",
            borderBottom: activeTab === "slots" ? "3px solid #007bff" : "none",
            fontWeight: activeTab === "slots" ? "bold" : "normal"
          }}
        >
          Manage Slots
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
          Appointments
        </button>
      </div>

      {/* Messages */}
      {message && <div style={{ padding: "10px", background: "#d4edda", color: "#155724", marginBottom: "15px", borderRadius: "5px" }}>{message}</div>}
      {error && <div style={{ padding: "10px", background: "#f8d7da", color: "#721c24", marginBottom: "15px", borderRadius: "5px" }}>{error}</div>}

      {/* Slots Tab */}
      {activeTab === "slots" && (
        <div>
          <h3>Create New Slot</h3>
          <form onSubmit={handleCreateSlot} style={{ marginBottom: "30px" }}>
            <div style={{ display: "grid", gap: "10px", marginBottom: "10px" }}>
              <input
                type="date"
                value={newSlot.slot_date}
                onChange={(e) => setNewSlot({ ...newSlot, slot_date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                required
                style={{ padding: "10px", fontSize: "16px" }}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <input
                  type="time"
                  value={newSlot.start_time}
                  onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                  placeholder="Start Time"
                  required
                  style={{ padding: "10px", fontSize: "16px" }}
                />
                <input
                  type="time"
                  value={newSlot.end_time}
                  onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                  placeholder="End Time"
                  required
                  style={{ padding: "10px", fontSize: "16px" }}
                />
              </div>
              <input
                type="number"
                value={newSlot.max_bookings}
                onChange={(e) => setNewSlot({ ...newSlot, max_bookings: parseInt(e.target.value) })}
                placeholder="Max Bookings"
                min="1"
                required
                style={{ padding: "10px", fontSize: "16px" }}
              />
            </div>
            <button type="submit" style={{ padding: "10px 20px", cursor: "pointer", background: "#007bff", color: "white", border: "none", borderRadius: "5px" }}>
              Create Slot
            </button>
          </form>

          <h3>My Slots</h3>
          {slots.length === 0 ? (
            <p>No slots created yet. Create your first slot above!</p>
          ) : (
            <div>
              {slots.map((slot) => (
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
                      {slot.current_bookings}/{slot.max_bookings} booked
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteSlot(slot.id)}
                    disabled={slot.current_bookings > 0}
                    style={{
                      padding: "8px 16px",
                      background: slot.current_bookings > 0 ? "#ccc" : "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: slot.current_bookings > 0 ? "not-allowed" : "pointer"
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Appointments Tab */}
      {activeTab === "appointments" && (
        <div>
          <h3>Patient Appointments</h3>
          {appointments.length === 0 ? (
            <p>No appointments yet.</p>
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
                  <h4 style={{ margin: "0 0 10px 0" }}>{apt.patient_name}</h4>
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
                  {apt.status === "pending" && (
                    <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
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
                  {apt.status === "approved" && (
                    <div style={{ marginTop: "10px" }}>
                      <button
                        onClick={() => handleUpdateStatus(apt.id, "completed")}
                        style={{ padding: "8px 16px", background: "#17a2b8", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
                      >
                        Mark Completed
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
