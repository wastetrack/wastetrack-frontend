// In middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtDecode } from "jwt-decode";

// Define protected routes outside the middleware function
const PROTECTED_ROUTES = {
  '/dashboard/customer': ['customer'],
  '/dashboard/collector-central': ['collector-central'],
  '/dashboard/collector-unit': ['collector-unit'],
  '/dashboard/offtaker': ['industry'],
  '/dashboard/wastebank-central': ['wastebank-central'],
  '/dashboard/wastebank-unit': ['wastebank-unit']
} as const;

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  
  let userRole: string | null = null;
  
  if (token) {
    try {
      const decoded = jwtDecode<{ role: string }>(token);
      userRole = decoded.role;
    } catch {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  const path = request.nextUrl.pathname;
  const isProtectedRoute = Object.keys(PROTECTED_ROUTES).includes(path);

  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    const allowedRoles = PROTECTED_ROUTES[path as keyof typeof PROTECTED_ROUTES] as readonly string[];
    if (!userRole || !allowedRoles.includes(userRole)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/protected/:path*',
    '/((?!auth|_next/static|_next/image|favicon.ico).*)',
  ]
}