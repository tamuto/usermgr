import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CognitoAuthProvider } from '../CognitoAuthProvider';
import type { SignFlowConfig } from '../../types';

// AWS SDK のモック
const mockSend = vi.fn();
const mockCognitoClient = {
  send: mockSend,
};

vi.mock('@aws-sdk/client-cognito-identity-provider', () => ({
  CognitoIdentityProviderClient: vi.fn(() => mockCognitoClient),
  InitiateAuthCommand: vi.fn(),
  SignUpCommand: vi.fn(),
  GetUserCommand: vi.fn(),
  GlobalSignOutCommand: vi.fn(),
  ForgotPasswordCommand: vi.fn(),
  RespondToAuthChallengeCommand: vi.fn(),
  ConfirmSignUpCommand: vi.fn(),
  ConfirmForgotPasswordCommand: vi.fn(),
}));

describe('CognitoAuthProvider', () => {
  let provider: CognitoAuthProvider;
  const config: SignFlowConfig = {
    provider: 'cognito',
    region: 'us-east-1',
    userPoolId: 'us-east-1_testpool',
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new CognitoAuthProvider(config);
  });

  describe('signIn', () => {
    it('should sign in successfully', async () => {
      const mockAuthResult = {
        AuthenticationResult: {
          AccessToken: 'test-access-token',
          RefreshToken: 'test-refresh-token',
          IdToken: 'test-id-token',
        },
      };

      const mockUserResult = {
        Username: 'test-user',
        UserAttributes: [
          { Name: 'email', Value: 'test@example.com' },
          { Name: 'name', Value: 'Test User' },
        ],
      };

      mockSend
        .mockResolvedValueOnce(mockAuthResult)
        .mockResolvedValueOnce(mockUserResult);

      const result = await provider.signIn({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({
        id: 'test-user',
        email: 'test@example.com',
        attributes: {
          email: 'test@example.com',
          name: 'Test User',
        },
      });
      expect(mockSend).toHaveBeenCalledTimes(2);
    });

    it('should handle MFA challenge', async () => {
      const mockMFAResult = {
        ChallengeName: 'SOFTWARE_TOKEN_MFA',
        Session: 'test-session',
      };

      mockSend.mockResolvedValueOnce(mockMFAResult);

      await expect(
        provider.signIn({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toMatchObject({
        code: 'MFA_REQUIRED',
        message: 'Multi-factor authentication required',
        details: {
          challengeName: 'SOFTWARE_TOKEN_MFA',
          session: 'test-session',
        },
      });
    });

    it('should handle sign in failure', async () => {
      mockSend.mockRejectedValueOnce(new Error('Invalid credentials'));

      await expect(
        provider.signIn({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toMatchObject({
        message: 'Invalid credentials',
      });
    });
  });

  describe('signUp', () => {
    it('should sign up successfully', async () => {
      const mockSignUpResult = {
        UserSub: 'test-user-sub',
      };

      mockSend.mockResolvedValueOnce(mockSignUpResult);

      await expect(
        provider.signUp({
          email: 'test@example.com',
          password: 'password123',
          attributes: {
            name: 'Test User',
          },
        })
      ).resolves.toBeUndefined();

      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should handle sign up failure', async () => {
      mockSend.mockRejectedValueOnce(new Error('User already exists'));

      await expect(
        provider.signUp({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toMatchObject({
        message: 'User already exists',
      });
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      // 最初にサインインしてアクセストークンを設定
      const mockAuthResult = {
        AuthenticationResult: {
          AccessToken: 'test-access-token',
          RefreshToken: 'test-refresh-token',
        },
      };

      const mockUserResult = {
        Username: 'test-user',
        UserAttributes: [
          { Name: 'email', Value: 'test@example.com' },
        ],
      };

      mockSend
        .mockResolvedValueOnce(mockAuthResult)
        .mockResolvedValueOnce(mockUserResult)
        .mockResolvedValueOnce({}); // signOut

      await provider.signIn({
        email: 'test@example.com',
        password: 'password123',
      });

      await expect(provider.signOut()).resolves.toBeUndefined();
      expect(mockSend).toHaveBeenCalledTimes(3);
    });

    it('should handle sign out without access token', async () => {
      await expect(provider.signOut()).resolves.toBeUndefined();
      expect(mockSend).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      mockSend.mockResolvedValueOnce({});

      await expect(
        provider.resetPassword({
          email: 'test@example.com',
        })
      ).resolves.toBeUndefined();

      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should handle reset password failure', async () => {
      mockSend.mockRejectedValueOnce(new Error('User not found'));

      await expect(
        provider.resetPassword({
          email: 'nonexistent@example.com',
        })
      ).rejects.toMatchObject({
        message: 'User not found',
      });
    });
  });

  describe('getCurrentUser', () => {
    it('should return null when no access token', async () => {
      const result = await provider.getCurrentUser();
      expect(result).toBeNull();
    });

    it('should return user when access token exists', async () => {
      // 最初にサインインしてアクセストークンを設定
      const mockAuthResult = {
        AuthenticationResult: {
          AccessToken: 'test-access-token',
          RefreshToken: 'test-refresh-token',
        },
      };

      const mockUserResult = {
        Username: 'test-user',
        UserAttributes: [
          { Name: 'email', Value: 'test@example.com' },
        ],
      };

      mockSend
        .mockResolvedValueOnce(mockAuthResult)
        .mockResolvedValueOnce(mockUserResult)
        .mockResolvedValueOnce(mockUserResult); // getCurrentUser

      await provider.signIn({
        email: 'test@example.com',
        password: 'password123',
      });

      const result = await provider.getCurrentUser();
      expect(result).toEqual({
        id: 'test-user',
        email: 'test@example.com',
        attributes: {
          email: 'test@example.com',
        },
      });
    });
  });
});