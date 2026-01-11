import { useApp } from "@/context/AppContext";
import { Navigate } from "react-router-dom";

const ProtectedAdminRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useApp();

  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />; // Redirect non-admin users to home
  }

  return children;
};

export default ProtectedAdminRoute;