'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import {
  supabaseAuth,
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  signInWithProvider as authSignInWithProvider,
  getSession,
  resetPassword as authResetPassword,
} from './supabase-auth';

interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  preferred_locale: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithFacebook: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from database
  const fetchProfile = async (userId: string) => {
    if (!supabaseAuth) return null;

    const { data, error } = await supabaseAuth
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data as UserProfile;
  };

  useEffect(() => {
    // Check active session
    const initAuth = async () => {
      const { session } = await getSession();

      if (session?.user) {
        setUser(session.user);
        const userProfile = await fetchProfile(session.user.id);
        setProfile(userProfile);
      }

      setLoading(false);
    };

    initAuth();

    // Listen to auth changes
    if (supabaseAuth) {
      const { data: { subscription } } = supabaseAuth.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            setUser(session.user);
            const userProfile = await fetchProfile(session.user.id);
            setProfile(userProfile);
          } else {
            setUser(null);
            setProfile(null);
          }
          setLoading(false);
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    const result = await authSignIn(email, password);
    return { error: result.error };
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    const result = await authSignUp(email, password, displayName);
    return { error: result.error };
  };

  const signOut = async () => {
    await authSignOut();
    setUser(null);
    setProfile(null);
  };

  const signInWithGoogle = async () => {
    const result = await authSignInWithProvider('google');
    return { error: result.error };
  };

  const signInWithFacebook = async () => {
    const result = await authSignInWithProvider('facebook');
    return { error: result.error };
  };

  const resetPassword = async (email: string) => {
    const result = await authResetPassword(email);
    return { error: result.error };
  };

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithFacebook,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
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
