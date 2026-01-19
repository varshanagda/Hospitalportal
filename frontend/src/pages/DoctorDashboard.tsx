import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout, getCurrentUser } from "../services/authService";
import { getDoctorSlots, createSlot, deleteSlot, type Slot } from "../services/slotService";
import { getDoctorAppointments, updateAppointmentStatus, type Appointment } from "../services/appointmentService";
import Popup from "../components/Popup";

const DoctorDashboard = () => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<"slots" | "appointments">("slots");
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
    } catch (_err: any) {
      setError("Failed to load slots");
    }
  };

  const loadAppointments = async () => {
    try {
      const res = await getDoctorAppointments();
      setAppointments(res.appointments);
    } catch (_err: any) {
      setError("Failed to load appointments");
    }
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await createSlot(newSlot);
      setMessage("Slot created successfully!");
      setNewSlot({ slot_date: "", start_time: "", end_time: "", max_bookings: 1 });
      loadSlots();
    } catch (_err: any) {
      console.error("Slot creation error:", _err);
      const errorMsg = _err.response?.data?.message || _err.message || "Failed to create slot";
      setError(errorMsg);
    }
  };

  const handleDeleteSlot = (id: number) => {
    setPopup({
      isOpen: true,
      type: "confirm",
      title: "Delete Slot",
      message: "Are you sure you want to delete this slot?",
      onConfirm: async () => {
        try {
          await deleteSlot(id);
          setMessage("Slot deleted");
          loadSlots();
          setPopup({ ...popup, isOpen: false });
        } catch (_err: any) {
          setError("Failed to delete slot");
          setPopup({ ...popup, isOpen: false });
        }
      }
    });
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
    e.currentTarget.style.background = "rgba(255,255,255,0.4)";
    e.currentTarget.style.transform = "scale(1.1)";
    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
  };

  const handleLogoutButtonHoverOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = "rgba(255,255,255,0.25)";
    e.currentTarget.style.transform = "scale(1)";
    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
  };

  const handleButtonHoverWithColor = (hoverColor: string, defaultColor: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = hoverColor;
  };

  const handleButtonHoverOutWithColor = (defaultColor: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = defaultColor;
  };

  const handleDeleteButtonHover = (canDelete: boolean) => (e: React.MouseEvent<HTMLButtonElement>) => {
    if (canDelete) {
      e.currentTarget.style.background = "#c82333";
    }
  };

  const handleDeleteButtonHoverOut = (canDelete: boolean) => (e: React.MouseEvent<HTMLButtonElement>) => {
    if (canDelete) {
      e.currentTarget.style.background = "#dc3545";
    }
  };

  const buttonStyle = {
    padding: "12px 24px",
    fontSize: "16px",
    fontWeight: "600",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  };

  const primaryButton = {
    ...buttonStyle,
    background: "#007bff",
    color: "white"
  };

  const successButton = {
    ...buttonStyle,
    background: "#28a745",
    color: "white"
  };

  const dangerButton = {
    ...buttonStyle,
    background: "#dc3545",
    color: "white"
  };

  const inputStyle = {
    padding: "12px 16px",
    fontSize: "16px",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    width: "100%",
    transition: "border-color 0.3s ease"
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px", fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "30px",
        padding: "20px",
        background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        borderRadius: "12px",
        color: "white"
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "28px" }}>👨‍⚕️ Doctor Dashboard</h1>
          <p style={{ margin: "8px 0 0 0", opacity: 0.9 }}>Welcome, Dr. {user?.full_name || user?.email}</p>
        </div>
        <button 
          onClick={handleLogout} 
          style={{
            background: "rgba(255,255,255,0.25)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.5)",
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
            backdropFilter: "blur(10px)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}
          onMouseOver={handleLogoutButtonHover}
          onMouseOut={handleLogoutButtonHoverOut}
        >
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div style={{ 
        marginBottom: "20px", 
        borderBottom: "2px solid #e0e0e0",
        display: "flex",
        gap: "10px"
      }}>
        <button
          onClick={() => setActiveTab("slots")}
          style={{
            padding: "12px 24px",
            border: "none",
            background: "none",
            cursor: "pointer",
            borderBottom: activeTab === "slots" ? "3px solid #007bff" : "none",
            fontWeight: activeTab === "slots" ? "bold" : "normal",
            color: activeTab === "slots" ? "#007bff" : "#666",
            fontSize: "16px",
            transition: "all 0.3s ease"
          }}
        >
          📅 Manage Slots
        </button>
        <button
          onClick={() => setActiveTab("appointments")}
          style={{
            padding: "12px 24px",
            border: "none",
            background: "none",
            cursor: "pointer",
            borderBottom: activeTab === "appointments" ? "3px solid #007bff" : "none",
            fontWeight: activeTab === "appointments" ? "bold" : "normal",
            color: activeTab === "appointments" ? "#007bff" : "#666",
            fontSize: "16px",
            transition: "all 0.3s ease"
          }}
        >
          📋 Appointments
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div style={{ 
          padding: "12px 16px", 
          background: "#d4edda", 
          color: "#155724", 
          marginBottom: "15px", 
          borderRadius: "8px",
          border: "1px solid #c3e6cb"
        }}>
          ✅ {message}
        </div>
      )}
      {error && (
        <div style={{ 
          padding: "12px 16px", 
          background: "#f8d7da", 
          color: "#721c24", 
          marginBottom: "15px", 
          borderRadius: "8px",
          border: "1px solid #f5c6cb"
        }}>
          ❌ {error}
        </div>
      )}

      {/* Slots Tab */}
      {activeTab === "slots" && (
        <div>
          <div style={{
            padding: "24px",
            background: "#f8f9fa",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            marginBottom: "30px"
          }}>
            <h3 style={{ marginTop: 0, marginBottom: "20px", color: "#333" }}>➕ Create New Slot</h3>
            <form onSubmit={handleCreateSlot}>
              <div style={{ display: "grid", gap: "15px", marginBottom: "15px" }}>
                <input
                  type="date"
                  value={newSlot.slot_date}
                  onChange={(e) => setNewSlot({ ...newSlot, slot_date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  style={inputStyle}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#007bff"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "#e0e0e0"}
                />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                  <input
                    type="time"
                    value={newSlot.start_time}
                    onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                    placeholder="Start Time"
                    required
                    style={inputStyle}
                    onFocus={(e) => e.currentTarget.style.borderColor = "#007bff"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "#e0e0e0"}
                  />
                  <input
                    type="time"
                    value={newSlot.end_time}
                    onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                    placeholder="End Time"
                    required
                    style={inputStyle}
                    onFocus={(e) => e.currentTarget.style.borderColor = "#007bff"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "#e0e0e0"}
                  />
                </div>
                <input
                  type="number"
                  value={newSlot.max_bookings}
                  onChange={(e) => setNewSlot({ ...newSlot, max_bookings: parseInt(e.target.value) })}
                  placeholder="Max Bookings"
                  min="1"
                  required
                  style={inputStyle}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#007bff"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "#e0e0e0"}
                />
              </div>
              <button 
                type="submit" 
                style={primaryButton}
                onMouseOver={handleButtonHoverWithColor("#0056b3", "#007bff")}
                onMouseOut={handleButtonHoverOutWithColor("#007bff")}
              >
                ➕ Create Slot
              </button>
            </form>
          </div>

          <h3 style={{ marginBottom: "20px", color: "#333" }}>📅 My Slots</h3>
          {slots.length === 0 ? (
            <div style={{ 
              textAlign: "center", 
              padding: "60px 20px",
              background: "#f8f9fa",
              borderRadius: "12px",
              color: "#666"
            }}>
              <p style={{ fontSize: "18px", marginBottom: "10px" }}>📅 No slots created yet</p>
              <p>Create your first slot above to get started!</p>
            </div>
          ) : (
            <div>
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  style={{
                    padding: "20px",
                    marginBottom: "15px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "white",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                  }}
                >
                  <div>
                    <p style={{ margin: "5px 0", fontSize: "18px", fontWeight: "600" }}>
                      📅 {new Date(slot.slot_date).toLocaleDateString()}
                    </p>
                    <p style={{ margin: "5px 0", fontSize: "16px" }}>
                      ⏰ {slot.start_time} - {slot.end_time}
                    </p>
                    <p style={{ margin: "5px 0", fontSize: "14px", color: "#666" }}>
                      👥 {slot.current_bookings}/{slot.max_bookings} booked
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteSlot(slot.id)}
                    disabled={slot.current_bookings > 0}
                    style={{
                      ...dangerButton,
                      background: slot.current_bookings > 0 ? "#6c757d" : "#dc3545",
                      cursor: slot.current_bookings > 0 ? "not-allowed" : "pointer",
                      opacity: slot.current_bookings > 0 ? 0.6 : 1
                    }}
                    onMouseOver={handleDeleteButtonHover(slot.current_bookings === 0)}
                    onMouseOut={handleDeleteButtonHoverOut(slot.current_bookings === 0)}
                  >
                    ❌ Delete
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
          <h3 style={{ marginBottom: "20px", color: "#333" }}>📋 Patient Appointments</h3>
          {appointments.length === 0 ? (
            <div style={{ 
              textAlign: "center", 
              padding: "60px 20px",
              background: "#f8f9fa",
              borderRadius: "12px",
              color: "#666"
            }}>
              <p style={{ fontSize: "18px", marginBottom: "10px" }}>📋 No appointments yet</p>
              <p>Patients will appear here when they book your slots.</p>
            </div>
          ) : (
            <div>
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  style={{
                    padding: "20px",
                    marginBottom: "15px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "12px",
                    background: "white",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                  }}
                >
                  <h4 style={{ margin: "0 0 12px 0", color: "#007bff", fontSize: "20px" }}>
                    👤 {apt.patient_name}
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", marginBottom: "12px" }}>
                    <p style={{ margin: "5px 0" }}><strong>📅 Date:</strong> {new Date(apt.appointment_date).toLocaleDateString()}</p>
                    <p style={{ margin: "5px 0" }}><strong>⏰ Time:</strong> {apt.start_time} - {apt.end_time}</p>
                    <p style={{ margin: "5px 0" }}><strong>💬 Reason:</strong> {apt.reason}</p>
                  </div>
                  <p style={{ margin: "5px 0 15px 0" }}>
                    <strong>Status:</strong>{" "}
                    <span
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        fontSize: "14px",
                        fontWeight: "600",
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
                      {apt.status.toUpperCase()}
                    </span>
                  </p>
                  {apt.status === "pending" && (
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      <button
                        onClick={() => handleUpdateStatus(apt.id, "approved")}
                        style={successButton}
                        onMouseOver={handleButtonHoverWithColor("#218838", "#28a745")}
                        onMouseOut={handleButtonHoverOutWithColor("#28a745")}
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(apt.id, "cancelled")}
                        style={dangerButton}
                        onMouseOver={handleButtonHoverWithColor("#c82333", "#dc3545")}
                        onMouseOut={handleButtonHoverOutWithColor("#dc3545")}
                      >
                        ❌ Reject
                      </button>
                    </div>
                  )}
                  {apt.status === "approved" && (
                    <div>
                      <button
                        onClick={() => handleUpdateStatus(apt.id, "completed")}
                        style={{
                          ...buttonStyle,
                          background: "#17a2b8",
                          color: "white"
                        }}
                        onMouseOver={handleButtonHoverWithColor("#138496", "#17a2b8")}
                        onMouseOut={handleButtonHoverOutWithColor("#17a2b8")}
                      >
                        ✅ Mark Completed
                      </button>
                    </div>
                  )}
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

export default DoctorDashboard;
