interface StatusBadgeProps {
  status: string;
  variant?: "simple" | "gradient";
}

export const StatusBadge = ({ status, variant = "simple" }: StatusBadgeProps) => {
  const getStatusStyles = () => {
    const baseStyles = {
      padding: variant === "gradient" ? "8px 16px" : "3px 8px",
      borderRadius: variant === "gradient" ? "8px" : "3px",
      fontSize: variant === "gradient" ? "13px" : "14px",
      fontWeight: "700" as const,
      letterSpacing: variant === "gradient" ? "0.5px" : "normal",
      boxShadow: variant === "gradient" ? "0 2px 4px rgba(0,0,0,0.1)" : "none"
    };

    const statusColors = {
      approved: {
        background: variant === "gradient" 
          ? "linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)" 
          : "#d4edda",
        color: "#155724"
      },
      pending: {
        background: variant === "gradient"
          ? "linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)"
          : "#fff3cd",
        color: "#856404"
      },
      completed: {
        background: variant === "gradient"
          ? "linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%)"
          : "#d1ecf1",
        color: "#0c5460"
      },
      cancelled: {
        background: variant === "gradient"
          ? "linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)"
          : "#f8d7da",
        color: "#721c24"
      }
    };

    const statusStyle = statusColors[status.toLowerCase() as keyof typeof statusColors] || statusColors.cancelled;

    return {
      ...baseStyles,
      ...statusStyle
    };
  };

  return (
    <span style={getStatusStyles()}>
      {status.toUpperCase()}
    </span>
  );
};
