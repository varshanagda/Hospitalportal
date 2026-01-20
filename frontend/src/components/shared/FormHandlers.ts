// Shared form event handlers to reduce duplication

export const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.currentTarget.style.borderColor = "#007bff";
};

export const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.currentTarget.style.borderColor = "#e0e0e0";
};

export const handleButtonMouseOver = (e: React.MouseEvent<HTMLButtonElement>, loading: boolean) => {
  if (!loading) {
    e.currentTarget.style.background = "#0056b3";
    e.currentTarget.style.transform = "translateY(-2px)";
    e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
  }
};

export const handleButtonMouseOut = (e: React.MouseEvent<HTMLButtonElement>, loading: boolean) => {
  if (!loading) {
    e.currentTarget.style.background = "#007bff";
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
  }
};

export const handleButtonFocus = (e: React.FocusEvent<HTMLButtonElement>, loading: boolean) => { // NOSONAR - Intentional for accessibility
  if (!loading) {
    e.currentTarget.style.background = "#0056b3";
    e.currentTarget.style.transform = "translateY(-2px)";
    e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
  }
};

export const handleButtonBlur = (e: React.FocusEvent<HTMLButtonElement>, loading: boolean) => { // NOSONAR - Intentional for accessibility
  if (!loading) {
    e.currentTarget.style.background = "#007bff";
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
  }
};

export const handleLinkMouseOver = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.currentTarget.style.textDecoration = "underline";
};

export const handleLinkMouseOut = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.currentTarget.style.textDecoration = "none";
};

export const handleLinkFocus = (e: React.FocusEvent<HTMLAnchorElement>) => {
  e.currentTarget.style.textDecoration = "underline";
};

export const handleLinkBlur = (e: React.FocusEvent<HTMLAnchorElement>) => {
  e.currentTarget.style.textDecoration = "none";
};
