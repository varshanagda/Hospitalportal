import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authService";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("user");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    
    try {
      await register({ email, password, role, full_name: fullName, phone });
      setMessage("Registration successful! Please login.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "50px auto", padding: "20px" }}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <h2>Register</h2>
        
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: "10px", fontSize: "16px" }}
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: "10px", fontSize: "16px" }}
        />
        
        <input
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          style={{ padding: "10px", fontSize: "16px" }}
        />
        
        <input
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ padding: "10px", fontSize: "16px" }}
        />
        
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ padding: "10px", fontSize: "16px" }}
        >
          <option value="user">User (Patient)</option>
          <option value="doctor">Doctor</option>
        </select>
        
        <button type="submit" style={{ padding: "10px", fontSize: "16px", cursor: "pointer" }}>
          Register
        </button>
        
        {message && <p style={{ color: "green" }}>{message}</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        
        <p>
          Already have an account?{" "}
          <a href="/login" style={{ color: "blue" }}>Login</a>
        </p>
      </form>
    </div>
  );
};

export default Register;
