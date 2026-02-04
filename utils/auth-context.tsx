/**
 * Authentication Context & Provider - Supabase Version
 */

import { AuthContextType, SignInPayload, SignUpPayload, User } from '@/types/auth';
import { Session } from '@supabase/supabase-js';
import React, { createContext, useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Convert Supabase user to our User type
  const mapSupabaseUser = (session: Session | null): User | null => {
    if (!session?.user) return null;

    return {
      id: session.user.id,
      email: session.user.email || '',
      name: session.user.user_metadata?.name || '',
      jlptLevel: session.user.user_metadata?.jlpt_level || 'N5',
      avatarUrl: session.user.user_metadata?.avatar_url || null,
      createdAt: session.user.created_at || new Date().toISOString(),
    };
  };

  // Initialize auth session
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(mapSupabaseUser(session));
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapSupabaseUser(session));
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (payload: SignUpPayload) => {
    try {
      setError(null);
      setIsLoading(true);

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: payload.email,
        password: payload.password,
        options: {
          data: {
            name: payload.name,
            jlpt_level: payload.jlptLevel || 'N5',
          },
        },
      });

      if (signUpError) throw signUpError;

      // ✅ No manual insert needed - the database trigger handles it!
      // The handle_new_user() trigger automatically creates records in:
      // - public.users
      // - public.user_stats

      setUser(mapSupabaseUser(data.session));
    } catch (err: any) {
      const errorMessage = err.message || 'Sign up failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signIn = useCallback(async (payload: SignInPayload) => {
    try {
      setError(null);
      setIsLoading(true);

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: payload.email,
        password: payload.password,
      });

      if (signInError) throw signInError;

      setUser(mapSupabaseUser(data.session));
    } catch (err: any) {
      const errorMessage = err.message || 'Sign in failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setError(null);
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      setUser(null);
    } catch (err: any) {
      const errorMessage = err.message || 'Sign out failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const forgotPassword = useCallback(async ({ email }: { email: string }) => {
    try {
      setError(null);
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'koji://reset-password',
      });
      if (resetError) throw resetError;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to send reset email';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const resetPassword = useCallback(async ({ token, newPassword }: { token: string; newPassword: string }) => {
    try {
      setError(null);
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) throw updateError;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to reset password';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const restoreToken = useCallback(async () => {
    // Not needed - Supabase handles this automatically
  }, []);

  const isSignedIn = !!user;

  const value: AuthContextType = {
    user,
    isLoading,
    isSignedIn,
    signUp,
    signIn,
    signOut,
    forgotPassword,
    resetPassword,
    restoreToken,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};