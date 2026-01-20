interface AdminButtonProps {
  onClick?: () => void;
  type?: "button" | "submit";
  children: React.ReactNode;
  variant?: "primary" | "success" | "danger";
}

const buttonStyles = {
  primary: {
    padding: "8px 16px",
    background: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  },
  success: {
    padding: "8px 16px",
    background: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  },
  danger: {
    padding: "8px 16px",
    background: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  }
};

const submitButtonStyle = {
  padding: "10px 20px",
  cursor: "pointer",
  background: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "5px"
};

export const AdminButton = ({ 
  onClick, 
  type = "button", 
  children, 
  variant = "primary" 
}: AdminButtonProps) => {
  if (type === "submit") {
    return (
      <button type="submit" style={submitButtonStyle}>
        {children}
      </button>
    );
  }

  return (
    <button 
      type={type}
      onClick={onClick}
      style={buttonStyles[variant]}
    >
      {children}
    </button>
  );
};
