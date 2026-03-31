'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  setCredentials,
  setLoading,
  setError,
  clearError,
  logout as logoutAction,
} from '@/store/authSlice';
import { api } from '@/lib/api';
import { setAccessToken, clearTokens, getTokenPayload } from '@/lib/auth';
import { User } from '@/types';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, accessToken, isLoading, error } = useAppSelector((s) => s.auth);

  const register = useCallback(
    async (email: string, username: string, password: string) => {
      dispatch(setLoading(true));
      dispatch(clearError());
      try {
        await api.post('/api/auth/register', { email, username, password }, { skipAuth: true });
        dispatch(setLoading(false));
        return { success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Registration failed';
        dispatch(setError(msg));
        return { success: false, error: msg };
      }
    },
    [dispatch]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      dispatch(setLoading(true));
      dispatch(clearError());
      try {
        const data = await api.post<{
          accessToken: string;
          user: User;
        }>('/api/auth/login', { email, password }, { skipAuth: true });

        setAccessToken(data.accessToken);
        dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
        dispatch(setLoading(false));
        router.push('/chat');
        return { success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Login failed';
        dispatch(setError(msg));
        return { success: false, error: msg };
      }
    },
    [dispatch, router]
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout', {});
    } finally {
      clearTokens();
      dispatch(logoutAction());
      router.push('/');
    }
  }, [dispatch, router]);

  const forgotPassword = useCallback(
    async (email: string) => {
      try {
        await api.post('/api/auth/forgot-password', { email }, { skipAuth: true });
        return { success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed';
        return { success: false, error: msg };
      }
    },
    []
  );

  const resetPassword = useCallback(
    async (token: string, password: string) => {
      try {
        await api.post('/api/auth/reset-password', { token, password }, { skipAuth: true });
        return { success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Reset failed';
        return { success: false, error: msg };
      }
    },
    []
  );

  // Restore auth state from localStorage on mount
  const restoreSession = useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) return;
    const payload = getTokenPayload(token);
    if (!payload) return;
    // Re-set cookie (may have expired) so middleware can protect routes
    setAccessToken(token);
    dispatch(
      setCredentials({
        accessToken: token,
        user: {
          id: payload.userId,
          email: payload.email,
          username: payload.username,
          isVerified: payload.isVerified,
          createdAt: '',
        },
      })
    );
  }, [dispatch]);

  return {
    user,
    accessToken,
    isLoading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    restoreSession,
    clearError: () => dispatch(clearError()),
  };
}
