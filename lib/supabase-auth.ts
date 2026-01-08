import { createClient } from '@supabase/supabase-js';
import type { User, Session, AuthError } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create auth client
export const supabaseAuth = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export type AuthResult = {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
};

// Sign up with email and password
export async function signUp(email: string, password: string, displayName?: string): Promise<AuthResult> {
  if (!supabaseAuth) {
    return { user: null, session: null, error: { message: 'Supabase not configured', name: 'ConfigError', status: 500 } as AuthError };
  }

  const { data, error } = await supabaseAuth.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: displayName || email.split('@')[0],
      },
    },
  });

  return {
    user: data.user,
    session: data.session,
    error,
  };
}

// Sign in with email and password
export async function signIn(email: string, password: string): Promise<AuthResult> {
  if (!supabaseAuth) {
    return { user: null, session: null, error: { message: 'Supabase not configured', name: 'ConfigError', status: 500 } as AuthError };
  }

  const { data, error } = await supabaseAuth.auth.signInWithPassword({
    email,
    password,
  });

  return {
    user: data.user,
    session: data.session,
    error,
  };
}

// Sign in with OAuth provider
export async function signInWithProvider(provider: 'google' | 'facebook'): Promise<{ error: AuthError | null }> {
  if (!supabaseAuth) {
    return { error: { message: 'Supabase not configured', name: 'ConfigError', status: 500 } as AuthError };
  }

  const { error } = await supabaseAuth.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  return { error };
}

// Sign out
export async function signOut(): Promise<{ error: AuthError | null }> {
  if (!supabaseAuth) {
    return { error: { message: 'Supabase not configured', name: 'ConfigError', status: 500 } as AuthError };
  }

  const { error } = await supabaseAuth.auth.signOut();
  return { error };
}

// Get current session
export async function getSession(): Promise<{ session: Session | null; error: AuthError | null }> {
  if (!supabaseAuth) {
    return { session: null, error: null };
  }

  const { data, error } = await supabaseAuth.auth.getSession();
  return { session: data.session, error };
}

// Get current user
export async function getUser(): Promise<{ user: User | null; error: AuthError | null }> {
  if (!supabaseAuth) {
    return { user: null, error: null };
  }

  const { data, error } = await supabaseAuth.auth.getUser();
  return { user: data.user, error };
}

// Reset password request
export async function resetPassword(email: string): Promise<{ error: AuthError | null }> {
  if (!supabaseAuth) {
    return { error: { message: 'Supabase not configured', name: 'ConfigError', status: 500 } as AuthError };
  }

  const { error } = await supabaseAuth.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  return { error };
}

// Update password
export async function updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
  if (!supabaseAuth) {
    return { error: { message: 'Supabase not configured', name: 'ConfigError', status: 500 } as AuthError };
  }

  const { error } = await supabaseAuth.auth.updateUser({
    password: newPassword,
  });

  return { error };
}

// Listen to auth state changes
export function onAuthStateChange(callback: (user: User | null) => void) {
  if (!supabaseAuth) {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }

  return supabaseAuth.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null);
  });
}
