import type { 
  SignFlowConfig, 
  User, 
  SignInOptions, 
  SignUpOptions, 
  PasswordResetOptions, 
  MFAOptions,
  SignFlowError 
} from '../types';

export abstract class BaseAuthProvider {
  protected config: SignFlowConfig;
  
  constructor(config: SignFlowConfig) {
    this.config = config;
  }

  abstract signIn(options: SignInOptions): Promise<User>;
  abstract signUp(options: SignUpOptions): Promise<void>;
  abstract signOut(): Promise<void>;
  abstract resetPassword(options: PasswordResetOptions): Promise<void>;
  abstract confirmMFA(options: MFAOptions): Promise<User>;
  abstract getCurrentUser(): Promise<User | null>;
  abstract refreshToken(): Promise<string>;
  
  protected createError(code: string, message: string, details?: any): SignFlowError {
    return {
      code,
      message,
      details,
    };
  }
}