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
          console.log('🔄 Middleware: Token expired, attempting to refresh...');
          const refreshResponse = await refreshAccessToken(request);

          if (refreshResponse) {
            console.log('✅ Middleware: Token refreshed successfully');
            return refreshResponse;
          } else {
            console.log('❌ Middleware: Failed to refresh token');
          }
        }
      } catch (error) {
        console.log('❌ Middleware: Token validation error:', error);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/docs-tree', '/api/docs-content']
};
