import { useState, useEffect, useCallback } from 'react';

export interface User {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'user';
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface LoginCredentials {
  identifier: string;
  password: string;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Check if user is authenticated on mount
  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        credentials: 'include', // Include cookies
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setAuthState({
            user: data.user,
            isLoading: false,
            isAuthenticated: true,
          });
          return;
        }
      }

      // Not authenticated
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials): Promise<{
    success: boolean;
    message: string;
    user?: User;
  }> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.success && data.user) {
        setAuthState({
          user: data.user,
          isLoading: false,
          isAuthenticated: true,
        });

        return {
          success: true,
          message: data.message || 'Login successful',
          user: data.user,
        };
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });

        return {
          success: false,
          message: data.message || 'Login failed',
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });

      return {
        success: false,
        message: 'Network error occurred',
      };
    }
  }, []);

  // Logout function
  const logout = useCallback(async (): Promise<{
    success: boolean;
    message: string;
  }> => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Include cookies
      });

      const data = await response.json();

      // Always clear local state regardless of API response
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });

      return {
        success: data.success || true,
        message: data.message || 'Logged out successfully',
      };
    } catch (error) {
      console.error('Logout error:', error);

      // Still clear local state
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });

      return {
        success: true,
        message: 'Logged out successfully',
      };
    }
  }, []);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    ...authState,
    login,
    logout,
    checkAuth,
  };
}
