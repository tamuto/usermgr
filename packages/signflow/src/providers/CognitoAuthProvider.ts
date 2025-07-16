import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  GetUserCommand,
  GlobalSignOutCommand,
  RespondToAuthChallengeCommand,
  InitiateAuthCommandOutput,
  SignUpCommandOutput,
  GetUserCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { BaseAuthProvider } from './BaseAuthProvider';
import type { 
  User, 
  SignInOptions, 
  SignUpOptions, 
  PasswordResetOptions, 
  MFAOptions,
  SignFlowConfig
} from '../types';

export class CognitoAuthProvider extends BaseAuthProvider {
  private client: CognitoIdentityProviderClient;
  private accessToken: string | null = null;
  private refreshTokenValue: string | null = null;

  constructor(config: SignFlowConfig) {
    super(config);
    this.client = new CognitoIdentityProviderClient({
      region: config.region,
    });
  }

  async signIn(options: SignInOptions): Promise<User> {
    try {
      const command = new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: this.config.clientId,
        AuthParameters: {
          USERNAME: options.email,
          PASSWORD: options.password,
          ...(this.config.clientSecret && {
            SECRET_HASH: this.calculateSecretHash(options.email),
          }),
        },
      });

      const response: InitiateAuthCommandOutput = await this.client.send(command);

      if (response.ChallengeName) {
        // MFA challenge required
        throw this.createError(
          'MFA_REQUIRED',
          'Multi-factor authentication required',
          { 
            challengeName: response.ChallengeName,
            session: response.Session,
          }
        );
      }

      if (!response.AuthenticationResult) {
        throw this.createError('SIGN_IN_FAILED', 'Authentication failed');
      }

      const { AccessToken, RefreshToken, IdToken } = response.AuthenticationResult;
      
      if (!AccessToken || !RefreshToken) {
        throw this.createError('SIGN_IN_FAILED', 'Invalid authentication response');
      }

      this.accessToken = AccessToken;
      this.refreshTokenValue = RefreshToken;

      // Get user details
      const user = await this.getCurrentUser();
      if (!user) {
        throw this.createError('SIGN_IN_FAILED', 'Failed to get user details');
      }

      return user;
    } catch (error: any) {
      if (error.code) {
        throw error;
      }
      throw this.createError(
        error.name || 'SIGN_IN_FAILED',
        error.message || 'Sign in failed',
        error
      );
    }
  }

  async signUp(options: SignUpOptions): Promise<void> {
    try {
      const command = new SignUpCommand({
        ClientId: this.config.clientId,
        Username: options.email,
        Password: options.password,
        UserAttributes: Object.entries(options.attributes || {}).map(([key, value]) => ({
          Name: key,
          Value: String(value),
        })),
        ...(this.config.clientSecret && {
          SecretHash: this.calculateSecretHash(options.email),
        }),
      });

      const response: SignUpCommandOutput = await this.client.send(command);
      
      if (!response.UserSub) {
        throw this.createError('SIGN_UP_FAILED', 'Sign up failed');
      }
    } catch (error: any) {
      throw this.createError(
        error.name || 'SIGN_UP_FAILED',
        error.message || 'Sign up failed',
        error
      );
    }
  }

  async signOut(): Promise<void> {
    try {
      if (this.accessToken) {
        const command = new GlobalSignOutCommand({
          AccessToken: this.accessToken,
        });
        await this.client.send(command);
      }
    } catch (error: any) {
      // Log but don't throw - sign out should always succeed locally
      console.warn('Sign out error:', error);
    } finally {
      this.accessToken = null;
      this.refreshTokenValue = null;
    }
  }

  async resetPassword(options: PasswordResetOptions): Promise<void> {
    try {
      const command = new ForgotPasswordCommand({
        ClientId: this.config.clientId,
        Username: options.email,
        ...(this.config.clientSecret && {
          SecretHash: this.calculateSecretHash(options.email),
        }),
      });

      await this.client.send(command);
    } catch (error: any) {
      throw this.createError(
        error.name || 'PASSWORD_RESET_FAILED',
        error.message || 'Password reset failed',
        error
      );
    }
  }

  async confirmMFA(options: MFAOptions): Promise<User> {
    try {
      const command = new RespondToAuthChallengeCommand({
        ClientId: this.config.clientId,
        ChallengeName: 'SOFTWARE_TOKEN_MFA',
        Session: options.session,
        ChallengeResponses: {
          SOFTWARE_TOKEN_MFA_CODE: options.challengeResponse,
        },
      });

      const response = await this.client.send(command);

      if (!response.AuthenticationResult) {
        throw this.createError('MFA_FAILED', 'MFA confirmation failed');
      }

      const { AccessToken, RefreshToken } = response.AuthenticationResult;
      
      if (!AccessToken || !RefreshToken) {
        throw this.createError('MFA_FAILED', 'Invalid MFA response');
      }

      this.accessToken = AccessToken;
      this.refreshTokenValue = RefreshToken;

      const user = await this.getCurrentUser();
      if (!user) {
        throw this.createError('MFA_FAILED', 'Failed to get user details');
      }

      return user;
    } catch (error: any) {
      if (error.code) {
        throw error;
      }
      throw this.createError(
        error.name || 'MFA_FAILED',
        error.message || 'MFA confirmation failed',
        error
      );
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.accessToken) {
      return null;
    }

    try {
      const command = new GetUserCommand({
        AccessToken: this.accessToken,
      });

      const response: GetUserCommandOutput = await this.client.send(command);

      if (!response.Username) {
        return null;
      }

      const attributes: Record<string, any> = {};
      response.UserAttributes?.forEach(attr => {
        if (attr.Name && attr.Value) {
          attributes[attr.Name] = attr.Value;
        }
      });

      return {
        id: response.Username,
        email: attributes.email || response.Username,
        attributes,
      };
    } catch (error: any) {
      console.warn('Get current user error:', error);
      return null;
    }
  }

  async refreshToken(): Promise<string> {
    if (!this.refreshTokenValue) {
      throw this.createError('REFRESH_FAILED', 'No refresh token available');
    }

    try {
      const command = new InitiateAuthCommand({
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        ClientId: this.config.clientId,
        AuthParameters: {
          REFRESH_TOKEN: this.refreshTokenValue,
        },
      });

      const response = await this.client.send(command);

      if (!response.AuthenticationResult?.AccessToken) {
        throw this.createError('REFRESH_FAILED', 'Token refresh failed');
      }

      this.accessToken = response.AuthenticationResult.AccessToken;
      return this.accessToken;
    } catch (error: any) {
      throw this.createError(
        error.name || 'REFRESH_FAILED',
        error.message || 'Token refresh failed',
        error
      );
    }
  }

  private calculateSecretHash(username: string): string {
    if (!this.config.clientSecret) {
      throw new Error('Client secret is required for secret hash calculation');
    }

    const crypto = require('crypto');
    return crypto
      .createHmac('sha256', this.config.clientSecret)
      .update(username + this.config.clientId)
      .digest('base64');
  }
}