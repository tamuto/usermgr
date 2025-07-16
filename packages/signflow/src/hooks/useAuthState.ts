import { useAuthStore } from '../store/authStore';
import type { AuthState, AuthStatus } from '../types';

export interface UseAuthStateReturn extends AuthState {
  status: AuthStatus;
  session: string | null;
  clearError: () => void;
  reset: () => void;
}

export function useAuthState(): UseAuthStateReturn {
  const {
    isAuthenticated,
    isLoading,
    user,
    error,
    status,
    session,
    clearError,
    reset,
  } = useAuthStore();

  return {
    isAuthenticated,
    isLoading,
    user,
    error,
    status,
    session,
    clearError,
    reset,
  };
}