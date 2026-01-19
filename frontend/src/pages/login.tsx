import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
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

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const response = await login(email, password);
      setMessage("Login successful");
      
      // Redirect based on user role
      const userRole = response.user?.role;
      if (userRole === "admin") {
        navigate("/admin");
      } else if (userRole === "doctor") {
        navigate("/doctor");
      } else {
        navigate("/user");
      }
    } catch {
      setMessage("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div style={containerStyle}>
      <div style={{ ...cardStyle, maxWidth: "450px" }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h2 style={headingStyle}>
            🏥 Hospital Portal
          </h2>
          <p style={{ color: "#666", fontSize: "16px" }}>Sign in to your account</p>
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
            {loading ? "⏳ Logging in..." : "🚀 Login"}
          </button>

          {message && (
            <div style={{ 
              padding: "12px 16px", 
              borderRadius: "8px",
              textAlign: "center",
              background: message.includes("failed") ? "#f8d7da" : "#d4edda",
              color: message.includes("failed") ? "#721c24" : "#155724",
              border: `1px solid ${message.includes("failed") ? "#f5c6cb" : "#c3e6cb"}`
            }}>
              {message.includes("failed") ? "❌ " : "✅ "}{message}
            </div>
          )}

          <p style={{ textAlign: "center", margin: "10px 0 0 0", color: "#666" }}>
            Don't have an account?{" "}
            <a 
              href="/register" 
              style={{ 
                color: "#007bff", 
                textDecoration: "none",
                fontWeight: "600"
              }}
              onMouseOver={handleLinkMouseOver}
              onMouseOut={handleLinkMouseOut}
            >
              Register here
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
