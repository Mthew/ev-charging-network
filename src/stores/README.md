# Zustand Auth Store Setup

This project now uses Zustand for auth state management, providing a more robust and scalable solution for handling authentication state across the application.

## Features

✅ **Persistent Authentication**: Sessions persist across browser refreshes using sessionStorage
✅ **Optimized Re-renders**: Components only re-render when the auth state they use changes
✅ **Server-Side Compatible**: Handles SSR/hydration properly
✅ **Backwards Compatible**: Existing `useAuth` hook still works
✅ **Type Safe**: Full TypeScript support
✅ **External Usage**: Can be used outside React components

## Files Structure

```
src/
├── stores/
│   ├── authStore.ts          # Main Zustand auth store
│   └── authStore.example.ts  # Usage examples
└── hooks/
    └── useAuth.ts            # Updated to use Zustand store
```

## Usage

### 1. Using the useAuth Hook (Recommended)

```tsx
import { useAuth } from "@/hooks/useAuth";

function MyComponent() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.username}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button
          onClick={() => login({ identifier: "email", password: "pass" })}
        >
          Login
        </button>
      )}
    </div>
  );
}
```

### 2. Using the Store Directly (Advanced)

```tsx
import { useAuthStore } from "@/stores/authStore";

function MyComponent() {
  // Only re-render when user changes
  const user = useAuthStore((state) => state.user);

  // Only re-render when authentication status changes
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Get actions
  const login = useAuthStore((state) => state.login);

  return <div>User: {user?.username}</div>;
}
```

### 3. Outside React Components

```ts
import { useAuthStore } from "@/stores/authStore";

// Check auth status
const { isAuthenticated, user } = useAuthStore.getState();

// Perform login
const { login } = useAuthStore.getState();
await login({ identifier: "email", password: "password" });

// Subscribe to changes
const unsubscribe = useAuthStore.subscribe((state) => {
  console.log("Auth changed:", state.isAuthenticated);
});
```

## Store Structure

### State

- `user: User | null` - Current authenticated user
- `isLoading: boolean` - Loading state for auth operations
- `isAuthenticated: boolean` - Authentication status

### Actions

- `setLoading(loading: boolean)` - Set loading state
- `setUser(user: User | null)` - Set current user
- `clearAuth()` - Clear auth state
- `checkAuth()` - Verify authentication with server
- `login(credentials)` - Authenticate user
- `logout()` - Log out user

## Benefits of Zustand

1. **Smaller Bundle Size**: Much lighter than Redux
2. **Less Boilerplate**: No providers, reducers, or actions needed
3. **Better Performance**: Fine-grained subscriptions prevent unnecessary re-renders
4. **DevTools Support**: Works with Redux DevTools
5. **SSR Friendly**: Handles hydration properly
6. **Flexible**: Can be used with or without React

## Persistence

The auth store automatically persists:

- `user` - Current user data
- `isAuthenticated` - Authentication status

**Note**: `isLoading` is not persisted to prevent showing stale loading states on page refresh.

## Migration from useState

All existing components using `useAuth()` will continue to work without changes. The hook now internally uses the Zustand store, providing better performance and persistence.

## Environment Setup

Make sure your environment variables are configured:

- `JWT_SECRET` - For token signing/verification
- API routes at `/api/auth/*` should be working

## Demo Credentials

- Admin: `admin@evcharging.com` / `admin123`
- User: `demo@evcharging.com` / `demo123`
