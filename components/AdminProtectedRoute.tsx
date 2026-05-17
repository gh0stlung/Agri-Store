import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return <p style={{ textAlign: "center", marginTop: "50px", fontWeight: "bold", color: "#064E3B" }}>Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.email?.toLowerCase() !== 'admin69@gmail.com') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
