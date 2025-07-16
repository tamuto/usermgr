import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { CognitoAuthProvider } from '../providers/CognitoAuthProvider';
import { BaseAuthProvider } from '../providers/BaseAuthProvider';
import { useAuthStore } from '../store/authStore';
import type { SignFlowConfig } from '../types';

interface SignFlowContextType {
  provider: BaseAuthProvider;
  config: SignFlowConfig;
}

const SignFlowContext = createContext<SignFlowContextType | null>(null);

interface SignFlowProviderProps {
  config: SignFlowConfig;
  children: ReactNode;
}

export function SignFlowProvider({ config, children }: SignFlowProviderProps) {
  const { setUnauthenticated, setAuthenticated, setLoading } = useAuthStore();
  
  // Initialize authentication provider
  const provider = React.useMemo(() => {
    switch (config.provider) {
      case 'cognito':
        return new CognitoAuthProvider(config);
      default:
        throw new Error(`Unsupported provider: ${config.provider}`);
    }
  }, [config]);

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const user = await provider.getCurrentUser();
        if (user) {
          setAuthenticated(user);
        } else {
          setUnauthenticated();
        }
      } catch (error) {
        console.warn('Auth check failed:', error);
        setUnauthenticated();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [provider, setAuthenticated, setUnauthenticated, setLoading]);

  const contextValue = React.useMemo(() => ({
    provider,
    config,
  }), [provider, config]);

  return (
    <SignFlowContext.Provider value={contextValue}>
      {children}
    </SignFlowContext.Provider>
  );
}

export function useSignFlowContext(): SignFlowContextType {
  const context = useContext(SignFlowContext);
  if (!context) {
    throw new Error('useSignFlowContext must be used within a SignFlowProvider');
  }
  return context;
}