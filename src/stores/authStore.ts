"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
  username: string;
  role: "admin" | "user";
}

interface LoginCredentials {
  identifier: string;
  password: string;
}

interface AuthState {
  // State
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  setLoading: (loading: boolean) => void;
  setUser: (user: User | null) => void;
  checkAuth: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<{
    success: boolean;
    message: string;
    user?: User;
  }>;
  logout: () => Promise<{
    success: boolean;
    message: string;
  }>;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isLoading: true,
      isAuthenticated: false,

      // Actions
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        });
      },

      clearAuth: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      // Check authentication status
      checkAuth: async () => {
        try {
          set({ isLoading: true });

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
              set({
                user: data.user,
                isLoading: false,
                isAuthenticated: true,
              });
              return;
            }
          }

          // Not authenticated
          set({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
        } catch (error) {
          console.error("Auth check failed:", error);
          set({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      },

      // Login function
      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true });

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

            set({
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
            set({
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
          set({
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

      // Logout function
      logout: async () => {
        try {
          const response = await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include", // Include cookies
          });

          const data = await response.json();

          // Always clear local state regardless of API response
          set({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });

          // Clear localStorage token
          localStorage.removeItem("auth-token");

          return {
            success: data.success || true,
            message: data.message || "Logged out successfully",
          };
        } catch (error) {
          console.error("Logout error:", error);

          // Still clear local state
          set({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });

          // Clear localStorage token
          localStorage.removeItem("auth-token");

          return {
            success: true,
            message: "Logged out successfully",
          };
        }
      },
    }),
    {
      name: "auth-storage", // unique name
      storage: createJSONStorage(() => sessionStorage), // use sessionStorage instead of localStorage
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }), // only persist user and isAuthenticated, not isLoading
    }
  )
);

// Initialize auth check on store creation (client-side only)
if (typeof window !== "undefined") {
  // Delay initial auth check to avoid hydration issues
  setTimeout(() => {
    useAuthStore.getState().checkAuth();
  }, 0);
}
