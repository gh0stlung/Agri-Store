import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '@/lib/supabase';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [roleLoading, setRoleLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAdmin = async () => {
      if (!authLoading && user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          if (profile?.role === 'admin') {
            setIsAdmin(true);
          }
        } catch (err) {
          console.error('Admin check error:', err);
        } finally {
          setRoleLoading(false);
        }
      } else if (!authLoading && !user) {
        setRoleLoading(false);
      }
    };

    checkAdmin();
  }, [user, authLoading]);

  if (authLoading || roleLoading) {
    return <p style={{ textAlign: "center", marginTop: "50px", fontWeight: "bold", color: "#064E3B" }}>Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
