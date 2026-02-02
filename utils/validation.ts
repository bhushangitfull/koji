/**
 * Form Validation Utilities
 * Email, password, and name validators with zod
 */

/**
 * Validate email format
 */
export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email address' };
  }
  return { valid: true };
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): { valid: boolean; error?: string } => {
  if (!password) {
    return { valid: false, error: 'Password is required' };
  }
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain an uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain a lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain a number' };
  }
  return { valid: true };
};

/**
 * Validate name
 */
export const validateName = (name: string): { valid: boolean; error?: string } => {
  if (!name) {
    return { valid: false, error: 'Name is required' };
  }
  if (name.trim().length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }
  if (name.length > 50) {
    return { valid: false, error: 'Name must be less than 50 characters' };
  }
  return { valid: true };
};

/**
 * Validate confirm password matches password
 */
export const validatePasswordMatch = (
  password: string,
  confirmPassword: string
): { valid: boolean; error?: string } => {
  if (password !== confirmPassword) {
    return { valid: false, error: 'Passwords do not match' };
  }
  return { valid: true };
};

/**
 * Validate sign-in form
 */
export const validateSignIn = (
  email: string,
  password: string
): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    errors.email = emailValidation.error || 'Invalid email';
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  return { valid: Object.keys(errors).length === 0, errors };
};

/**
 * Validate sign-up form
 */
export const validateSignUp = (
  email: string,
  password: string,
  confirmPassword: string,
  name: string
): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  const nameValidation = validateName(name);
  if (!nameValidation.valid) {
    errors.name = nameValidation.error || 'Invalid name';
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    errors.email = emailValidation.error || 'Invalid email';
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    errors.password = passwordValidation.error || 'Invalid password';
  }

  const matchValidation = validatePasswordMatch(password, confirmPassword);
  if (!matchValidation.valid) {
    errors.confirmPassword = matchValidation.error || 'Passwords do not match';
  }

  return { valid: Object.keys(errors).length === 0, errors };
};

/**
 * Parse API error response
 */
export const parseAuthError = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.message) {
    return error.message;
  }

  if (error?.error) {
    return error.error;
  }

  return 'An unexpected error occurred. Please try again.';
};
