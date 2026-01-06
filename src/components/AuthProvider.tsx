'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isGuestMode: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getSession = async () => {
      // Check for guest mode first
      const guestMode = localStorage.getItem('kanso_guest_mode');
      if (guestMode === 'true') {
        // Create mock guest user
        const mockUser = {
          id: 'guest',
          email: 'guest@demo.kanso',
          app_metadata: {},
          user_metadata: { display_name: 'Guest User' },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as User;
        
        setUser(mockUser);
        setIsGuestMode(true);
        setLoading(false);
        return;
      }

      // Normal Supabase auth flow
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, newSession) => {
        // If guest mode is active in localStorage, ignore Supabase updates
        // This prevents Supabase saying "no user" and overwriting our mock user
        if (localStorage.getItem('kanso_guest_mode') === 'true') {
            return;
        }

        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const signInWithGoogle = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }, [supabase.auth]);

  const signInAsGuest = useCallback(() => {
    localStorage.setItem('kanso_guest_mode', 'true');
    // Set cookie for middleware access
    document.cookie = "kanso_guest_mode=true; path=/; max-age=31536000; SameSite=Lax";
    
    const mockUser = {
      id: 'guest',
      email: 'guest@demo.kanso',
      app_metadata: {},
      user_metadata: { display_name: 'Guest User' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as User;
    
    setUser(mockUser);
    setIsGuestMode(true);
  }, []);

  const signOut = useCallback(async () => {
    if (isGuestMode) {
      localStorage.removeItem('kanso_guest_mode');
      // Remove cookie
      document.cookie = "kanso_guest_mode=; path=/; max-age=0";
      setUser(null);
      setIsGuestMode(false);
    } else {
      await supabase.auth.signOut();
    }
  }, [supabase.auth, isGuestMode]);

  return (
    <AuthContext.Provider value={{ user, session, loading, isGuestMode, signInWithGoogle, signInAsGuest, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
