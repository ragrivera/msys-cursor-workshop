import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access if required
  if (requiredRole && user?.role !== requiredRole) {
    // For now, just redirect to dashboard if user doesn't have the required role
    // In a real app, you might want to show an access denied page
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
