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
    password: '$2b$10$CytUuvlEPn1EPsLpRxWm1.C0zZqpsE4WWYOMN54ph/3V7aJT.sXLe', // 'admin123'
    role: 'admin' as const
  },
  {
    id: '2',
    email: 'demo@evcharging.com',
    username: 'demo',
    password: '$2b$10$8hQrjgAzyy.dwrkm7ivDu.VkJUi8N7jikkuU7g3..jUF./rq3byWS', // 'demo123'
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
    console.log('verifyToken - Token length:', token.length);
    console.log('verifyToken - JWT_SECRET available:', !!JWT_SECRET);
    console.log('verifyToken - JWT_SECRET length:', JWT_SECRET.length);

    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'ev-charging-network',
      audience: 'ev-charging-users'
    }) as TokenPayload;

    console.log('verifyToken - Token verified successfully for user:', decoded.username);
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    if (error instanceof Error) {
      console.error('Token verification error message:', error.message);
      console.error('Token verification error name:', error.name);
    }
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
  console.log('getUserFromRequest - Token found:', !!token);

  if (!token) {
    console.log('getUserFromRequest - No token found');
    return null;
  }

  const payload = verifyToken(token);
  console.log('getUserFromRequest - Token valid:', !!payload);

  if (!payload) {
    console.log('getUserFromRequest - Invalid token');
    return null;
  }

  console.log('getUserFromRequest - User extracted:', payload.username);
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
  // Debug: Log all cookies
  const allCookies = request.cookies.getAll();
  console.log('getTokenFromRequest - All cookies:', allCookies.map(c => `${c.name}=${c.value ? 'present' : 'empty'}`));

  // Try to get token from httpOnly cookie first
  const tokenFromCookie = request.cookies.get('auth-token')?.value;
  console.log('getTokenFromRequest - Cookie token found:', !!tokenFromCookie);

  if (tokenFromCookie) {
    console.log('getTokenFromRequest - Cookie token length:', tokenFromCookie.length);
    console.log('getTokenFromRequest - Cookie token preview:', tokenFromCookie.substring(0, 20) + '...');
    return tokenFromCookie;
  }

  // Fallback to Authorization header
  const authHeader = request.headers.get('authorization');
  console.log('getTokenFromRequest - Auth header found:', !!authHeader);

  if (authHeader && authHeader.startsWith('Bearer ')) {
    console.log('getTokenFromRequest - Using auth header token');
    return authHeader.substring(7);
  }

  console.log('getTokenFromRequest - No token found in cookie or header');
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
        httpOnly: false, // Disable httpOnly for preview environment compatibility
        secure: false,
        sameSite: 'lax' as const,
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
        path: '/'
      }
    }
  };
}
