import { handleButtonMouseOver, handleButtonMouseOut, handleButtonFocus, handleButtonBlur } from "./FormHandlers";
import { buttonStyle } from "./FormStyles";

interface SubmitButtonProps {
  loading: boolean;
  loadingText: string;
  defaultText: string;
}

export const SubmitButton = ({ loading, loadingText, defaultText }: SubmitButtonProps) => {
  const handleButtonOver = (e: React.MouseEvent<HTMLButtonElement>) => handleButtonMouseOver(e, loading);
  const handleButtonOut = (e: React.MouseEvent<HTMLButtonElement>) => handleButtonMouseOut(e, loading);
  const handleButtonFocusEvent = (e: React.FocusEvent<HTMLButtonElement>) => handleButtonFocus(e, loading);
  const handleButtonBlurEvent = (e: React.FocusEvent<HTMLButtonElement>) => handleButtonBlur(e, loading);

  return (
    <button 
      type="submit" 
      disabled={loading}
      style={{
        ...buttonStyle,
        opacity: loading ? 0.7 : 1,
        cursor: loading ? "not-allowed" : "pointer"
      }}
      onMouseOver={handleButtonOver}
      onMouseOut={handleButtonOut}
      onFocus={handleButtonFocusEvent}
      onBlur={handleButtonBlurEvent}
    >
      {loading ? loadingText : defaultText}
    </button>
  );
};
