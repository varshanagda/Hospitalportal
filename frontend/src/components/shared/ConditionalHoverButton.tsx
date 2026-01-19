import { ReactNode } from "react";

interface ConditionalHoverButtonProps {
  onClick?: () => void;
  children: ReactNode;
  variant?: "danger";
  disabled?: boolean;
  canHover: boolean;
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
  danger: {
    background: "#dc3545",
    color: "white",
    hoverColor: "#c82333",
    disabledBackground: "#6c757d"
  }
};

export const ConditionalHoverButton = ({ 
  onClick, 
  children, 
  variant = "danger",
  disabled = false,
  canHover,
  style = {}
}: ConditionalHoverButtonProps) => {
  const variantStyle = variantStyles[variant];
  const combinedStyle = {
    ...baseButtonStyle,
    background: disabled ? variantStyle.disabledBackground : variantStyle.background,
    color: variantStyle.color,
    ...style,
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? "not-allowed" : "pointer"
  };

  const handleMouseOver = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (canHover && !disabled) {
      e.currentTarget.style.background = variantStyle.hoverColor;
    }
  };

  const handleMouseOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (canHover && !disabled) {
      e.currentTarget.style.background = variantStyle.background;
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={combinedStyle}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
      {children}
    </button>
  );
};
