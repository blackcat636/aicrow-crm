import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedServer, refreshAccessToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public routes
  const publicRoutes = ['/login', '/api/telegram/webhook'];
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Skip middleware for static files and API routes that don't need auth
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/api/docs') ||
    pathname.includes('.')
  ) {
    // Handle API docs routes with authentication
    if (pathname.startsWith('/api/docs')) {
      const accessToken = request.cookies.get('access_token')?.value;

      if (accessToken) {
        try {
          const isValid = await isAuthenticatedServer(accessToken);

          if (!isValid) {
            const refreshResponse = await refreshAccessToken(request);

            if (refreshResponse) {
              return refreshResponse;
            }
          }
        } catch (error) {
          console.error('❌ Middleware: Token validation error:', error);
        }
      }
    }

    return NextResponse.next();
  }

  // Check authentication for protected routes
  const accessToken = request.cookies.get('access_token')?.value;
  let isAuthenticated = false;

  // If access token is missing, try to refresh using refresh_token + device_id
  if (!accessToken) {
    try {
      const refreshResponse = await refreshAccessToken(request);
      if (refreshResponse) {
        return refreshResponse;
      }
    } catch (error) {
      console.error('❌ Middleware: Refresh attempt when access token missing failed:', error);
    }
  } else {
    try {
      // Simple JWT validation without external dependencies
      const parts = accessToken.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(
          atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
        );
        const now = Math.floor(Date.now() / 1000);

        // Check if token has not expired
        if (payload.exp && payload.exp > now) {
          isAuthenticated = true;
        }
      }

      // If token is expired, try to refresh
      if (!isAuthenticated) {
        const refreshResponse = await refreshAccessToken(request);
        if (refreshResponse) {
          return refreshResponse;
        }
      }
    } catch (error) {
      console.error('❌ Middleware: Authentication error:', error);
    }
  }

  // Handle root path redirects
  if (pathname === '/') {
    if (!isAuthenticated) {
      // Redirect unauthenticated users to login
      return NextResponse.redirect(new URL('/login', request.url));
    } else {
      // Redirect authenticated users to users page
      return NextResponse.redirect(new URL('/users', request.url));
    }
  }

  // Redirect to login if not authenticated for other protected routes
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
};
