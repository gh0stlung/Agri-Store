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
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Handle email verification redirect
    const handleAuthRedirect = async () => {
      // Check if the URL has a hash fragment indicating an auth redirect
      if (window.location.hash) {
        try {
          const { data, error } = await (supabase!.auth as any).getSessionFromUrl({
            storeSession: true,
          });
          if (error) {
            console.error("Error handling auth redirect:", error);
          } else if (data.session) {
            console.log("Session recovered from URL");
            // Clear the hash from the URL
            window.history.replaceState(null, '', window.location.pathname);
            // Redirect to home
            window.location.replace('/');
          }
        } catch (err) {
          console.error("Auth redirect handling failed:", err);
        }
      }
    };

    handleAuthRedirect();

    // Check active sessions and sets the user
    const getUser = async () => {
      try {
        const { data, error } = await supabase!.auth.getUser();
        console.log("Initial auth check:", data, error);
        setUser(data.user);
      } catch (err) {
        console.error("Auth check error:", err);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.email);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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
