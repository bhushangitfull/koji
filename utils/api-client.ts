/**
 * API Client with Authentication
 * Handles all API calls with automatic token injection
 */

import { getToken } from './token-storage';
import { AuthResponse, SignUpPayload, SignInPayload } from '@/types/auth';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

interface ApiRequestOptions extends RequestInit {
  requireAuth?: boolean;
}

/**
 * Make API request with auth token
 */
export const apiRequest = async <T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> => {
  const { requireAuth = false, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  // Add auth token if required
  if (requireAuth) {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    headers.Authorization = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        data,
        message: data?.message || data?.error || 'Request failed',
      };
    }

    return data;
  } catch (error: any) {
    // Re-throw API errors
    if (error.status !== undefined) {
      throw error;
    }

    // Network or parsing errors
    throw {
      status: 0,
      message: error?.message || 'Network error',
    };
  }
};

/**
 * Sign up
 */
export const authSignUp = async (payload: SignUpPayload): Promise<AuthResponse> => {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/**
 * Sign in
 */
export const authSignIn = async (payload: SignInPayload): Promise<AuthResponse> => {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/**
 * Request password reset
 */
export const authForgotPassword = async (email: string): Promise<AuthResponse> => {
  return apiRequest<AuthResponse>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

/**
 * Reset password with token
 */
export const authResetPassword = async (
  token: string,
  newPassword: string
): Promise<AuthResponse> => {
  return apiRequest<AuthResponse>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
};

/**
 * Verify token validity
 */
export const authVerifyToken = async (): Promise<AuthResponse> => {
  return apiRequest<AuthResponse>('/auth/verify', {
    method: 'GET',
    requireAuth: true,
  });
};

/**
 * Refresh authentication token
 */
export const authRefreshToken = async (refreshToken: string): Promise<AuthResponse> => {
  return apiRequest<AuthResponse>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
};
