import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  connectionError: boolean;
  signOut: () => Promise<void>;
  retryConnection: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  connectionError: false,
  signOut: async () => {},
  retryConnection: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

  const initializeAuth = async () => {
    // Skip auth if Supabase is not configured
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    try {
      setConnectionError(false);
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth session error:', error);
        // Check if it's a network error
        if (error.message?.includes('Failed to fetch')) {
          setConnectionError(true);
        }
      }
      
      setSession(session);
      setUser(session?.user ?? null);
    } catch (err: any) {
      console.error('Auth initialization error:', err);
      // Handle network errors gracefully
      if (err?.message?.includes('Failed to fetch') || err?.name === 'TypeError') {
        setConnectionError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();

    // Only set up auth state listener if Supabase is configured
    if (!isSupabaseConfigured) {
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      setConnectionError(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
      } catch (err) {
        console.error('Sign out error:', err);
        // Even if there's an error, clear local state
        setUser(null);
        setSession(null);
      }
    }
  };

  const retryConnection = () => {
    setLoading(true);
    setConnectionError(false);
    initializeAuth();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, connectionError, signOut, retryConnection }}>
      {children}
    </AuthContext.Provider>
  );
};
