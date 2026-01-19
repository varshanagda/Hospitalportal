import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authService";
import {
  inputStyle,
  buttonStyle,
  containerStyle,
  cardStyle,
  labelStyle,
  headingStyle,
  formStyle
} from "../components/shared/FormStyles";
import {
  handleInputFocus,
  handleInputBlur,
  handleButtonMouseOver,
  handleButtonMouseOut,
  handleLinkMouseOver,
  handleLinkMouseOut
} from "../components/shared/FormHandlers";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("user");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    
    try {
      await register({ email, password, role, full_name: fullName, phone });
      setMessage("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      console.error("Registration error:", err.response?.data);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Registration failed. Please check backend logs.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h2 style={headingStyle}>
            ✨ Create Account
          </h2>
          <p style={{ color: "#666", fontSize: "16px" }}>Join our hospital portal</p>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          <div>
            <label style={labelStyle}>
              📧 Email
            </label>
            <input
              placeholder="Enter your email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>

          <div>
            <label style={labelStyle}>
              🔒 Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>

          <div>
            <label style={labelStyle}>
              👤 Full Name
            </label>
            <input
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={inputStyle}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>

          <div>
            <label style={labelStyle}>
              📱 Phone
            </label>
            <input
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={inputStyle}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>

          <div>
            <label style={labelStyle}>
              👔 Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                ...inputStyle,
                background: "white"
              }}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            >
              <option value="user">👤 User (Patient)</option>
              <option value="doctor">👨‍⚕️ Doctor</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              ...buttonStyle,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }}
            onMouseOver={(e) => handleButtonMouseOver(e, loading)}
            onMouseOut={(e) => handleButtonMouseOut(e, loading)}
          >
            {loading ? "⏳ Registering..." : "✨ Register"}
          </button>

          {message && (
            <div style={{ 
              padding: "12px 16px", 
              borderRadius: "8px",
              textAlign: "center",
              background: "#d4edda",
              color: "#155724",
              border: "1px solid #c3e6cb"
            }}>
              ✅ {message}
            </div>
          )}

          {error && (
            <div style={{ 
              padding: "12px 16px", 
              borderRadius: "8px",
              textAlign: "center",
              background: "#f8d7da",
              color: "#721c24",
              border: "1px solid #f5c6cb"
            }}>
              ❌ {error}
            </div>
          )}

          <p style={{ textAlign: "center", margin: "10px 0 0 0", color: "#666" }}>
            Already have an account?{" "}
            <a 
              href="/login" 
              style={{ 
                color: "#007bff", 
                textDecoration: "none",
                fontWeight: "600"
              }}
              onMouseOver={handleLinkMouseOver}
              onMouseOut={handleLinkMouseOut}
            >
              Login here
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
