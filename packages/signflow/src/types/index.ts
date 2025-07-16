// Core types for SignFlow

export interface SignFlowConfig {
  provider: 'cognito';
  region: string;
  userPoolId: string;
  clientId: string;
  clientSecret?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: SignFlowError | null;
}

export interface User {
  id: string;
  email: string;
  attributes: Record<string, any>;
  groups?: string[];
}

export interface SignInOptions {
  email: string;
  password: string;
}

export interface SignUpOptions {
  email: string;
  password: string;
  attributes?: Record<string, any>;
}

export interface PasswordResetOptions {
  email: string;
}

export interface MFAOptions {
  challengeResponse: string;
  session: string;
}

export interface SignFlowError {
  code: string;
  message: string;
  details?: any;
}

export type AuthStatus = 
  | 'idle'
  | 'loading' 
  | 'authenticated'
  | 'unauthenticated'
  | 'mfa_required'
  | 'password_reset_required'
  | 'error';