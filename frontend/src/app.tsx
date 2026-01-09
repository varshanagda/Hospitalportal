import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import UserDashboard from "./pages/UserDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { isAuthenticated } from "./utils/auth";
import { getCurrentUser } from "./services/authService";

const ProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element; allowedRoles?: string[] }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const user = getCurrentUser();
    if (!user || !allowedRoles.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

const App = () => {
  const getDashboardRoute = () => {
    if (!isAuthenticated()) return "/login";
    
    const user = getCurrentUser();
    if (!user) return "/login";

    switch (user.role) {
      case "admin":
        return "/admin";
      case "doctor":
        return "/doctor";
      case "user":
        return "/user";
      default:
        return "/login";
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* User Dashboard */}
        <Route
          path="/user"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Doctor Dashboard */}
        <Route
          path="/doctor"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Legacy profile route */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Unauthorized */}
        <Route
          path="/unauthorized"
          element={
            <div style={{ padding: "20px", textAlign: "center" }}>
              <h1>Unauthorized</h1>
              <p>You don't have permission to access this page.</p>
              <button onClick={() => window.location.href = getDashboardRoute()}>
                Go to Dashboard
              </button>
            </div>
          }
        />

        {/* Default route - redirect to appropriate dashboard */}
        <Route path="*" element={<Navigate to={getDashboardRoute()} replace />} />
      </Routes>
    </Router>
  );
};

export default App;
