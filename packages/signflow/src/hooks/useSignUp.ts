import { useCallback } from 'react';
import { useSignFlowContext } from '../provider/SignFlowProvider';
import { useAuthStore } from '../store/authStore';
import type { SignUpOptions, SignFlowError } from '../types';

export interface UseSignUpReturn {
  signUp: (options: SignUpOptions) => Promise<void>;
  isLoading: boolean;
  error: SignFlowError | null;
}

export function useSignUp(): UseSignUpReturn {
  const { provider } = useSignFlowContext();
  const { 
    setLoading, 
    setError,
    isLoading, 
    error 
  } = useAuthStore();

  const signUp = useCallback(async (options: SignUpOptions) => {
    setLoading(true);
    
    try {
      await provider.signUp(options);
      // Sign up successful - user needs to confirm email
      // Don't set authenticated state yet
    } catch (error: any) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [provider, setLoading, setError]);

  return {
    signUp,
    isLoading,
    error,
  };
}