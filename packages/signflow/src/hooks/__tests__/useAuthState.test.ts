import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { useAuthState } from '../useAuthState';
import { useAuthStore } from '../../store/authStore';
import { mockUser, mockError } from '../../test/testUtils';

// Zustand store のモック
vi.mock('../../store/authStore');

const mockUseAuthStore = useAuthStore as ReturnType<typeof vi.mocked<typeof useAuthStore>>;

describe('useAuthState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial auth state', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: null,
      status: 'idle',
      session: null,
      clearError: vi.fn(),
      reset: vi.fn(),
      setLoading: vi.fn(),
      setAuthenticated: vi.fn(),
      setUnauthenticated: vi.fn(),
      setError: vi.fn(),
      setMFARequired: vi.fn(),
      setPasswordResetRequired: vi.fn(),
    });

    const { result } = renderHook(() => useAuthState());

    expect(result.current).toEqual({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: null,
      status: 'idle',
      session: null,
      clearError: expect.any(Function),
      reset: expect.any(Function),
    });
  });

  it('should return authenticated state', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: mockUser,
      error: null,
      status: 'authenticated',
      session: null,
      clearError: vi.fn(),
      reset: vi.fn(),
      setLoading: vi.fn(),
      setAuthenticated: vi.fn(),
      setUnauthenticated: vi.fn(),
      setError: vi.fn(),
      setMFARequired: vi.fn(),
      setPasswordResetRequired: vi.fn(),
    });

    const { result } = renderHook(() => useAuthState());

    expect(result.current).toEqual({
      isAuthenticated: true,
      isLoading: false,
      user: mockUser,
      error: null,
      status: 'authenticated',
      session: null,
      clearError: expect.any(Function),
      reset: expect.any(Function),
    });
  });

  it('should return error state', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: mockError,
      status: 'error',
      session: null,
      clearError: vi.fn(),
      reset: vi.fn(),
      setLoading: vi.fn(),
      setAuthenticated: vi.fn(),
      setUnauthenticated: vi.fn(),
      setError: vi.fn(),
      setMFARequired: vi.fn(),
      setPasswordResetRequired: vi.fn(),
    });

    const { result } = renderHook(() => useAuthState());

    expect(result.current).toEqual({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: mockError,
      status: 'error',
      session: null,
      clearError: expect.any(Function),
      reset: expect.any(Function),
    });
  });

  it('should return loading state', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
      error: null,
      status: 'loading',
      session: null,
      clearError: vi.fn(),
      reset: vi.fn(),
      setLoading: vi.fn(),
      setAuthenticated: vi.fn(),
      setUnauthenticated: vi.fn(),
      setError: vi.fn(),
      setMFARequired: vi.fn(),
      setPasswordResetRequired: vi.fn(),
    });

    const { result } = renderHook(() => useAuthState());

    expect(result.current).toEqual({
      isAuthenticated: false,
      isLoading: true,
      user: null,
      error: null,
      status: 'loading',
      session: null,
      clearError: expect.any(Function),
      reset: expect.any(Function),
    });
  });

  it('should return MFA required state', () => {
    const mockSession = 'test-session';
    
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: null,
      status: 'mfa_required',
      session: mockSession,
      clearError: vi.fn(),
      reset: vi.fn(),
      setLoading: vi.fn(),
      setAuthenticated: vi.fn(),
      setUnauthenticated: vi.fn(),
      setError: vi.fn(),
      setMFARequired: vi.fn(),
      setPasswordResetRequired: vi.fn(),
    });

    const { result } = renderHook(() => useAuthState());

    expect(result.current).toEqual({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: null,
      status: 'mfa_required',
      session: mockSession,
      clearError: expect.any(Function),
      reset: expect.any(Function),
    });
  });
});