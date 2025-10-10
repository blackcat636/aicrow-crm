import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isAuthenticatedServer, refreshAccessToken } from './lib/auth';

// Define protected routes that require module access
const PROTECTED_ROUTES = [
  '/users',
  '/documentation'
];

// Check if route requires module protection
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
}

// Get module key from route
function getModuleKeyFromRoute(pathname: string): string | null {
  const routeMap: Record<string, string> = {
    '/users': 'users',
    '/documentation': 'documentation'
  };

  for (const [route, moduleKey] of Object.entries(routeMap)) {
    if (pathname === route || pathname.startsWith(route + '/')) {
      return moduleKey;
    }
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')?.value;
  const isAuth = await isAuthenticatedServer(accessToken);
  const isLoginPage = request.nextUrl.pathname === '/login';
  const pathname = request.nextUrl.pathname;

  // If token is not valid, try to refresh it using refresh token
  if (!isAuth) {
    const refreshedResponse = await refreshAccessToken(request);
    if (refreshedResponse) {
      return refreshedResponse;
    }
  }

  // If user is not authenticated and trying to access non-login page
  if (!isAuth && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is authenticated and trying to access login page
  if (isAuth && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Module-based route protection
  if (isAuth && isProtectedRoute(pathname)) {
    const moduleKey = getModuleKeyFromRoute(pathname);

    if (moduleKey) {
      // In a real implementation, you would:
      // 1. Fetch user's module permissions from your backend
      // 2. Check if the user has access to this module
      // 3. Redirect to unauthorized page if no access
      // For now, we'll let the client-side ModuleRouteGuard handle this
      // This is because we need the modules store to be initialized
    }
  }

  return NextResponse.next();
}

// Configuration for which paths middleware will be called
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
