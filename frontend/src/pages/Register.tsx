import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authService";
import {
  containerStyle,
  cardStyle,
  headingStyle,
  formStyle
} from "../components/shared/FormStyles";
import { FormInput } from "../components/shared/FormInput";
import { FormSelect } from "../components/shared/FormSelect";
import { FormLink } from "../components/shared/FormLink";
import { MessageDisplay } from "../components/shared/MessageDisplay";
import { SubmitButton } from "../components/shared/SubmitButton";

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
      if (!email || !password) {
        setError("Email and password are required");
        return;
      }
      
      await register({ email, password, role, full_name: fullName, phone });
      setMessage("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error: unknown) {
      let errorMessage = "Registration failed. Please try again.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "object" && error !== null && "response" in error) {
        const axiosError = error as { response?: { data?: { error?: string; message?: string } } };
        errorMessage = axiosError.response?.data?.error || 
                      axiosError.response?.data?.message || 
                      errorMessage;
      }
      
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

          <FormInput
            label="👤 Full Name"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <FormInput
            label="📱 Phone"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <FormSelect
            label="👔 Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={[
              { value: "user", label: "👤 User (Patient)" },
              { value: "doctor", label: "👨‍⚕️ Doctor" }
            ]}
          />

          <SubmitButton
            loading={loading}
            loadingText="⏳ Registering..."
            defaultText="✨ Register"
          />

          <MessageDisplay message={message} isError={false} />
          <MessageDisplay message={error} isError={true} />

          <FormLink
            text="Already have an account?"
            linkText="Login here"
            href="/login"
          />
        </form>
      </div>
    </div>
  );
};

export default Register;
