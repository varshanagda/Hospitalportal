import { handleLinkMouseOver, handleLinkMouseOut } from "./FormHandlers";

interface FormLinkProps {
  text: string;
  linkText: string;
  href: string;
}

export const FormLink = ({ text, linkText, href }: FormLinkProps) => {
  return (
    <p style={{ textAlign: "center", margin: "10px 0 0 0", color: "#666" }}>
      {text}{" "}
      <a 
        href={href} 
        style={{ 
          color: "#007bff", 
          textDecoration: "none",
          fontWeight: "600"
        }}
        onMouseOver={handleLinkMouseOver}
        onMouseOut={handleLinkMouseOut}
      >
        {linkText}
      </a>
    </p>
  );
};
