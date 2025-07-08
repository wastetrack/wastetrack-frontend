// In middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

// Define protected routes outside the middleware function
const PROTECTED_ROUTES = {
  '/customer': ['customer'],
  '/collector-central': ['waste_collector_central'],
  '/collector-unit': ['waste_collector_unit'],
  '/offtaker': ['industry'],
  '/wastebank-central': ['waste_bank_central'],
  '/wastebank-unit': ['waste_bank_unit'],
} as const;

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value; // Ambil refresh token dari cookie
  let userRole: string | null = null;

  if (token) {
    try {
      const decoded = jwtDecode<{
        role: string;
        exp: number;
        iat: number;
        nbf: number;
      }>(token);

      userRole = decoded.role;

      // Debug logs for token timing
      console.log('Token timing:', {
        issuedAt: new Date(decoded.iat * 1000).toLocaleString(),
        notBefore: new Date(decoded.nbf * 1000).toLocaleString(),
        expiresAt: new Date(decoded.exp * 1000).toLocaleString(),
        timeUntilExpiry:
          Math.round((decoded.exp * 1000 - Date.now()) / 1000 / 60) +
          ' minutes',
      });

      console.log('Full decoded token:', decoded);
      console.log('Authorization check - User Role:', userRole);

      const now = Date.now() / 1000;
      const isTokenValid = decoded.exp > now;

      // Cek juga refresh token harus ada
      if (
        request.nextUrl.pathname === '/auth/login' &&
        userRole &&
        refreshToken
      ) {
        const roleBasedRedirect: Record<string, string> = {
          customer: '/customer',
          waste_collector_central: '/collector-central',
          waste_collector_unit: '/collector-unit',
          industry: '/offtaker',
          waste_bank_central: '/wastebank-central',
          waste_bank_unit: '/wastebank-unit',
        };
        const redirectPath = roleBasedRedirect[userRole] || '/dashboard';
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    } catch (error) {
      console.error('Token decode error:', error);
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  } else {
    console.log('No token found in request');
  }

  const path = request.nextUrl.pathname;
  const isProtectedRoute = Object.keys(PROTECTED_ROUTES).includes(path);

  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    const allowedRoles = PROTECTED_ROUTES[
      path as keyof typeof PROTECTED_ROUTES
    ] as readonly string[];
    if (!userRole || !allowedRoles.includes(userRole)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/:path*/dashboard',
    '/api/protected/:path*',
    '/((?!auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
