interface MessageDisplayProps {
  message: string;
  isError?: boolean;
}

export const MessageDisplay = ({ message, isError = false }: MessageDisplayProps) => {
  if (!message) return null;

  return (
    <div style={{ 
      padding: "12px 16px", 
      borderRadius: "8px",
      textAlign: "center",
      background: isError ? "#f8d7da" : "#d4edda",
      color: isError ? "#721c24" : "#155724",
      border: `1px solid ${isError ? "#f5c6cb" : "#c3e6cb"}`
    }}>
      {isError ? "❌ " : "✅ "}{message}
    </div>
  );
};
