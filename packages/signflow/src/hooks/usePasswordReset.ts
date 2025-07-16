import { useCallback } from 'react';
import { useSignFlowContext } from '../provider/SignFlowProvider';
import { useAuthStore } from '../store/authStore';
import type { PasswordResetOptions, SignFlowError } from '../types';

export interface UsePasswordResetReturn {
  resetPassword: (options: PasswordResetOptions) => Promise<void>;
  isLoading: boolean;
  error: SignFlowError | null;
}

export function usePasswordReset(): UsePasswordResetReturn {
  const { provider } = useSignFlowContext();
  const { 
    setLoading, 
    setError,
    isLoading, 
    error 
  } = useAuthStore();

  const resetPassword = useCallback(async (options: PasswordResetOptions) => {
    setLoading(true);
    
    try {
      await provider.resetPassword(options);
      // Password reset email sent successfully
    } catch (error: any) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [provider, setLoading, setError]);

  return {
    resetPassword,
    isLoading,
    error,
  };
}