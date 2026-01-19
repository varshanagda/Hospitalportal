// Shared form styles to reduce duplication across Login and Register components

export const inputStyle = {
  padding: "14px 16px",
  fontSize: "16px",
  border: "2px solid #e0e0e0",
  borderRadius: "8px",
  width: "100%",
  boxSizing: "border-box" as const,
  transition: "border-color 0.3s ease"
};

export const buttonStyle = {
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

export const containerStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  padding: "20px",
  fontFamily: "Arial, sans-serif"
};

export const cardStyle = {
  maxWidth: "500px",
  width: "100%",
  padding: "40px",
  background: "white",
  borderRadius: "16px",
  boxShadow: "0 10px 40px rgba(0,0,0,0.2)"
};

export const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontWeight: "600",
  color: "#333"
};

export const headingStyle = {
  margin: "0 0 10px 0",
  fontSize: "32px",
  color: "#333",
  fontWeight: "700"
};

export const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "20px"
};
