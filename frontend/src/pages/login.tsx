import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";

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

  const inputStyle = {
    padding: "14px 16px",
    fontSize: "16px",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    width: "100%",
    boxSizing: "border-box" as const,
    transition: "border-color 0.3s ease"
  };

  const buttonStyle = {
    padding: "14px 24px",
    fontSize: "16px",
    fontWeight: "600",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    width: "100%",
    background: "#007bff",
    color: "white"
  };

  return (
    <div style={{ 
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "20px",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{ 
        maxWidth: "450px", 
        width: "100%",
        padding: "40px",
        background: "white",
        borderRadius: "16px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.2)"
      }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h2 style={{ 
            margin: "0 0 10px 0", 
            fontSize: "32px",
            color: "#333",
            fontWeight: "700"
          }}>
            🏥 Hospital Portal
          </h2>
          <p style={{ color: "#666", fontSize: "16px" }}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "600",
              color: "#333"
            }}>
              📧 Email
            </label>
            <input
              placeholder="Enter your email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
              onFocus={(e) => e.currentTarget.style.borderColor = "#007bff"}
              onBlur={(e) => e.currentTarget.style.borderColor = "#e0e0e0"}
            />
          </div>

          <div>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "600",
              color: "#333"
            }}>
              🔒 Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
              onFocus={(e) => e.currentTarget.style.borderColor = "#007bff"}
              onBlur={(e) => e.currentTarget.style.borderColor = "#e0e0e0"}
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
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.background = "#0056b3";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.currentTarget.style.background = "#007bff";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
              }
            }}
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
              onMouseOver={(e) => e.currentTarget.style.textDecoration = "underline"}
              onMouseOut={(e) => e.currentTarget.style.textDecoration = "none"}
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
