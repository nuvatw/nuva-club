'use client';

import { useAuthContext } from '@/contexts/AuthContext';

/**
 * useAuth hook - thin wrapper around AuthContext
 *
 * This ensures all components use the same auth state
 * from the AuthProvider in the layout.
 */
export function useAuth() {
  return useAuthContext();
}
