import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../services/supabase.ts';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check active session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Listen for auth changes (e.g. token expiry, logout in other tab)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FFFCF0]">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-[#064E3B]" size={32} />
            <p className="text-[#064E3B] font-medium font-serif">Verifying Access...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  // Render children (Admin) if authenticated
  return <>{children}</>;
};