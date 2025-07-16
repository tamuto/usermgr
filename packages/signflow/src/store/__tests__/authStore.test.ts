import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../authStore';
import { act, renderHook } from '@testing-library/react';

describe('authStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { reset } = useAuthStore.getState();
    reset();
  });

  it('should have initial state', () => {
    const { result } = renderHook(() => useAuthStore());
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.status).toBe('idle');
    expect(result.current.session).toBeNull();
  });

  it('should set loading state', () => {
    const { result } = renderHook(() => useAuthStore());
    
    act(() => {
      result.current.setLoading(true);
    });
    
    expect(result.current.isLoading).toBe(true);
    expect(result.current.status).toBe('loading');
    expect(result.current.error).toBeNull();
  });

  it('should set authenticated state', () => {
    const { result } = renderHook(() => useAuthStore());
    const mockUser = {
      id: 'test-user',
      email: 'test@example.com',
      attributes: { name: 'Test User' },
    };
    
    act(() => {
      result.current.setAuthenticated(mockUser);
    });
    
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.error).toBeNull();
    expect(result.current.status).toBe('authenticated');
    expect(result.current.session).toBeNull();
  });

  it('should set unauthenticated state', () => {
    const { result } = renderHook(() => useAuthStore());
    
    // First set authenticated
    act(() => {
      result.current.setAuthenticated({
        id: 'test-user',
        email: 'test@example.com',
        attributes: {},
      });
    });
    
    // Then set unauthenticated
    act(() => {
      result.current.setUnauthenticated();
    });
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.status).toBe('unauthenticated');
    expect(result.current.session).toBeNull();
  });

  it('should set error state', () => {
    const { result } = renderHook(() => useAuthStore());
    const mockError = {
      code: 'TEST_ERROR',
      message: 'Test error message',
    };
    
    act(() => {
      result.current.setError(mockError);
    });
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toEqual(mockError);
    expect(result.current.status).toBe('error');
  });

  it('should set MFA required state', () => {
    const { result } = renderHook(() => useAuthStore());
    const mockSession = 'test-session';
    
    act(() => {
      result.current.setMFARequired(mockSession);
    });
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.session).toBe(mockSession);
    expect(result.current.status).toBe('mfa_required');
    expect(result.current.error).toBeNull();
  });

  it('should set password reset required state', () => {
    const { result } = renderHook(() => useAuthStore());
    
    act(() => {
      result.current.setPasswordResetRequired();
    });
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.status).toBe('password_reset_required');
    expect(result.current.error).toBeNull();
  });

  it('should clear error', () => {
    const { result } = renderHook(() => useAuthStore());
    const mockError = {
      code: 'TEST_ERROR',
      message: 'Test error message',
    };
    
    // First set error
    act(() => {
      result.current.setError(mockError);
    });
    
    expect(result.current.error).toEqual(mockError);
    
    // Then clear error
    act(() => {
      result.current.clearError();
    });
    
    expect(result.current.error).toBeNull();
  });

  it('should reset to initial state', () => {
    const { result } = renderHook(() => useAuthStore());
    
    // Set some state
    act(() => {
      result.current.setAuthenticated({
        id: 'test-user',
        email: 'test@example.com',
        attributes: {},
      });
    });
    
    expect(result.current.isAuthenticated).toBe(true);
    
    // Reset
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.status).toBe('idle');
    expect(result.current.session).toBeNull();
  });

  it('should handle state transitions correctly', () => {
    const { result } = renderHook(() => useAuthStore());
    
    // Loading -> Error
    act(() => {
      result.current.setLoading(true);
    });
    expect(result.current.status).toBe('loading');
    
    act(() => {
      result.current.setError({
        code: 'AUTH_ERROR',
        message: 'Authentication failed',
      });
    });
    expect(result.current.status).toBe('error');
    expect(result.current.isLoading).toBe(false);
    
    // Error -> Loading -> Authenticated
    act(() => {
      result.current.setLoading(true);
    });
    expect(result.current.status).toBe('loading');
    expect(result.current.error).toBeNull();
    
    act(() => {
      result.current.setAuthenticated({
        id: 'test-user',
        email: 'test@example.com',
        attributes: {},
      });
    });
    expect(result.current.status).toBe('authenticated');
    expect(result.current.isLoading).toBe(false);
  });
});