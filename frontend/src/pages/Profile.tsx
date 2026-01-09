import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout, getProfile, type User } from "../services/authService";

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getProfile()
      .then((res) => setUser(res.data.user))
      .catch(() => setError("Unauthorized"));
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login"); // redirect to login after logout
  };

  if (error) return <p>{error}</p>;
  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h2>Profile</h2>
      <p>User ID: {user.id}</p>
      <p>Email: {user.email}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Profile;
