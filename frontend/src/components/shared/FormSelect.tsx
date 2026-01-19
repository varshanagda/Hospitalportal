import { handleInputFocus, handleInputBlur } from "./FormHandlers";
import { inputStyle, labelStyle } from "./FormStyles";

interface FormSelectProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
}

export const FormSelect = ({ label, value, onChange, options }: FormSelectProps) => {
  return (
    <div>
      <label style={labelStyle}>
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        style={{
          ...inputStyle,
          background: "white"
        }}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
