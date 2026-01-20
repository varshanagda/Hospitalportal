import { useNavigate } from "react-router-dom";
import { logout } from "../services/authService";

export const useLogoutHandler = (setPopup: (popup: any) => void) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    setPopup({
      isOpen: true,
      type: "confirm",
      title: "Logout",
      message: "Are you sure you want to logout?",
      onConfirm: () => {
        logout();
        navigate("/login");
      }
    });
  };

  return handleLogout;
};
