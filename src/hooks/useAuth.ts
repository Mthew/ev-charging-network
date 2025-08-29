"use client";
import { useState, useEffect, useCallback } from "react";

export interface User {
  id: string;
  email: string;
  username: string;
  role: "admin" | "user";
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
      // Get token from localStorage if available
      const token = localStorage.getItem("auth-token");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Add Authorization header if token exists
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("/api/auth/verify", {
        method: "GET",
        credentials: "include", // Include cookies
        headers,
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
      console.error("Auth check failed:", error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  // Login function
  const login = useCallback(
    async (
      credentials: LoginCredentials
    ): Promise<{
      success: boolean;
      message: string;
      user?: User;
    }> => {
      try {
        setAuthState((prev) => ({ ...prev, isLoading: true }));

        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Include cookies
          body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (data.success && data.user) {
          console.log("Login response successful, checking cookies...");
          console.log("Cookies after login:", document.cookie);
          console.log(
            "Auth token present after login:",
            document.cookie.includes("auth-token")
          );

          // Fallback: If server cookie wasn't set and we have token in response, set it manually
          if (!document.cookie.includes("auth-token") && data.token) {
            console.log("Setting auth token manually via JavaScript...");

            // Try multiple approaches to set the cookie
            const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds

            // Approach 1: Simple cookie
            document.cookie = `auth-token=${data.token}; path=/; max-age=${maxAge}`;

            // Approach 2: With SameSite
            document.cookie = `auth-token=${data.token}; path=/; max-age=${maxAge}; SameSite=Lax`;

            // Approach 3: Store in localStorage as backup
            localStorage.setItem("auth-token", data.token);

            console.log(
              "Manual cookie set, checking again:",
              document.cookie.includes("auth-token")
            );
            console.log(
              "Token stored in localStorage:",
              !!localStorage.getItem("auth-token")
            );
          }

          setAuthState({
            user: data.user,
            isLoading: false,
            isAuthenticated: true,
          });

          return {
            success: true,
            message: data.message || "Login successful",
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
            message: data.message || "Login failed",
          };
        }
      } catch (error) {
        console.error("Login error:", error);
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });

        return {
          success: false,
          message: "Network error occurred",
        };
      }
    },
    []
  );

  // Logout function
  const logout = useCallback(async (): Promise<{
    success: boolean;
    message: string;
  }> => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include", // Include cookies
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
        message: data.message || "Logged out successfully",
      };
    } catch (error) {
      console.error("Logout error:", error);

      // Still clear local state
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });

      return {
        success: true,
        message: "Logged out successfully",
      };
    }
  }, []);

  // Check authentication on mount
  useEffect(() => {
    // Debug: Check if auth token is available in browser cookies
    console.log("Browser cookies available:", document.cookie);
    console.log(
      "Auth token in browser cookies:",
      document.cookie.includes("auth-token")
    );

    checkAuth();
  }, [checkAuth]);

  return {
    ...authState,
    login,
    logout,
    checkAuth,
  };
}
