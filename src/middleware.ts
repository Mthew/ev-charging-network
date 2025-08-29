import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest, hasRole } from "@/lib/auth";

// Define protected routes
const protectedRoutes: string[] = []; // Dashboard handles its own authentication
const adminOnlyRoutes: string[] = []; // Dashboard handles its own role checking

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Note: /dashboard route is not protected here because it handles
  // authentication internally with a better UX (shows login form directly)

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Get user from request
  const user = getUserFromRequest(request);

  // If no user is authenticated, redirect to login
  if (!user) {
    const loginUrl = new URL("/dashboard/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check admin-only routes
  const isAdminOnlyRoute = adminOnlyRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isAdminOnlyRoute && !hasRole(user, "admin")) {
    // Redirect non-admin users to unauthorized page or home
    const unauthorizedUrl = new URL("/", request.url);
    unauthorizedUrl.searchParams.set("error", "unauthorized");
    return NextResponse.redirect(unauthorizedUrl);
  }

  // Add user info to headers for API routes
  const response = NextResponse.next();
  response.headers.set("x-user-id", user.id);
  response.headers.set("x-user-role", user.role);

  return response;
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
