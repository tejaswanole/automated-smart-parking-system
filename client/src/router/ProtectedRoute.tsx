import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: Array<"user" | "owner" | "staff" | "admin"> }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" />;
  if (roles && roles.length > 0 && !roles.includes(user.role)) return <Navigate to="/" />;
  return <>{children}</>;
}
