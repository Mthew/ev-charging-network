import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, generateToken, createAuthResponse } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const { identifier, password } = loginSchema.parse(body);

    // Authenticate user
    const user = await authenticateUser(identifier, password);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid credentials'
        },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    });

    // Create response with httpOnly cookie
    const authResponse = createAuthResponse(token, user);

    const response = NextResponse.json(authResponse.data);

    // Set httpOnly cookie
    response.cookies.set(
      authResponse.cookie.name,
      authResponse.cookie.value,
      authResponse.cookie.options
    );

    return response;

  } catch (error) {
    console.error('Login error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid request data',
          errors: error.issues
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
