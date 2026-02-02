/**
 * Authentication Types
 */

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  jlptLevel?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  createdAt?: string;
}

export interface SignUpPayload {
  email: string;
  password: string;
  name: string;
  jlptLevel?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  refreshToken?: string;
  error?: string;
  message?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean;
  signUp: (payload: SignUpPayload) => Promise<void>;
  signIn: (payload: SignInPayload) => Promise<void>;
  signOut: () => Promise<void>;
  forgotPassword: (payload: ForgotPasswordPayload) => Promise<void>;
  resetPassword: (payload: ResetPasswordPayload) => Promise<void>;
  restoreToken: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

export interface AuthError {
  code: string;
  message: string;
  details?: string;
}
