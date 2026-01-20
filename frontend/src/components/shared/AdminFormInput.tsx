interface AdminFormInputProps {
  type?: string;
  placeholder: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

const inputStyle = {
  padding: "10px",
  fontSize: "16px"
};

export const AdminFormInput = ({ 
  type = "text", 
  placeholder, 
  value, 
  onChange, 
  required = false 
}: AdminFormInputProps) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value || ""}
      onChange={onChange}
      required={required}
      style={inputStyle}
    />
  );
};
