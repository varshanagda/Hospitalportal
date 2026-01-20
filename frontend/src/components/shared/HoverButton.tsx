import type React from "react";
import type { ReactNode } from "react";

interface HoverButtonProps {
  onClick?: () => void;
  type?: "button" | "submit";
  children: ReactNode;
  variant?: "primary" | "success" | "danger" | "info";
  disabled?: boolean;
  style?: React.CSSProperties;
}

const baseButtonStyle: React.CSSProperties = {
  padding: "12px 24px",
  fontSize: "16px",
  fontWeight: "600",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  transition: "all 0.3s ease",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
};

const variantStyles = {
  primary: {
    background: "#007bff",
    color: "white",
    hoverColor: "#0056b3"
  },
  success: {
    background: "#28a745",
    color: "white",
    hoverColor: "#218838"
  },
  danger: {
    background: "#dc3545",
    color: "white",
    hoverColor: "#c82333"
  },
  info: {
    background: "#17a2b8",
    color: "white",
    hoverColor: "#138496"
  }
};

export const HoverButton = ({ 
  onClick, 
  type = "button", 
  children, 
  variant = "primary",
  disabled = false,
  style = {}
}: HoverButtonProps) => {
  const variantStyle = variantStyles[variant];
  const combinedStyle = {
    ...baseButtonStyle,
    ...variantStyle,
    ...style,
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? "not-allowed" : "pointer"
  };

  const handleMouseOver = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      e.currentTarget.style.background = variantStyle.hoverColor;
    }
  };

  const handleMouseOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      e.currentTarget.style.background = variantStyle.background;
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => { // NOSONAR - Intentional for accessibility
    if (!disabled) {
      e.currentTarget.style.background = variantStyle.hoverColor;
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLButtonElement>) => { // NOSONAR - Intentional for accessibility
    if (!disabled) {
      e.currentTarget.style.background = variantStyle.background;
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={combinedStyle}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {children}
    </button>
  );
};
