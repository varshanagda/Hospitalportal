import { useState, useEffect } from "react";
import { getCurrentUser } from "../services/authService";
import { getAllDoctors, type Doctor } from "../services/doctorService";
import { getAvailableSlots, type Slot } from "../services/slotService";
import { getUserAppointments, bookAppointment, cancelAppointment, type Appointment } from "../services/appointmentService";
import Popup from "../components/Popup";
import { useLogoutHandler } from "../hooks/useLogout";
import { DashboardMessage } from "../components/shared/DashboardMessage";
import { StatusBadge } from "../components/shared/StatusBadge";

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
  const [popup, setPopup] = useState<{
    isOpen: boolean;
    type: "alert" | "confirm" | "prompt";
    title: string;
    message?: string;
    inputPlaceholder?: string;
    onConfirm?: () => void;
    inputValue?: string;
  }>({
    isOpen: false,
    type: "alert",
    title: ""
  });
  const [promptInput, setPromptInput] = useState("");
  const user = getCurrentUser();
  const handleLogout = useLogoutHandler(setPopup);

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

  const handleBookSlot = (slotId: number) => {
    setPromptInput("");
    setPopup({
      isOpen: true,
      type: "prompt",
      title: "Book Appointment",
      message: "Enter reason for appointment:",
      inputPlaceholder: "e.g., Regular checkup, Consultation...",
      onConfirm: async (inputValue?: string) => {
        const reason = inputValue || promptInput;
        if (!reason || !reason.trim()) return;
        try {
          await bookAppointment({ slot_id: slotId, reason: reason.trim() });
          setMessage("Appointment booked successfully!");
          setAvailableSlots([]);
          setSelectedDoctorId(null);
          loadAppointments();
          setPopup({ ...popup, isOpen: false });
        } catch (_err: any) {
          setError("Failed to book appointment");
          setPopup({ ...popup, isOpen: false });
        }
      }
    });
  };

  const handleCancelAppointment = (id: number) => {
    setPopup({
      isOpen: true,
      type: "confirm",
      title: "Cancel Appointment",
      message: "Are you sure you want to cancel this appointment?",
      onConfirm: () => {
        setPromptInput("");
        setPopup({
          isOpen: true,
          type: "prompt",
          title: "Cancellation Reason",
          message: "Please enter the reason for cancellation:",
          inputPlaceholder: "Enter cancellation reason...",
          onConfirm: async (inputValue?: string) => {
            const reason = inputValue || promptInput;
            if (!reason || !reason.trim()) return;
            try {
              await cancelAppointment(id, reason.trim());
              setMessage("Appointment cancelled");
              loadAppointments();
              setPopup({ ...popup, isOpen: false });
            } catch (_err: any) {
              setError("Failed to cancel appointment");
              setPopup({ ...popup, isOpen: false });
            }
          }
        });
      }
    });
  };

  // Reusable mouse event handlers to reduce duplication
  const handleTabHover = (tabName: "book" | "appointments") => (e: React.MouseEvent<HTMLButtonElement>) => {
    if (activeTab !== tabName) {
      e.currentTarget.style.background = "#f8f9fa";
      e.currentTarget.style.color = "#333";
    }
  };

  const handleTabHoverOut = (tabName: "book" | "appointments") => (e: React.MouseEvent<HTMLButtonElement>) => {
    if (activeTab !== tabName) {
      e.currentTarget.style.background = "transparent";
      e.currentTarget.style.color = "#666";
    }
  };

  const handleButtonHoverWithLoading = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!loading) {
      e.currentTarget.style.transform = "translateY(-2px)";
      e.currentTarget.style.boxShadow = "0 6px 16px rgba(102, 126, 234, 0.4)";
    }
  };

  const handleButtonHoverOutWithLoading = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!loading) {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.3)";
    }
  };

  const handleButtonHoverWithColor = (hoverColor: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = hoverColor;
    e.currentTarget.style.transform = "translateY(-2px)";
  };

  const handleButtonHoverOutWithColor = (defaultColor: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = defaultColor;
    e.currentTarget.style.transform = "translateY(0)";
  };

  const handleButtonHoverGeneric = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = "translateY(-2px)";
    e.currentTarget.style.boxShadow = "0 6px 16px rgba(102, 126, 234, 0.4)";
  };

  const handleButtonHoverOutGeneric = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.3)";
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
    <div style={{ 
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      padding: "20px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "30px",
          padding: "24px 30px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "16px",
          color: "white",
          boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)"
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "32px", fontWeight: "700" }}>🏥 Patient Dashboard</h1>
            <p style={{ margin: "10px 0 0 0", opacity: 0.95, fontSize: "16px" }}>
              Welcome back, <strong>{user?.full_name || user?.email}</strong>
            </p>
          </div>
          <button 
            onClick={handleLogout} 
            title="Logout"
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
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.4)";
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.25)";
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
            }}
          >
            Logout
          </button>
        </div>

      {/* Tabs */}
      <div style={{ 
        marginBottom: "30px", 
        background: "white",
        borderRadius: "16px",
        padding: "8px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        display: "flex",
        gap: "8px"
      }}>
        <button
          onClick={() => setActiveTab("book")}
          style={{
            flex: 1,
            padding: "10px 14px",
            border: "none",
            background: activeTab === "book" 
              ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
              : "transparent",
            cursor: "pointer",
            borderRadius: "12px",
            fontWeight: activeTab === "book" ? "700" : "500",
            color: activeTab === "book" ? "white" : "#666",
            fontSize: "16px",
            transition: "all 0.3s ease",
            boxShadow: activeTab === "book" ? "0 4px 12px rgba(102, 126, 234, 0.3)" : "none"
          }}
          onMouseOver={handleTabHover("book")}
          onMouseOut={handleTabHoverOut("book")}
        >
          📅 Book Appointment
        </button>
        <button
          onClick={() => setActiveTab("appointments")}
          style={{
            flex: 1,
            padding: "16px 24px",
            border: "none",
            background: activeTab === "appointments" 
              ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
              : "transparent",
            cursor: "pointer",
            borderRadius: "12px",
            fontWeight: activeTab === "appointments" ? "700" : "500",
            color: activeTab === "appointments" ? "white" : "#666",
            fontSize: "16px",
            transition: "all 0.3s ease",
            boxShadow: activeTab === "appointments" ? "0 4px 12px rgba(102, 126, 234, 0.3)" : "none"
          }}
          onMouseOver={handleTabHover("appointments")}
          onMouseOut={handleTabHoverOut("appointments")}
        >
          📋 My Appointments
        </button>
      </div>

      {/* Messages */}
      <DashboardMessage message={message} error={error} variant="detailed" />

      {/* Book Appointment Tab */}
      {activeTab === "book" && (
        <div style={{ background: "transparent" }}>
          {/* Search Section */}
          <div style={{ 
            marginBottom: "30px",
            padding: "30px",
            background: "white",
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
          }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px", 
              marginBottom: "24px" 
            }}>
              <div style={{ 
                width: "48px", 
                height: "48px", 
                borderRadius: "12px", 
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px"
              }}>
                🔍
              </div>
              <div>
                <h3 style={{ margin: 0, color: "#333", fontSize: "24px", fontWeight: "700" }}>
                  Search for Doctors
                </h3>
                <p style={{ margin: "4px 0 0 0", color: "#666", fontSize: "14px" }}>
                  Find doctors by specialization
                </p>
              </div>
            </div>
            
            <div style={{ 
              display: "flex", 
              gap: "12px", 
              marginBottom: "20px",
              flexWrap: "wrap"
            }}>
              <div style={{ 
                flex: 1, 
                minWidth: "300px",
                position: "relative"
              }}>
                <input
                  placeholder="🔎 Search by specialization (e.g., Cardiology, General Medicine, Pediatrics)"
                  value={searchSpecialization}
                  onChange={(e) => setSearchSpecialization(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchDoctors()}
                  style={{
                    ...inputStyle,
                    paddingLeft: "48px",
                    fontSize: "16px",
                    height: "52px",
                    border: "2px solid #e0e0e0",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#667eea";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.2)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e0e0e0";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
                  }}
                />
                <span style={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "20px"
                }}>🔎</span>
              </div>
              <button 
                onClick={handleSearchDoctors} 
                disabled={loading}
                style={{
                  ...primaryButton,
                  minWidth: "140px",
                  height: "52px",
                  fontSize: "16px",
                  fontWeight: "600",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
                onMouseOver={handleButtonHoverWithLoading}
                onMouseOut={handleButtonHoverOutWithLoading}
              >
                {loading ? (
                  <>
                    <span>⏳</span> Searching...
                  </>
                ) : (
                  <>
                    <span>🔍</span> Search
                  </>
                )}
              </button>
              {searchSpecialization && (
                <button 
                  onClick={() => { setSearchSpecialization(""); loadDoctors(); }} 
                  style={{
                    ...buttonStyle,
                    background: "#6c757d",
                    color: "white",
                    height: "52px",
                    minWidth: "100px",
                    fontSize: "16px",
                    fontWeight: "600"
                  }}
                  onMouseOver={handleButtonHoverWithColor("#5a6268")}
                  onMouseOut={handleButtonHoverOutWithColor("#6c757d")}
                >
                  ✕ Clear
                </button>
              )}
            </div>

            {/* Doctors List */}
            {loading ? (
              <div style={{ 
                textAlign: "center", 
                padding: "60px 40px", 
                color: "#666",
                background: "#f8f9fa",
                borderRadius: "12px"
              }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
                <p style={{ fontSize: "18px", fontWeight: "600" }}>Loading doctors...</p>
                <p style={{ fontSize: "14px", marginTop: "8px", opacity: 0.7 }}>Please wait</p>
              </div>
            ) : doctors.length === 0 ? (
              <div style={{ 
                textAlign: "center", 
                padding: "60px 40px", 
                color: "#666",
                background: "#f8f9fa",
                borderRadius: "12px"
              }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>👨‍⚕️</div>
                <p style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>
                  No doctors found
                </p>
                <p style={{ fontSize: "14px", opacity: 0.7 }}>
                  Try a different search term or clear the search to see all doctors
                </p>
              </div>
            ) : (
              <div>
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "12px",
                  marginBottom: "20px",
                  padding: "16px",
                  background: "linear-gradient(135deg, #e7f3ff 0%, #d1ecf1 100%)",
                  borderRadius: "12px"
                }}>
                  <span style={{ fontSize: "24px" }}>📋</span>
                  <p style={{ margin: 0, fontWeight: "700", color: "#333", fontSize: "18px" }}>
                    {doctors.length} {doctors.length === 1 ? 'Doctor' : 'Doctors'} Found
                  </p>
                </div>
                <div style={{ display: "grid", gap: "16px" }}>
                  {doctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      onClick={() => setSelectedDoctorId(doctor.id)}
                      style={{
                        padding: "24px",
                        border: selectedDoctorId === doctor.id 
                          ? "3px solid #667eea" 
                          : "2px solid #e0e0e0",
                        borderRadius: "16px",
                        cursor: "pointer",
                        background: selectedDoctorId === doctor.id 
                          ? "linear-gradient(135deg, #e7f3ff 0%, #f0f8ff 100%)" 
                          : "white",
                        transition: "all 0.3s ease",
                        boxShadow: selectedDoctorId === doctor.id 
                          ? "0 8px 24px rgba(102, 126, 234, 0.25)" 
                          : "0 2px 8px rgba(0,0,0,0.08)"
                      }}
                      onMouseOver={(e) => {
                        if (selectedDoctorId !== doctor.id) {
                          e.currentTarget.style.borderColor = "#667eea";
                          e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.12)";
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }
                      }}
                      onMouseOut={(e) => {
                        if (selectedDoctorId !== doctor.id) {
                          e.currentTarget.style.borderColor = "#e0e0e0";
                          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
                          e.currentTarget.style.transform = "translateY(0)";
                        }
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "start", gap: "16px" }}>
                        <div style={{
                          width: "64px",
                          height: "64px",
                          borderRadius: "16px",
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "32px",
                          flexShrink: 0
                        }}>
                          👨‍⚕️
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ 
                            margin: "0 0 12px 0", 
                            color: "#667eea", 
                            fontSize: "22px",
                            fontWeight: "700"
                          }}>
                            Dr. {doctor.full_name}
                          </h4>
                          <div style={{ 
                            display: "grid", 
                            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
                            gap: "12px" 
                          }}>
                            <div style={{ 
                              padding: "8px 12px",
                              background: "#f8f9fa",
                              borderRadius: "8px"
                            }}>
                              <strong style={{ color: "#666", fontSize: "12px" }}>SPECIALIZATION</strong>
                              <p style={{ margin: "4px 0 0 0", color: "#333", fontWeight: "600" }}>
                                {doctor.specialization}
                              </p>
                            </div>
                            {doctor.qualification && (
                              <div style={{ 
                                padding: "8px 12px",
                                background: "#f8f9fa",
                                borderRadius: "8px"
                              }}>
                                <strong style={{ color: "#666", fontSize: "12px" }}>QUALIFICATION</strong>
                                <p style={{ margin: "4px 0 0 0", color: "#333", fontWeight: "600" }}>
                                  {doctor.qualification}
                                </p>
                              </div>
                            )}
                            {doctor.experience_years && (
                              <div style={{ 
                                padding: "8px 12px",
                                background: "#f8f9fa",
                                borderRadius: "8px"
                              }}>
                                <strong style={{ color: "#666", fontSize: "12px" }}>EXPERIENCE</strong>
                                <p style={{ margin: "4px 0 0 0", color: "#333", fontWeight: "600" }}>
                                  {doctor.experience_years} years
                                </p>
                              </div>
                            )}
                            {doctor.consultation_fee && (
                              <div style={{ 
                                padding: "8px 12px",
                                background: "linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)",
                                borderRadius: "8px"
                              }}>
                                <strong style={{ color: "#155724", fontSize: "12px" }}>CONSULTATION FEE</strong>
                                <p style={{ margin: "4px 0 0 0", color: "#155724", fontWeight: "700", fontSize: "18px" }}>
                                  ${doctor.consultation_fee}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        {selectedDoctorId === doctor.id && (
                          <div style={{
                            padding: "8px 16px",
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            color: "white",
                            borderRadius: "8px",
                            fontWeight: "700",
                            fontSize: "14px"
                          }}>
                            ✓ Selected
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Slots Section */}
          {selectedDoctorId && (
            <div style={{
              padding: "30px",
              background: "white",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              marginTop: "24px"
            }}>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "12px", 
                marginBottom: "24px" 
              }}>
                <div style={{ 
                  width: "48px", 
                  height: "48px", 
                  borderRadius: "12px", 
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px"
                }}>
                  📅
                </div>
                <div>
                  <h3 style={{ margin: 0, color: "#333", fontSize: "24px", fontWeight: "700" }}>
                    Select Date & Time
                  </h3>
                  <p style={{ margin: "4px 0 0 0", color: "#666", fontSize: "14px" }}>
                    Choose your preferred appointment date
                  </p>
                </div>
              </div>
              <div style={{ 
                display: "flex", 
                gap: "12px", 
                marginBottom: "20px", 
                flexWrap: "wrap",
                alignItems: "center"
              }}>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  style={{
                    ...inputStyle,
                    flex: "1",
                    minWidth: "250px",
                    height: "52px",
                    fontSize: "16px",
                    border: "2px solid #e0e0e0",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#667eea";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.2)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e0e0e0";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
                  }}
                />
                <button 
                  onClick={loadSlots} 
                  style={{
                    ...primaryButton,
                    minWidth: "160px",
                    height: "52px",
                    fontSize: "16px",
                    fontWeight: "600",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                  onMouseOver={handleButtonHoverGeneric}
                  onMouseOut={handleButtonHoverOutGeneric}
                >
                  🔍 Find Slots
                </button>
              </div>

              {availableSlots.length > 0 ? (
                <div>
                  <p style={{ marginBottom: "15px", fontWeight: "600", color: "#333" }}>
                    ✅ {availableSlots.length} slot(s) available
                  </p>
                  {availableSlots.map((slot) => (
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
                          👥 {slot.max_bookings - slot.current_bookings} spot(s) left
                        </p>
                      </div>
                      <button
                        onClick={() => handleBookSlot(slot.id)}
                        style={{
                          ...successButton,
                          minWidth: "120px"
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = "#218838"}
                        onMouseOut={(e) => e.currentTarget.style.background = "#28a745"}
                      >
                        ✅ Book Now
                      </button>
                    </div>
                  ))}
                </div>
              ) : selectedDate ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                  <p>❌ No slots available for this date</p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}

      {/* Appointments Tab */}
      {activeTab === "appointments" && (
        <div style={{
          padding: "30px",
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
        }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "12px", 
            marginBottom: "24px" 
          }}>
            <div style={{ 
              width: "48px", 
              height: "48px", 
              borderRadius: "12px", 
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px"
            }}>
              📋
            </div>
            <div>
              <h3 style={{ margin: 0, color: "#333", fontSize: "24px", fontWeight: "700" }}>
                My Appointments
              </h3>
              <p style={{ margin: "4px 0 0 0", color: "#666", fontSize: "14px" }}>
                View and manage your appointments
              </p>
            </div>
          </div>
          {appointments.length === 0 ? (
            <div style={{ 
              textAlign: "center", 
              padding: "80px 20px",
              background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
              borderRadius: "16px",
              color: "#666"
            }}>
              <div style={{ fontSize: "64px", marginBottom: "20px" }}>📅</div>
              <p style={{ fontSize: "20px", fontWeight: "700", marginBottom: "12px", color: "#333" }}>
                No appointments yet
              </p>
              <p style={{ fontSize: "16px", opacity: 0.8 }}>
                Book your first appointment to get started!
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "16px" }}>
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  style={{
                    padding: "24px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "16px",
                    background: "white",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    transition: "all 0.3s ease"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.12)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "20px" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                        <div style={{
                          width: "56px",
                          height: "56px",
                          borderRadius: "12px",
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "28px"
                        }}>
                          👨‍⚕️
                        </div>
                        <div>
                          <h4 style={{ margin: 0, color: "#667eea", fontSize: "22px", fontWeight: "700" }}>
                            Dr. {apt.doctor_name}
                          </h4>
                          <p style={{ margin: "4px 0 0 0", color: "#666", fontSize: "14px" }}>
                            {apt.specialization}
                          </p>
                        </div>
                      </div>
                      <div style={{ 
                        display: "grid", 
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
                        gap: "12px",
                        marginBottom: "16px"
                      }}>
                        <div style={{ 
                          padding: "12px 16px",
                          background: "#f8f9fa",
                          borderRadius: "10px"
                        }}>
                          <strong style={{ color: "#666", fontSize: "12px", display: "block", marginBottom: "4px" }}>
                            📅 DATE
                          </strong>
                          <p style={{ margin: 0, color: "#333", fontWeight: "600" }}>
                            {new Date(apt.appointment_date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                        <div style={{ 
                          padding: "12px 16px",
                          background: "#f8f9fa",
                          borderRadius: "10px"
                        }}>
                          <strong style={{ color: "#666", fontSize: "12px", display: "block", marginBottom: "4px" }}>
                            ⏰ TIME
                          </strong>
                          <p style={{ margin: 0, color: "#333", fontWeight: "600" }}>
                            {apt.start_time} - {apt.end_time}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <strong style={{ color: "#666", fontSize: "14px" }}>Status:</strong>
                        <StatusBadge status={apt.status} variant="gradient" />
                      </div>
                    </div>
                    {apt.status !== "cancelled" && apt.status !== "completed" && (
                      <button
                        onClick={() => handleCancelAppointment(apt.id)}
                        style={{
                          ...dangerButton,
                          minWidth: "120px",
                          height: "48px",
                          fontSize: "15px",
                          fontWeight: "600",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px"
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = "#c82333";
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = "#dc3545";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        ❌ Cancel
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

      {/* Popup Component */}
      <Popup
        isOpen={popup.isOpen}
        onClose={() => {
          setPopup({ ...popup, isOpen: false });
          setPromptInput("");
        }}
        onConfirm={popup.onConfirm}
        title={popup.title}
        message={popup.message}
        type={popup.type}
        inputPlaceholder={popup.inputPlaceholder}
        inputValue={promptInput}
        onInputChange={setPromptInput}
        confirmText={popup.type === "confirm" ? "Yes" : "OK"}
        cancelText="Cancel"
      />
    </div>
  );
};

export default UserDashboard;
