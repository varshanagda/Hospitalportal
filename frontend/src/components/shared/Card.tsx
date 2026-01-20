interface CardProps {
  children: React.ReactNode;
  variant?: "appointment" | "doctor";
}

const cardStyles = {
  appointment: {
    padding: "15px",
    marginBottom: "10px",
    border: "1px solid #ddd",
    borderRadius: "5px"
  },
  doctor: {
    padding: "15px",
    marginBottom: "10px",
    border: "1px solid #ddd",
    borderRadius: "5px"
  }
};

export const Card = ({ children, variant = "appointment" }: CardProps) => {
  return (
    <div style={cardStyles[variant]}>
      {children}
    </div>
  );
};
