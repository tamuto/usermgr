import { useCallback } from 'react';
import { useSignFlowContext } from '../provider/SignFlowProvider';
import { useAuthStore } from '../store/authStore';
import type { MFAOptions, SignFlowError } from '../types';

export interface UseMFAReturn {
  confirmMFA: (options: MFAOptions) => Promise<void>;
  isLoading: boolean;
  error: SignFlowError | null;
  session: string | null;
}

export function useMFA(): UseMFAReturn {
  const { provider } = useSignFlowContext();
  const { 
    setLoading, 
    setAuthenticated,
    setError,
    isLoading, 
    error,
    session
  } = useAuthStore();

  const confirmMFA = useCallback(async (options: MFAOptions) => {
    setLoading(true);
    
    try {
      const user = await provider.confirmMFA(options);
      setAuthenticated(user);
    } catch (error: any) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [provider, setLoading, setAuthenticated, setError]);

  return {
    confirmMFA,
    isLoading,
    error,
    session,
  };
}