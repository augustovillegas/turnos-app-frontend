import { Navigate } from "react-router-dom";

export const PrivateRoute = ({ children, roles }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  if (Array.isArray(roles) && roles.length > 0 && !roles.includes(user.role)) {
    if (user.role === "alumno") {
      return <Navigate to="/dashboard/alumno" />;
    }
    if (user.role === "profesor") {
      return <Navigate to="/dashboard/profesor" />;
    }
    if (user.role === "superadmin") {
      return <Navigate to="/dashboard/superadmin" />;
    }
  }

  return children;
};
