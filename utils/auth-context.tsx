/**
 * Authentication Context & Provider
 * Manages global authentication state
 */

import React, { createContext, useCallback, useEffect, useState } from 'react';
import {
  AuthContextType,
  User,
  SignUpPayload,
  SignInPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from '@/types/auth';
import {
  saveToken,
  saveRefreshToken,
  getToken,
  getUser,
  saveUser,
  clearAuthData,
} from './token-storage';
import {
  authSignUp,
  authSignIn,
  authForgotPassword,
  authResetPassword,
  authVerifyToken,
} from './api-client';
import { parseAuthError } from './validation';

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

  // Restore token on app launch
  const restoreToken = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = await getToken();

      if (token) {
        // Try to verify token is still valid
        try {
          const response = await authVerifyToken();
          if (response.success && response.user) {
            setUser(response.user);
          } else {
            // Token invalid, clear it
            await clearAuthData();
            setUser(null);
          }
        } catch (err) {
          // Token verification failed, clear auth data
          await clearAuthData();
          setUser(null);
        }
      }
    } catch (err) {
      console.error('Token restoration failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize auth on mount
  useEffect(() => {
    restoreToken();
  }, [restoreToken]);

  const signUp = useCallback(async (payload: SignUpPayload) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await authSignUp(payload);

      if (!response.success) {
        throw new Error(response.error || 'Sign up failed');
      }

      if (response.token && response.user) {
        await saveToken(response.token);
        if (response.refreshToken) {
          await saveRefreshToken(response.refreshToken);
        }
        await saveUser(response.user);
        setUser(response.user);
      }
    } catch (err: any) {
      const errorMessage = parseAuthError(err);
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

      const response = await authSignIn(payload);

      if (!response.success) {
        throw new Error(response.error || 'Sign in failed');
      }

      if (response.token && response.user) {
        await saveToken(response.token);
        if (response.refreshToken) {
          await saveRefreshToken(response.refreshToken);
        }
        await saveUser(response.user);
        setUser(response.user);
      }
    } catch (err: any) {
      const errorMessage = parseAuthError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setError(null);
      await clearAuthData();
      setUser(null);
    } catch (err: any) {
      const errorMessage = parseAuthError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const forgotPassword = useCallback(async (payload: ForgotPasswordPayload) => {
    try {
      setError(null);
      const response = await authForgotPassword(payload.email);

      if (!response.success) {
        throw new Error(response.error || 'Failed to send reset email');
      }
    } catch (err: any) {
      const errorMessage = parseAuthError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const resetPassword = useCallback(async (payload: ResetPasswordPayload) => {
    try {
      setError(null);
      const response = await authResetPassword(payload.token, payload.newPassword);

      if (!response.success) {
        throw new Error(response.error || 'Failed to reset password');
      }
    } catch (err: any) {
      const errorMessage = parseAuthError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
