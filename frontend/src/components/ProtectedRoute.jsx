import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children, role, disallowRole }) {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const { currentUser, isLoadingUser } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (isLoadingUser) {
    return <div className="rounded border border-line p-6 text-sm text-muted">Loading...</div>;
  }

  const allowedRoles = Array.isArray(role) ? role : role ? [role] : [];
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  const blockedRoles = Array.isArray(disallowRole) ? disallowRole : disallowRole ? [disallowRole] : [];
  if (blockedRoles.includes(currentUser?.role)) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
