/**
 * useAuth Hook
 * Custom hook to use authentication context
 */

import { useContext } from 'react';
import { AuthContext } from '@/utils/auth-context';
import { AuthContextType } from '@/types/auth';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
