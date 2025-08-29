"use client";
import { useAuthStore } from "@/stores/authStore";

// Re-export types for compatibility
export type { User } from "@/stores/authStore";

interface LoginCredentials {
  identifier: string;
  password: string;
}

/**
 * Hook that provides access to authentication state and methods
 * Now powered by Zustand store for better state management
 */
export function useAuth() {
  // Get state and actions from Zustand store
  const { user, isLoading, isAuthenticated, checkAuth, login, logout } =
    useAuthStore();

  return {
    user,
    isLoading,
    isAuthenticated,
    checkAuth,
    login,
    logout,
  };
}
