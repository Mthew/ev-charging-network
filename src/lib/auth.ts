import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

export interface User {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'user';
}

export interface TokenPayload {
  userId: string;
  email: string;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = '7d'; // Token expires in 7 days

// Demo users - In production, this would be in your database
const DEMO_USERS = [
  {
    id: '1',
    email: 'admin@evcharging.com',
    username: 'admin',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'admin123'
    role: 'admin' as const
  },
  {
    id: '2',
    email: 'demo@evcharging.com',
    username: 'demo',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'demo123'
    role: 'user' as const
  }
];

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare a password with its hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(user: Omit<User, 'id'> & { userId: string }): string {
  const payload: TokenPayload = {
    userId: user.userId,
    email: user.email,
    username: user.username,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'ev-charging-network',
    audience: 'ev-charging-users'
  });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'ev-charging-network',
      audience: 'ev-charging-users'
    }) as TokenPayload;

    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Authenticate user with email/username and password
 */
export async function authenticateUser(identifier: string, password: string): Promise<User | null> {
  // Find user by email or username
  const user = DEMO_USERS.find(u =>
    u.email === identifier || u.username === identifier
  );

  if (!user) {
    return null;
  }

  // Check password
  const isValidPassword = await comparePassword(password, user.password);
  if (!isValidPassword) {
    return null;
  }

  // Return user without password
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role
  };
}

/**
 * Get user from JWT token in request
 */
export function getUserFromRequest(request: NextRequest): User | null {
  const token = getTokenFromRequest(request);
  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  return {
    id: payload.userId,
    email: payload.email,
    username: payload.username,
    role: payload.role as 'admin' | 'user'
  };
}

/**
 * Extract JWT token from request (from cookie or Authorization header)
 */
export function getTokenFromRequest(request: NextRequest): string | null {
  // Try to get token from httpOnly cookie first
  const tokenFromCookie = request.cookies.get('auth-token')?.value;
  if (tokenFromCookie) {
    return tokenFromCookie;
  }

  // Fallback to Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

/**
 * Check if user has required role
 */
export function hasRole(user: User, requiredRole: 'admin' | 'user'): boolean {
  if (requiredRole === 'user') {
    return user.role === 'admin' || user.role === 'user';
  }
  return user.role === requiredRole;
}

/**
 * Generate secure random string for secrets
 */
export function generateSecretKey(): string {
  return jwt.sign({}, 'temp', { expiresIn: '1s' }).split('.')[1] +
         jwt.sign({}, 'temp', { expiresIn: '1s' }).split('.')[1];
}

/**
 * Create authentication response with httpOnly cookie
 */
export function createAuthResponse(token: string, user: User) {
  const response = {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    },
    message: 'Authentication successful'
  };

  return {
    data: response,
    cookie: {
      name: 'auth-token',
      value: token,
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
        path: '/'
      }
    }
  };
}
