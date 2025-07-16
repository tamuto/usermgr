import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AuthState, User, SignFlowError, AuthStatus } from '../types';

interface AuthStore extends AuthState {
  status: AuthStatus;
  session: string | null;
  
  // Actions
  setLoading: (loading: boolean) => void;
  setAuthenticated: (user: User) => void;
  setUnauthenticated: () => void;
  setError: (error: SignFlowError) => void;
  setMFARequired: (session: string) => void;
  setPasswordResetRequired: () => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  error: null,
  status: 'idle' as AuthStatus,
  session: null,
};

export const useAuthStore = create<AuthStore>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      setLoading: (loading: boolean) => {
        set({ 
          isLoading: loading, 
          status: loading ? 'loading' : get().status,
          error: null 
        });
      },
      
      setAuthenticated: (user: User) => {
        set({
          isAuthenticated: true,
          isLoading: false,
          user,
          error: null,
          status: 'authenticated',
          session: null,
        });
      },
      
      setUnauthenticated: () => {
        set({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          error: null,
          status: 'unauthenticated',
          session: null,
        });
      },
      
      setError: (error: SignFlowError) => {
        set({
          isLoading: false,
          error,
          status: 'error',
        });
      },
      
      setMFARequired: (session: string) => {
        set({
          isLoading: false,
          session,
          status: 'mfa_required',
          error: null,
        });
      },
      
      setPasswordResetRequired: () => {
        set({
          isLoading: false,
          status: 'password_reset_required',
          error: null,
        });
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'signflow-auth',
    }
  )
);