import { useCallback } from 'react';
import { useSignFlowContext } from '../provider/SignFlowProvider';
import { useAuthStore } from '../store/authStore';
import type { SignInOptions, SignFlowError } from '../types';

export interface UseSignInReturn {
  signIn: (options: SignInOptions) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  error: SignFlowError | null;
}

export function useSignIn(): UseSignInReturn {
  const { provider } = useSignFlowContext();
  const { 
    setLoading, 
    setAuthenticated, 
    setUnauthenticated, 
    setError,
    setMFARequired,
    isLoading, 
    error 
  } = useAuthStore();

  const signIn = useCallback(async (options: SignInOptions) => {
    setLoading(true);
    
    try {
      const user = await provider.signIn(options);
      setAuthenticated(user);
    } catch (error: any) {
      // Handle MFA required case
      if (error.code === 'MFA_REQUIRED') {
        setMFARequired(error.details.session);
        return;
      }
      
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [provider, setLoading, setAuthenticated, setError, setMFARequired]);

  const signOut = useCallback(async () => {
    setLoading(true);
    
    try {
      await provider.signOut();
      setUnauthenticated();
    } catch (error: any) {
      // Even if sign out fails on server, clear local state
      setUnauthenticated();
      console.warn('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  }, [provider, setLoading, setUnauthenticated]);

  return {
    signIn,
    signOut,
    isLoading,
    error,
  };
}