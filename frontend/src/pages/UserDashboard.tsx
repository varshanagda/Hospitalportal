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
  const [loading, setLoading] = useState(true);
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
      setMessage("");
      
      const searchTerm = searchSpecialization.trim();
      const res = await getAllDoctors(searchTerm, true);
      console.log("Doctors loaded:", res.doctors);
      
      const doctorsList = res.doctors || [];
      setDoctors(doctorsList);
      
      if (searchTerm && doctorsList.length === 0) {
        setMessage(`No doctors found for "${searchTerm}". Try a different specialization or clear search to see all doctors.`);
      } else if (!searchTerm && doctorsList.length > 0) {
        setMessage(`Found ${doctorsList.length} available doctor${doctorsList.length > 1 ? 's' : ''}!`);
      } else if (searchTerm && doctorsList.length > 0) {
        setMessage(`Found ${doctorsList.length} doctor${doctorsList.length > 1 ? 's' : ''} in ${searchTerm}!`);
      }
    } catch (err: any) {
      console.error("Error loading doctors:", err);
      setError(err.response?.data?.message || "Failed to load doctors. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadSlots = async () => {
    if (!selectedDoctorId) return;
    
    try {
      const res = await getAvailableSlots(selectedDoctorId, selectedDate);
      setAvailableSlots(res.slots);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load slots");
    }
  };

  const loadAppointments = async () => {
    try {
      const res = await getUserAppointments();
      setAppointments(res.appointments);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load appointments");
    }
  };

  const handleSearchDoctors = () => {
    setError("");
    setMessage("");
    loadDoctors();
  };

  const handleSelectDoctor = (doctorId: number) => {
    setSelectedDoctorId(doctorId);
    setAvailableSlots([]);
  };

  const handleSearchSlots = () => {
    loadSlots();
  };

  const handleBookSlot = async (slotId: number) => {
    const reason = prompt("Enter reason for appointment:");
    if (!reason) return;

    try {
      await bookAppointment({ slot_id: slotId, reason });
      setMessage("Appointment booked successfully! Awaiting admin approval.");
      setAvailableSlots([]);
      setSelectedDoctorId(null);
      loadAppointments();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to book appointment");
    }
  };

  const handleCancelAppointment = async (id: number) => {
    const reason = prompt("Enter cancellation reason:");
    if (!reason) return;

    try {
      await cancelAppointment(id, reason);
      setMessage("Appointment cancelled successfully!");
      loadAppointments();
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

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", paddingBottom: "40px" }}>
      {/* Header */}
      <div style={{ background: "rgba(255,255,255,0.95)", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", padding: "20px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: "0 0 5px 0", color: "#333", fontSize: "28px" }}>🏥 Patient Portal</h1>
            <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>Welcome, {user?.full_name || user?.email}!</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{
              padding: "10px 20px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "25px",
              boxShadow: "0 2px 10px rgba(102,126,234,0.3)"
            }}>
              <span style={{ color: "white", fontSize: "14px", fontWeight: "600" }}>
                👤 {user?.full_name || user?.email?.split('@')[0]}
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
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: "1200px", margin: "30px auto", padding: "0 20px" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "30px" }}>
          <button
            onClick={() => setActiveTab("book")}
            style={{
              padding: "15px 30px",
              background: activeTab === "book" ? "white" : "rgba(255,255,255,0.3)",
              color: activeTab === "book" ? "#667eea" : "white",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "600",
              boxShadow: activeTab === "book" ? "0 4px 15px rgba(0,0,0,0.1)" : "none",
              transition: "all 0.3s"
            }}
          >
            📅 Book Appointment
          </button>
          <button
            onClick={() => setActiveTab("appointments")}
            style={{
              padding: "15px 30px",
              background: activeTab === "appointments" ? "white" : "rgba(255,255,255,0.3)",
              color: activeTab === "appointments" ? "#667eea" : "white",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "600",
              boxShadow: activeTab === "appointments" ? "0 4px 15px rgba(0,0,0,0.1)" : "none",
              transition: "all 0.3s"
            }}
          >
            📋 My Appointments
          </button>
        </div>

        {/* Alerts */}
        {message && (
          <div style={{ 
            padding: "15px 20px", 
            background: "#d4edda", 
            color: "#155724", 
            marginBottom: "20px", 
            borderRadius: "10px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            border: "1px solid #c3e6cb"
          }}>
            ✅ {message}
          </div>
        )}
        {error && (
          <div style={{ 
            padding: "15px 20px", 
            background: "#f8d7da", 
            color: "#721c24", 
            marginBottom: "20px", 
            borderRadius: "10px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            border: "1px solid #f5c6cb"
          }}>
            ❌ {error}
          </div>
        )}

        {activeTab === "book" && (
          <div style={{ background: "white", borderRadius: "15px", padding: "30px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
            <h2 style={{ margin: "0 0 25px 0", color: "#333", fontSize: "24px" }}>🔍 Find Your Doctor</h2>
            
            {/* Search Section - Large & Prominent */}
            <div style={{ marginBottom: "40px" }}>
              <div style={{ 
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
                padding: "40px 35px", 
                borderRadius: "20px",
                marginBottom: "30px",
                boxShadow: "0 10px 30px rgba(102,126,234,0.3)"
              }}>
                <div style={{ textAlign: "center", marginBottom: "25px" }}>
                  <h2 style={{ margin: "0 0 10px 0", color: "white", fontSize: "28px", fontWeight: "700" }}>
                    🔍 Find Your Doctor
                  </h2>
                  <p style={{ margin: 0, color: "rgba(255,255,255,0.9)", fontSize: "16px" }}>
                    Search by specialization or browse all available doctors
                  </p>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <input
                      placeholder="Type specialization (e.g., Cardiology, Dermatology) or leave blank for all"
                      value={searchSpecialization}
                      onChange={(e) => setSearchSpecialization(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSearchDoctors();
                        }
                      }}
                      style={{ 
                        padding: "20px 25px", 
                        flex: 1,
                        border: "3px solid transparent",
                        borderRadius: "15px",
                        fontSize: "18px",
                        fontWeight: "500",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
                        outline: "none",
                        transition: "all 0.3s"
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#764ba2";
                        e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.2)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "transparent";
                        e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.15)";
                      }}
                    />
                  </div>
                  
                  <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                    <button 
                      onClick={handleSearchDoctors} 
                      disabled={loading}
                      style={{ 
                        padding: "16px 40px",
                        background: loading ? "#ccc" : "white",
                        color: loading ? "#666" : "#667eea",
                        border: "none",
                        borderRadius: "12px",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontSize: "18px",
                        fontWeight: "700",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
                        transition: "all 0.3s",
                        minWidth: "180px"
                      }}
                      onMouseOver={(e) => {
                        if (!loading) {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.2)";
                        }
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.15)";
                      }}
                    >
                      {loading ? "⏳ Searching..." : "🔍 Search Doctors"}
                    </button>
                    
                    {searchSpecialization && (
                      <button 
                        onClick={() => {
                          setSearchSpecialization("");
                          loadDoctors();
                        }}
                        style={{ 
                          padding: "16px 40px",
                          background: "rgba(255,255,255,0.2)",
                          color: "white",
                          border: "3px solid white",
                          borderRadius: "12px",
                          cursor: "pointer",
                          fontSize: "18px",
                          fontWeight: "700",
                          transition: "all 0.3s",
                          minWidth: "180px"
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = "white";
                          e.currentTarget.style.color = "#667eea";
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = "rgba(255,255,255,0.2)";
                          e.currentTarget.style.color = "white";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        ✕ Clear & Show All
                      </button>
                    )}
                  </div>
                </div>
                
                <div style={{ 
                  marginTop: "20px", 
                  padding: "15px 20px",
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: "10px",
                  textAlign: "center"
                }}>
                  <p style={{ margin: 0, color: "white", fontSize: "14px", fontWeight: "500" }}>
                    💡 <strong>Quick Tip:</strong> Press Enter to search or leave empty to see all {doctors.length} available doctors
                  </p>
                </div>
              </div>

              {/* Doctor Cards */}
              {loading ? (
                <div style={{ textAlign: "center", padding: "60px", color: "#667eea" }}>
                  <div style={{ 
                    width: "60px", 
                    height: "60px", 
                    border: "4px solid #e0e0e0", 
                    borderTop: "4px solid #667eea",
                    borderRadius: "50%",
                    margin: "0 auto 20px",
                    animation: "spin 1s linear infinite"
                  }}></div>
                  <p style={{ fontSize: "16px", fontWeight: "600" }}>Loading doctors...</p>
                  <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
              ) : doctors.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                  <p style={{ fontSize: "18px", marginBottom: "10px" }}>👨‍⚕️ No doctors found</p>
                  <p style={{ fontSize: "14px" }}>Try searching with a different specialization or check back later</p>
                  <button
                    onClick={() => {
                      setSearchSpecialization("");
                      loadDoctors();
                    }}
                    style={{
                      marginTop: "15px",
                      padding: "10px 20px",
                      background: "#667eea",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "600"
                    }}
                  >
                    Show All Doctors
                  </button>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
                  {doctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      style={{
                        padding: "20px",
                        border: selectedDoctorId === doctor.id ? "3px solid #667eea" : "1px solid #e0e0e0",
                        borderRadius: "15px",
                        cursor: "pointer",
                        background: selectedDoctorId === doctor.id ? "linear-gradient(135deg, #f5f7ff 0%, #ede9fe 100%)" : "white",
                        boxShadow: selectedDoctorId === doctor.id ? "0 8px 25px rgba(102,126,234,0.3)" : "0 2px 10px rgba(0,0,0,0.05)",
                        transition: "all 0.3s",
                        transform: selectedDoctorId === doctor.id ? "translateY(-5px)" : "translateY(0)"
                      }}
                      onClick={() => handleSelectDoctor(doctor.id)}
                      onMouseOver={(e) => {
                        if (selectedDoctorId !== doctor.id) {
                          e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.1)";
                          e.currentTarget.style.transform = "translateY(-3px)";
                        }
                      }}
                      onMouseOut={(e) => {
                        if (selectedDoctorId !== doctor.id) {
                          e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.05)";
                          e.currentTarget.style.transform = "translateY(0)";
                        }
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "15px" }}>
                        <div>
                          <h4 style={{ margin: "0 0 5px 0", color: "#333", fontSize: "20px" }}>👨‍⚕️ Dr. {doctor.full_name}</h4>
                          <p style={{ margin: 0, color: "#667eea", fontWeight: "600", fontSize: "14px" }}>{doctor.specialization}</p>
                        </div>
                        {selectedDoctorId === doctor.id && (
                          <span style={{ 
                            background: "#667eea", 
                            color: "white", 
                            padding: "5px 10px", 
                            borderRadius: "20px", 
                            fontSize: "12px",
                            fontWeight: "600"
                          }}>
                            ✓ Selected
                          </span>
                        )}
                      </div>
                      
                      <div style={{ borderTop: "1px solid #e0e0e0", paddingTop: "15px" }}>
                        {doctor.qualification && (
                          <p style={{ margin: "8px 0", fontSize: "14px", color: "#555" }}>
                            <strong>🎓 Qualification:</strong> {doctor.qualification}
                          </p>
                        )}
                        {doctor.experience_years && (
                          <p style={{ margin: "8px 0", fontSize: "14px", color: "#555" }}>
                            <strong>⏱️ Experience:</strong> {doctor.experience_years} years
                          </p>
                        )}
                        {doctor.consultation_fee && (
                          <p style={{ margin: "8px 0", fontSize: "14px", color: "#28a745", fontWeight: "600" }}>
                            <strong>💵 Fee:</strong> ${doctor.consultation_fee}
                          </p>
                        )}
                        {doctor.bio && (
                          <p style={{ margin: "12px 0 0 0", fontSize: "13px", color: "#777", lineHeight: "1.6" }}>
                            {doctor.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Slot Selection */}
            {selectedDoctorId && (
              <div style={{ 
                marginTop: "30px", 
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
                padding: "25px", 
                borderRadius: "12px"
              }}>
                <h3 style={{ margin: "0 0 15px 0", color: "white", fontSize: "18px" }}>Step 2: Select Date & Book a Slot</h3>
                <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    style={{ 
                      padding: "15px 20px", 
                      flex: 1,
                      border: "none",
                      borderRadius: "10px",
                      fontSize: "16px",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
                    }}
                  />
                  <button 
                    onClick={handleSearchSlots} 
                    style={{ 
                      padding: "15px 30px",
                      background: "white",
                      color: "#667eea",
                      border: "none",
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontSize: "16px",
                      fontWeight: "600",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                      transition: "all 0.3s"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                    onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                  >
                    Find Slots
                  </button>
                </div>

                {availableSlots.length > 0 ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "15px" }}>
                    {availableSlots.map((slot) => (
                      <div
                        key={slot.id}
                        style={{
                          padding: "20px",
                          background: "white",
                          borderRadius: "12px",
                          boxShadow: "0 2px 15px rgba(0,0,0,0.1)",
                          transition: "all 0.3s"
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = "translateY(-5px)";
                          e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.15)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 2px 15px rgba(0,0,0,0.1)";
                        }}
                      >
                        <p style={{ margin: "0 0 10px 0", fontWeight: "600", fontSize: "16px", color: "#333" }}>
                          📅 {new Date(slot.slot_date).toLocaleDateString()}
                        </p>
                        <p style={{ margin: "0 0 10px 0", fontSize: "15px", color: "#555" }}>
                          🕐 {slot.start_time} - {slot.end_time}
                        </p>
                        <p style={{ margin: "0 0 15px 0", fontSize: "13px", color: "#28a745", fontWeight: "600" }}>
                          ✓ {slot.max_bookings - slot.current_bookings} spot(s) available
                        </p>
                        <button
                          onClick={() => handleBookSlot(slot.id)}
                          style={{
                            padding: "12px 20px",
                            background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            width: "100%",
                            fontSize: "15px",
                            fontWeight: "600",
                            boxShadow: "0 2px 10px rgba(40,167,69,0.3)",
                            transition: "all 0.3s"
                          }}
                          onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                          onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                        >
                          Book Now
                        </button>
                      </div>
                    ))}
                  </div>
                ) : selectedDate ? (
                  <div style={{ 
                    background: "white", 
                    padding: "30px", 
                    borderRadius: "12px", 
                    textAlign: "center",
                    color: "#666"
                  }}>
                    <p style={{ fontSize: "18px", margin: "0 0 10px 0" }}>😔 No available slots</p>
                    <p style={{ fontSize: "14px", margin: 0 }}>Try selecting a different date</p>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        )}

        {activeTab === "appointments" && (
          <div style={{ background: "white", borderRadius: "15px", padding: "30px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
            <h2 style={{ margin: "0 0 25px 0", color: "#333", fontSize: "24px" }}>📋 My Appointments</h2>
            
            {appointments.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#666" }}>
                <p style={{ fontSize: "48px", margin: "0 0 20px 0" }}>📅</p>
                <p style={{ fontSize: "18px", marginBottom: "10px", fontWeight: "600" }}>No appointments yet</p>
                <p style={{ fontSize: "14px", margin: 0 }}>Book your first appointment to get started</p>
                <button
                  onClick={() => setActiveTab("book")}
                  style={{
                    marginTop: "20px",
                    padding: "12px 30px",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "600",
                    boxShadow: "0 4px 15px rgba(102,126,234,0.3)"
                  }}
                >
                  Book Appointment
                </button>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 10px" }}>
                  <thead>
                    <tr>
                      <th style={{ padding: "15px", textAlign: "left", color: "#667eea", fontWeight: "600", fontSize: "14px" }}>DOCTOR</th>
                      <th style={{ padding: "15px", textAlign: "left", color: "#667eea", fontWeight: "600", fontSize: "14px" }}>SPECIALIZATION</th>
                      <th style={{ padding: "15px", textAlign: "left", color: "#667eea", fontWeight: "600", fontSize: "14px" }}>DATE</th>
                      <th style={{ padding: "15px", textAlign: "left", color: "#667eea", fontWeight: "600", fontSize: "14px" }}>TIME</th>
                      <th style={{ padding: "15px", textAlign: "left", color: "#667eea", fontWeight: "600", fontSize: "14px" }}>STATUS</th>
                      <th style={{ padding: "15px", textAlign: "center", color: "#667eea", fontWeight: "600", fontSize: "14px" }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((apt) => (
                      <tr key={apt.id} style={{ background: "#f8f9fa", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
                        <td style={{ padding: "15px", borderRadius: "10px 0 0 10px", fontWeight: "600", color: "#333" }}>
                          👨‍⚕️ Dr. {apt.doctor_name}
                        </td>
                        <td style={{ padding: "15px", color: "#555" }}>{apt.specialization}</td>
                        <td style={{ padding: "15px", color: "#555" }}>
                          {new Date(apt.appointment_date).toLocaleDateString()}
                        </td>
                        <td style={{ padding: "15px", color: "#555" }}>
                          {apt.start_time} - {apt.end_time}
                        </td>
                        <td style={{ padding: "15px" }}>
                          <span
                            style={{
                              padding: "6px 12px",
                              borderRadius: "20px",
                              fontSize: "13px",
                              fontWeight: "600",
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
                            {apt.status === "approved" && "✓ "}
                            {apt.status === "pending" && "⏱️ "}
                            {apt.status === "completed" && "✓ "}
                            {apt.status === "cancelled" && "✗ "}
                            {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                          </span>
                        </td>
                        <td style={{ padding: "15px", borderRadius: "0 10px 10px 0", textAlign: "center" }}>
                          {apt.status !== "cancelled" && apt.status !== "completed" ? (
                            <button
                              onClick={() => handleCancelAppointment(apt.id)}
                              style={{
                                padding: "8px 16px",
                                background: "#dc3545",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "600",
                                boxShadow: "0 2px 8px rgba(220,53,69,0.3)",
                                transition: "all 0.3s"
                              }}
                              onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                              onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                            >
                              Cancel
                            </button>
                          ) : (
                            <span style={{ color: "#999", fontSize: "14px" }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
