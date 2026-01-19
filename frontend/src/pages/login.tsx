import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import {
  containerStyle,
  cardStyle,
  headingStyle,
  formStyle
} from "../components/shared/FormStyles";
import { FormInput } from "../components/shared/FormInput";
import { FormLink } from "../components/shared/FormLink";
import { MessageDisplay } from "../components/shared/MessageDisplay";
import { SubmitButton } from "../components/shared/SubmitButton";

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
      if (!response || !response.user) {
        setMessage("Login failed. Invalid response from server.");
        return;
      }
      
      setMessage("Login successful");
      
      // Redirect based on user role
      const userRole = response.user.role;
      if (userRole === "admin") {
        navigate("/admin");
      } else if (userRole === "doctor") {
        navigate("/doctor");
      } else {
        navigate("/user");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Login failed. Please check your credentials.";
      setMessage(`Login failed: ${errorMessage}`);
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
          <FormInput
            label="📧 Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <FormInput
            label="🔒 Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <SubmitButton
            loading={loading}
            loadingText="⏳ Logging in..."
            defaultText="🚀 Login"
          />

          <MessageDisplay 
            message={message} 
            isError={message.includes("failed")} 
          />

          <FormLink
            text="Don't have an account?"
            linkText="Register here"
            href="/register"
          />
        </form>
      </div>
    </div>
  );
};

export default Login;
