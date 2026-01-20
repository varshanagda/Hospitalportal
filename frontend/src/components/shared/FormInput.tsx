import { handleInputFocus, handleInputBlur } from "./FormHandlers";
import { inputStyle, labelStyle } from "./FormStyles";

interface FormInputProps {
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

export const FormInput = ({ label, type = "text", placeholder, value, onChange, required = false }: FormInputProps) => {
  return (
    <div>
      <label style={labelStyle}>
        {label}
      </label>
      <input
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        style={inputStyle}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
      />
    </div>
  );
};
