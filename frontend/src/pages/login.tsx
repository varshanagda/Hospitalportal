import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setMessage("Login failed");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
      <h2>Login</h2>
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
        <button type="submit" style={{ padding: "10px", fontSize: "16px", cursor: "pointer" }}>
          Login
        </button>
        {message && <p style={{ color: message.includes("failed") ? "red" : "green" }}>{message}</p>}
        <p>
          Don't have an account?{" "}
          <a href="/register" style={{ color: "blue" }}>Register</a>
        </p>
    </form>
    </div>
  );
};

export default Login;
