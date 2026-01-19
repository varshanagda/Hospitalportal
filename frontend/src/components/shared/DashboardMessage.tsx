interface DashboardMessageProps {
  message?: string;
  error?: string;
  variant?: "simple" | "detailed";
}

export const DashboardMessage = ({ message, error, variant = "simple" }: DashboardMessageProps) => {
  if (variant === "simple") {
    return (
      <>
        {message && (
          <div style={{ 
            padding: "10px", 
            background: "#d4edda", 
            color: "#155724", 
            marginBottom: "15px", 
            borderRadius: "5px" 
          }}>
            {message}
          </div>
        )}
        {error && (
          <div style={{ 
            padding: "10px", 
            background: "#f8d7da", 
            color: "#721c24", 
            marginBottom: "15px", 
            borderRadius: "5px" 
          }}>
            {error}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {message && (
        <div style={{ 
          padding: "16px 20px", 
          background: "linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)", 
          color: "#155724", 
          marginBottom: "20px", 
          borderRadius: "12px",
          border: "2px solid #c3e6cb",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          boxShadow: "0 4px 12px rgba(21, 87, 36, 0.15)"
        }}>
          <span style={{ fontSize: "24px" }}>✅</span>
          <p style={{ margin: 0, fontWeight: "600", fontSize: "16px" }}>{message}</p>
        </div>
      )}
      {error && (
        <div style={{ 
          padding: "16px 20px", 
          background: "linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)", 
          color: "#721c24", 
          marginBottom: "20px", 
          borderRadius: "12px",
          border: "2px solid #f5c6cb",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          boxShadow: "0 4px 12px rgba(114, 28, 36, 0.15)"
        }}>
          <span style={{ fontSize: "24px" }}>❌</span>
          <p style={{ margin: 0, fontWeight: "600", fontSize: "16px" }}>{error}</p>
        </div>
      )}
    </>
  );
};
