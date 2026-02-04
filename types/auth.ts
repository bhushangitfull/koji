export interface User {
  id: string;
  email: string;
  name: string;
  jlptLevel?: string;
  avatarUrl?: string | null;
  createdAt?: string;
}

export interface SignUpPayload {
  email: string;
  password: string;
  name: string;
  jlptLevel?: string;
}

export interface SignInPayload {
  email: string;
  password: string;
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