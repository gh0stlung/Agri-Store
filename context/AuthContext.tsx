import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    if (!supabase) {
      setLoading(false);
      return;
    }

    const initializeAuth = async () => {
      try {
        // Handle email verification redirect
        if (window.location.hash && window.location.hash.includes('access_token')) {
          try {
            const { data, error } = await (supabase!.auth as any).getSessionFromUrl({
              storeSession: true,
            });
            if (error) {
              console.error("Error handling auth redirect:", error);
            } else if (data.session) {
              console.log("Session recovered from URL");
              window.history.replaceState(null, '', window.location.pathname);
            }
          } catch (err) {
            console.error("Auth redirect handling failed:", err);
          }
        }

        const { data, error } = await supabase!.auth.getSession();
        if (error) {
          console.error("Auth session error:", error.message);
        }
        if (isMounted) {
          setUser(data?.session?.user || null);
        }
      } catch (err) {
        console.error("Auth check exception:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.email);
      if (isMounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
