import { useState, useEffect } from "react";

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (inputValue?: string) => void;
  title: string;
  message?: string;
  type?: "alert" | "confirm" | "prompt";
  inputPlaceholder?: string;
  confirmText?: string;
  cancelText?: string;
  inputValue?: string;
  onInputChange?: (value: string) => void;
}

const Popup = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "alert",
  inputPlaceholder = "Enter text...",
  confirmText = "OK",
  cancelText = "Cancel",
  inputValue = "",
  onInputChange
}: PopupProps) => {
  const [input, setInput] = useState(inputValue);

  useEffect(() => {
    setInput(inputValue);
  }, [inputValue, isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (type === "prompt" && !input.trim()) {
      return; // Don't close if prompt input is empty
    }
    if (onConfirm) {
      onConfirm(type === "prompt" ? input : undefined);
    }
    if (type === "alert") {
      onClose();
    }
  };

  const handleCancel = () => {
    setInput("");
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && type !== "confirm") {
      handleConfirm();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        animation: "fadeIn 0.3s ease"
      }}
      onClick={handleCancel}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "30px",
          maxWidth: "450px",
          width: "90%",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          animation: "slideUp 0.3s ease",
          transform: "scale(1)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon and Title */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: type === "confirm" 
              ? "linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)"
              : type === "prompt"
              ? "linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%)"
              : "linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "32px",
            margin: "0 auto 16px"
          }}>
            {type === "confirm" ? "⚠️" : type === "prompt" ? "✏️" : "ℹ️"}
          </div>
          <h2 style={{
            margin: 0,
            fontSize: "24px",
            fontWeight: "700",
            color: "#333"
          }}>
            {title}
          </h2>
        </div>

        {/* Message */}
        {message && (
          <p style={{
            margin: "0 0 24px 0",
            fontSize: "16px",
            color: "#666",
            textAlign: "center",
            lineHeight: "1.6"
          }}>
            {message}
          </p>
        )}

        {/* Input for prompt */}
        {type === "prompt" && (
          <div style={{ marginBottom: "24px" }}>
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (onInputChange) {
                  onInputChange(e.target.value);
                }
              }}
              onKeyPress={handleKeyPress}
              placeholder={inputPlaceholder}
              autoFocus
              style={{
                width: "100%",
                padding: "14px 16px",
                fontSize: "16px",
                border: "2px solid #e0e0e0",
                borderRadius: "10px",
                outline: "none",
                transition: "all 0.3s ease",
                boxSizing: "border-box"
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#667eea";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.2)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e0e0e0";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>
        )}

        {/* Buttons */}
        <div style={{
          display: "flex",
          gap: "12px",
          justifyContent: type === "alert" ? "center" : "space-between"
        }}>
          {(type === "confirm" || type === "prompt") && (
            <button
              onClick={handleCancel}
              style={{
                flex: 1,
                padding: "14px 24px",
                fontSize: "16px",
                fontWeight: "600",
                border: "2px solid #e0e0e0",
                borderRadius: "10px",
                background: "white",
                color: "#666",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#f8f9fa";
                e.currentTarget.style.borderColor = "#d0d0d0";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "white";
                e.currentTarget.style.borderColor = "#e0e0e0";
              }}
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            disabled={type === "prompt" && !input.trim()}
            style={{
              flex: 1,
              padding: "14px 24px",
              fontSize: "16px",
              fontWeight: "600",
              border: "none",
              borderRadius: "10px",
              background: type === "confirm"
                ? "linear-gradient(135deg, #dc3545 0%, #c82333 100%)"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              cursor: type === "prompt" && !input.trim() ? "not-allowed" : "pointer",
              opacity: type === "prompt" && !input.trim() ? 0.5 : 1,
              transition: "all 0.3s ease",
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)"
            }}
            onMouseOver={(e) => {
              if (!(type === "prompt" && !input.trim())) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(102, 126, 234, 0.4)";
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.3)";
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default Popup;
