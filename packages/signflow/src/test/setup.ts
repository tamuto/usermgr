import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock AWS SDK for testing
vi.mock('@aws-sdk/client-cognito-identity-provider', () => ({
  CognitoIdentityProviderClient: vi.fn(() => ({
    send: vi.fn(),
  })),
  InitiateAuthCommand: vi.fn(),
  SignUpCommand: vi.fn(),
  GetUserCommand: vi.fn(),
  GlobalSignOutCommand: vi.fn(),
  ForgotPasswordCommand: vi.fn(),
  RespondToAuthChallengeCommand: vi.fn(),
}));

// Mock crypto for HMAC calculations
Object.defineProperty(global, 'crypto', {
  value: {
    createHmac: vi.fn(() => ({
      update: vi.fn(() => ({
        digest: vi.fn(() => 'mocked-hash'),
      })),
    })),
  },
});

// Mock require for Node.js modules
(global as any).require = vi.fn();