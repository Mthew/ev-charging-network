/**
 * Example usage of the Zustand auth store
 *
 * This file demonstrates different ways to use the auth store:
 * 1. Using the useAuth hook (recommended for most cases)
 * 2. Using the store directly (for advanced use cases)
 * 3. Using store outside of React components
 */

import { useAuthStore } from "@/stores/authStore";

// Example 1: Using store outside React components
export function externalAuthCheck() {
  const { isAuthenticated, user } = useAuthStore.getState();

  if (!isAuthenticated) {
    throw new Error("User not authenticated");
  }

  return user;
}

// Example 2: Subscribing to store changes outside React
export function subscribeToAuthChanges() {
  const unsubscribe = useAuthStore.subscribe((state) => {
    console.log("Auth state changed:", state.isAuthenticated);
    console.log("Current user:", state.user?.username || "None");
  });

  // Call unsubscribe() when you no longer need the subscription
  return unsubscribe;
}

// Example 3: Performing login outside React component
export async function performLogin(identifier: string, password: string) {
  const { login } = useAuthStore.getState();
  return await login({ identifier, password });
}

// Example 4: Check if user has admin role
export function isAdminUser(): boolean {
  const { user, isAuthenticated } = useAuthStore.getState();
  return isAuthenticated && user?.role === "admin";
}

// Example 5: Get current user info
export function getCurrentUser() {
  const { user, isAuthenticated } = useAuthStore.getState();

  if (!isAuthenticated || !user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  };
}

/*
// Example of React component using the useAuth hook:

import { useAuth } from '@/hooks/useAuth';

export function AuthExample() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.username}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>
          <p>Please log in</p>
          <button 
            onClick={() => login({ 
              identifier: 'admin@evcharging.com', 
              password: 'admin123' 
            })}
          >
            Login
          </button>
        </div>
      )}
    </div>
  );
}

// Example of using the store directly in a React component:

import { useAuthStore } from '@/stores/authStore';

export function DirectStoreExample() {
  // Get specific state values
  const user = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  
  // Get specific actions
  const login = useAuthStore(state => state.login);
  const logout = useAuthStore(state => state.logout);
  
  return (
    <div>
      <p>User: {user?.username || 'Not logged in'}</p>
      <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
    </div>
  );
}
*/
