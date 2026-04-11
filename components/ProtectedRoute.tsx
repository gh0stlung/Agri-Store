import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '@/lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    const checkBlock = async () => {
      if (user && supabase) {
        const { data } = await supabase
          .from('profiles')
          .select('is_blocked')
          .eq('id', user.id)
          .single();
        setIsBlocked(data?.is_blocked || false);
      }
      setChecking(false);
    };
    if (!loading) checkBlock();
  }, [user, loading]);

  if (loading || checking) {
    return <p style={{ textAlign: 'center', marginTop: '50px', fontWeight: 'bold', color: '#064E3B' }}>Loading...</p>;
  }

  if (!user && location.pathname !== '/profile') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Blocked users → delivery dashboard only
  if (isBlocked) {
    return <Navigate to="/delivery" replace />;
  }

  return <>{children}</>;
};
