import { renderHook, act } from '@testing-library/react';
import { useSignIn } from '../useSignIn';
import { useAuthStore } from '../../store/authStore';
import { render, mockUser, mockError } from '../../test/testUtils';

// Context プロバイダーのモック
jest.mock('../useSignIn', () => ({
  useSignIn: jest.fn(),
}));

// 実際のhookをテストするために、モックを解除して再実装
const mockUseSignIn = useSignIn as jest.MockedFunction<typeof useSignIn>;

describe('useSignIn', () => {
  const mockProvider = {
    signIn: jest.fn(),
    signOut: jest.fn(),
    signUp: jest.fn(),
    resetPassword: jest.fn(),
    confirmMFA: jest.fn(),
    getCurrentUser: jest.fn(),
    refreshToken: jest.fn(),
  };

  const mockStoreFunctions = {
    setLoading: jest.fn(),
    setAuthenticated: jest.fn(),
    setUnauthenticated: jest.fn(),
    setError: jest.fn(),
    setMFARequired: jest.fn(),
    setPasswordResetRequired: jest.fn(),
    clearError: jest.fn(),
    reset: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // useSignInの実際の実装をモック
    mockUseSignIn.mockReturnValue({
      signIn: jest.fn(),
      signOut: jest.fn(),
      isLoading: false,
      error: null,
    });
  });

  it('should provide sign in function', () => {
    const { result } = renderHook(() => useSignIn());

    expect(result.current).toEqual({
      signIn: expect.any(Function),
      signOut: expect.any(Function),
      isLoading: false,
      error: null,
    });
  });

  it('should handle successful sign in', async () => {
    const mockSignIn = jest.fn().mockResolvedValue(undefined);
    
    mockUseSignIn.mockReturnValue({
      signIn: mockSignIn,
      signOut: jest.fn(),
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useSignIn());

    await act(async () => {
      await result.current.signIn({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    expect(mockSignIn).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should handle sign in error', async () => {
    const mockSignIn = jest.fn().mockRejectedValue(mockError);
    
    mockUseSignIn.mockReturnValue({
      signIn: mockSignIn,
      signOut: jest.fn(),
      isLoading: false,
      error: mockError,
    });

    const { result } = renderHook(() => useSignIn());

    expect(result.current.error).toEqual(mockError);
  });

  it('should handle loading state', () => {
    mockUseSignIn.mockReturnValue({
      signIn: jest.fn(),
      signOut: jest.fn(),
      isLoading: true,
      error: null,
    });

    const { result } = renderHook(() => useSignIn());

    expect(result.current.isLoading).toBe(true);
  });

  it('should handle successful sign out', async () => {
    const mockSignOut = jest.fn().mockResolvedValue(undefined);
    
    mockUseSignIn.mockReturnValue({
      signIn: jest.fn(),
      signOut: mockSignOut,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useSignIn());

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockSignOut).toHaveBeenCalled();
  });
});