import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedServer, refreshAccessToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  // Only run middleware for API routes that need authentication
  if (request.nextUrl.pathname.startsWith('/api/docs')) {
    const accessToken = request.cookies.get('access_token')?.value;

    if (accessToken) {
      try {
        const isValid = await isAuthenticatedServer(accessToken);

        if (!isValid) {
          const refreshResponse = await refreshAccessToken(request);

          if (refreshResponse) {
            return refreshResponse;
          } else {
          }
        }
      } catch (error) {
        console.error('❌ Middleware: Token validation error:', error);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/docs-tree', '/api/docs-content']
};
