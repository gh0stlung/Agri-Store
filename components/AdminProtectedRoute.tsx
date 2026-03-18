import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [roleLoading, setRoleLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!authLoading) {
        if (!user) {
          navigate('/login', { replace: true });
          return;
        }

        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          if (error || profile?.role !== 'admin') {
            navigate('/', { replace: true });
          } else {
            setIsAdmin(true);
          }
        } catch (err) {
          navigate('/', { replace: true });
        } finally {
          setRoleLoading(false);
        }
      }
    };

    checkAdmin();
  }, [user, authLoading, navigate]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#F1F5F9]">
        <Loader2 className="animate-spin text-[#064E3B]" size={32} />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return <>{children}</>;
};
